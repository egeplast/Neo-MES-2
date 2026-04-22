import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SiloController } from './silo.controller';
import { SiloService } from './silo.service';

@Module({
  imports: [PrismaModule],
  controllers: [SiloController],
  providers: [SiloService],
})
export class SiloModule {}
