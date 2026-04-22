import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  AttributeIds,
  ClientSession,
  ClientSubscription,
  DataValue,
  makeBrowsePath,
  OPCUAClient,
  TimestampsToReturn,
} from 'node-opcua';
import { PrismaService } from '../prisma/prisma.service';
import { OPCUA_ENDPOINTS } from './opcua-config';

// ──────────────────────────────────────────────
// Typen
// ──────────────────────────────────────────────

interface OpcuaConnection {
  name: string;
  type: string;
  client: OPCUAClient;
  session: ClientSession;
  subscription: ClientSubscription;
}

export interface CachedValue {
  value: any;
  updatedAt: Date;
}

@Injectable()
export class OpcuaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OpcuaService.name);
  private connections = new Map<string, OpcuaConnection>();
  private cache = new Map<string, CachedValue>();

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────

  async onModuleInit() {
    this.connectAll()
      .then(() => this.subscribeAll())
      .catch((err) => this.logger.error(`Init fehlgeschlagen: ${err.message}`));
  }

  async onModuleDestroy() {
    for (const conn of this.connections.values()) {
      await conn.subscription?.terminate();
      await conn.session?.close();
      await conn.client?.disconnect();
      this.logger.log(`Getrennt: ${conn.name}`);
    }
  }

  // ──────────────────────────────────────────────
  // Verbindungen aufbauen
  // ──────────────────────────────────────────────

  private async connectAll() {
    for (const ep of OPCUA_ENDPOINTS) {
      try {
        const client = OPCUAClient.create({
          applicationName: 'EgeplastMES',
          connectionStrategy: { initialDelay: 1000, maxRetry: 3 },
          endpointMustExist: false,
        });

        await client.connect(ep.url);
        const session = await client.createSession();
        const subscription = ClientSubscription.create(session, {
          requestedPublishingInterval: 1000,
          publishingEnabled: true,
        });

        this.connections.set(ep.name, {
          name: ep.name,
          type: ep.type,
          client,
          session,
          subscription,
        });

        this.logger.log(`Verbunden: ${ep.name} @ ${ep.url}`);
      } catch (err: any) {
        this.logger.error(`${ep.name} @ ${ep.url}: ${err.message}`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // Nodes aus DB laden, auflösen, subscriben
  // ──────────────────────────────────────────────

  private async subscribeAll() {
    const nodes = await this.prisma.opcuaNode.findMany();
    let subscribed = 0;
    let failed = 0;

    for (const node of nodes) {
      const conn = this.connections.get(node.connection);
      if (!conn) {
        this.logger.warn(
          `Keine Verbindung für ${node.connection}, überspringe ${node.group}[${node.index}].${node.field}`,
        );
        failed++;
        continue;
      }

      try {
        // Browse Path → Node-ID auflösen
        const nodeId = await this.resolveNodeId(conn, node);
        if (!nodeId) {
          failed++;
          continue;
        }

        // Cache-Key bauen
        const cacheKey = this.buildKey(
          node.connection,
          node.group,
          node.index,
          node.field,
        );

        // Subscription anlegen → bei Änderung Cache aktualisieren
        const item = await conn.subscription.monitor(
          { nodeId, attributeId: AttributeIds.Value },
          { samplingInterval: 1000, discardOldest: true, queueSize: 1 },
          TimestampsToReturn.Both,
        );

        item.on('changed', (dv: DataValue) => {
          this.cache.set(cacheKey, {
            value: dv.value.value,
            updatedAt: dv.sourceTimestamp ?? new Date(),
          });
        });

        subscribed++;
      } catch (err: any) {
        this.logger.error(
          `Fehler bei ${node.group}[${node.index}].${node.field}: ${err.message}`,
        );
        failed++;
      }
    }

    console.log(this.cache);
    this.logger.log(
      `Subscriptions: ${subscribed} aktiv, ${failed} fehlgeschlagen, ${nodes.length} gesamt`,
    );
  }

  private async resolveNodeId(
    conn: OpcuaConnection,
    node: {
      id: number;
      rootNodeId: string;
      browsePath: string;
      group: string;
      index: number;
      field: string;
    },
  ): Promise<string | null> {
    const bp = makeBrowsePath(node.rootNodeId, node.browsePath);
    const result = await conn.session.translateBrowsePath(bp);

    if (!result.targets?.length) {
      this.logger.warn(
        `Nicht aufgelöst: ${node.group}[${node.index}].${node.field}`,
      );
      return null;
    }

    const resolvedId = result.targets[0].targetId.toString();

    // Aufgelöste ID in DB speichern (zum Debuggen)
    await this.prisma.opcuaNode.update({
      where: { id: node.id },
      data: { resolvedId },
    });

    return resolvedId;
  }

  // ──────────────────────────────────────────────
  // Cache-Key Helpers
  // ──────────────────────────────────────────────

  private buildKey(
    connection: string,
    group: string,
    index: number,
    field: string,
  ): string {
    return `${connection}:${group}:${index}:${field}`;
  }

  private parseKey(key: string) {
    const [connection, group, index, field] = key.split(':');
    return { connection, group, index: +index, field };
  }

  // ──────────────────────────────────────────────
  // Öffentliche API — vom Controller aufgerufen
  // ──────────────────────────────────────────────

  /**
   * Einzelnes Element abfragen.
   *
   * getValues('Motan_Convey', 'Silo', 5)
   *   → { Artikelnummer: { value: '...', updatedAt: ... }, Vorrat: { ... } }
   *
   * getValues('Motan_Convey', 'Silo', 5, ['Artikelnummer', 'Vorrat'])
   *   → nur diese zwei Felder
   */
  getValues(
    connection: string,
    group: string,
    index: number,
    fields?: string[],
  ): Record<string, CachedValue> | null {
    const result: Record<string, CachedValue> = {};
    let found = false;

    for (const [key, cached] of this.cache) {
      const parsed = this.parseKey(key);
      if (parsed.connection !== connection) continue;
      if (parsed.group !== group) continue;
      if (parsed.index !== index) continue;
      if (fields?.length && !fields.includes(parsed.field)) continue;

      result[parsed.field] = cached;
      found = true;
    }

    return found ? result : null;
  }

  /**
   * Ganze Gruppe abfragen.
   *
   * getGroupValues('Motan_Convey', 'Silo')
   *   → { 1: { Artikelnummer: ..., Vorrat: ... }, 2: { ... }, ... }
   *
   * getGroupValues('Motan_Convey', 'Silo', ['Vorrat'])
   *   → { 1: { Vorrat: ... }, 2: { Vorrat: ... }, ... }
   */
  getGroupValues(
    connection: string,
    group: string,
    fields?: string[],
  ): Record<number, Record<string, CachedValue>> {
    const result: Record<number, Record<string, CachedValue>> = {};

    for (const [key, cached] of this.cache) {
      const parsed = this.parseKey(key);
      if (parsed.connection !== connection) continue;
      if (parsed.group !== group) continue;
      if (fields?.length && !fields.includes(parsed.field)) continue;

      if (!result[parsed.index]) result[parsed.index] = {};
      result[parsed.index][parsed.field] = cached;
    }

    return result;
  }
}
