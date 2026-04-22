import { Module } from '@nestjs/common';
import { Silodaten } from '@shared/interfaces/Silodaten.interface';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpcuaModule } from './opcua/opcua.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './services/audit/audit.module';
import { GraphModule } from './services/graph/graph.module';
import { SiloModule } from './silo/silo.module';

@Module({
  imports: [PrismaModule, AuditModule, GraphModule, OpcuaModule, SiloModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  i: Silodaten[] = [];
}
