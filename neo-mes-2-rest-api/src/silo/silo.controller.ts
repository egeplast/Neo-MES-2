import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SiloService } from './silo.service';

@Controller('silo')
export class SiloController {
  constructor(private readonly siloService: SiloService) {}

  /** GET /api/silo — alle Silos mit Stammdaten */
  @Get()
  findAll() {
    return this.siloService.findAll();
  }

  /** GET /api/silo/5 — ein Silo mit Stammdaten */
  @Get(':nummer')
  findOne(@Param('nummer', ParseIntPipe) nummer: number) {
    return this.siloService.findOne(nummer);
  }
}
