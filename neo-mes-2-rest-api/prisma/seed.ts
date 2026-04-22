import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ──────────────────────────────────────────────
  // Motan Silo-Nodes (38 Silos × 4 Felder = 152 Einträge)
  // ──────────────────────────────────────────────

  const siloFields = ['Artikelnummer', 'Vorrat', 'Charge', 'Priority'];

  for (let silo = 1; silo <= 38; silo++) {
    for (const field of siloFields) {
      await prisma.opcuaNode.upsert({
        where: {
          connection_group_index_field: {
            connection: 'Motan_Convey',
            group: 'Silo',
            index: silo,
            field,
          },
        },
        update: {},
        create: {
          connection: 'Motan_Convey',
          group: 'Silo',
          index: silo,
          field,
          rootNodeId: 'ns=3;s=ServerInterfaces',
          browsePath: `/4:METROnet_Convey/4:OPC_Daten/4:Silo/4:[${silo}]/4:${field}`,
          label: field,
        },
      });
    }

    // LSS pro Silo (4 Stück, je MAT_Nr + Benutzt)
    for (let lss = 1; lss <= 4; lss++) {
      for (const lssField of ['MAT_Nr', 'Benutzt']) {
        await prisma.opcuaNode.upsert({
          where: {
            connection_group_index_field: {
              connection: 'Motan_Convey',
              group: `Silo_${silo}_LSS`,
              index: lss,
              field: lssField,
            },
          },
          update: {},
          create: {
            connection: 'Motan_Convey',
            group: `Silo_${silo}_LSS`,
            index: lss,
            field: lssField,
            rootNodeId: 'ns=3;s=ServerInterfaces',
            browsePath: `/4:METROnet_Convey/4:OPC_Daten/4:Silo/4:[${silo}]/4:LSS/4:[${lss}]/4:${lssField}`,
            label: `LSS[${lss}].${lssField}`,
          },
        });
      }
    }
  }

  console.log('Motan Silo-Nodes angelegt');

  // ──────────────────────────────────────────────
  // Beispiel: Linie 201 Auftragsdaten
  // ──────────────────────────────────────────────

  const linie201Fields = [
    'FA_Nummer',
    'Befehl',
    'Gebinde_Anfahr_Stk_Soll',
    'Gebinde_Anfahr_m',
    'Gebinde_Standard_Stk_Soll',
    'Gebinde_Standard_Soll_m',
    'Gebinde_Restlaenge_Stk_Soll',
    'Gebinde_Restlaenge_Soll_m',
    'MPara_SID',
    'DA_Min',
    'DA_Max',
    'Wand_Min',
    'Wand_Max',
    'Laenge_MIN',
    'Laenge_MAX',
    'Ovalitaet_Max',
    'Ruesten_ID',
    'AuftragsID_MES',
    'LinienID_Endfertigung',
    'Position_Endfertigung',
  ];

  for (const field of linie201Fields) {
    await prisma.opcuaNode.upsert({
      where: {
        connection_group_index_field: {
          connection: 'Linie_201',
          group: 'Auftragsdaten',
          index: 201,
          field,
        },
      },
      update: {},
      create: {
        connection: 'Linie_201',
        group: 'Auftragsdaten',
        index: 201,
        field,
        rootNodeId: 'ns=3;s="Linie201_HEX"',
        browsePath: `/3:DataBlocksGlobal/3:MES/3:Auftragsdaten/3:Produkt/3:DATA/3:${field}`,
        label: field,
      },
    });
  }

  console.log('Linie 201 Auftragsdaten-Nodes angelegt');

  // ──────────────────────────────────────────────
  // Silo Stammdaten
  // ──────────────────────────────────────────────

  for (let silo = 1; silo <= 38; silo++) {
    await prisma.silo.upsert({
      where: { nummer: silo },
      update: {},
      create: {
        nummer: silo,
        bezeichnung: `Silo ${silo}`,
      },
    });
  }

  console.log('Silo Stammdaten angelegt');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
