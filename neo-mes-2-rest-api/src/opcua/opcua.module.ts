import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OpcuaController } from './opcua.controller';
import { OpcuaService } from './opcua.service';

@Module({
  imports: [PrismaModule],
  controllers: [OpcuaController],
  providers: [OpcuaService],
  exports: [OpcuaService],
})
export class OpcuaModule {}
