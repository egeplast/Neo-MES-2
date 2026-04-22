import { Controller, Get, Query } from '@nestjs/common';
import { OpcuaService } from './opcua.service';

@Controller('opcua')
export class OpcuaController {
  constructor(private readonly opcua: OpcuaService) {}

  /**
   * Generischer Live-Daten Endpoint.
   *
   * Alle Silos, nur Vorrat:
   *   GET /api/opcua/live?connection=Motan_Convey&group=Silo&fields=Vorrat
   *
   * Ein Silo, alle Felder:
   *   GET /api/opcua/live?connection=Motan_Convey&group=Silo&index=1
   *
   * Ein Silo, bestimmte Felder:
   *   GET /api/opcua/live?connection=Motan_Convey&group=Silo&index=1&fields=Artikelnummer,Vorrat
   *
   * Extruder einer Linie:
   *   GET /api/opcua/live?connection=Linie_201&group=Extruder&fields=MFL_Ges
   */
  @Get('live')
  getLive(
    @Query('connection') connection: string,
    @Query('group') group: string,
    @Query('index') index?: string,
    @Query('fields') fieldsParam?: string,
  ) {
    const fields = fieldsParam?.split(',') ?? undefined;

    if (index) {
      return this.opcua.getValues(connection, group, +index, fields);
    }

    return this.opcua.getGroupValues(connection, group, fields);
  }
}
