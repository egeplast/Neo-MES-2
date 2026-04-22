import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface AuditEntry {
  userAzureId: string | null;
  userEmail: string | null;
  userDisplay: string | null;
  method: string;
  path: string;
  resource: string | null;
  resourceId: string | null;
  action: string;
  statusCode: number;
  payload: unknown;
  response: unknown;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly maxPayloadBytes = 64 * 1024;

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userAzureId: entry.userAzureId,
          userEmail: entry.userEmail,
          userDisplay: entry.userDisplay,
          method: entry.method,
          path: entry.path,
          resource: entry.resource,
          resourceId: entry.resourceId,
          action: entry.action,
          statusCode: entry.statusCode,
          payload: this.clampJson(entry.payload),
          response: this.clampJson(entry.response),
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (err) {
      this.logger.error("Audit write failed", err);
    }
  }

  private clampJson(
    value: unknown,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || value === undefined) return Prisma.JsonNull;
    try {
      const json = JSON.stringify(value);
      if (json.length <= this.maxPayloadBytes) {
        return value as Prisma.InputJsonValue;
      }
      return {
        _truncated: true,
        _originalSize: json.length,
        preview: json.slice(0, this.maxPayloadBytes),
      };
    } catch {
      return { _unserializable: true };
    }
  }
}
