import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './services/audit/audit.module';
import { GraphModule } from './services/graph/graph.module';

@Module({
  imports: [PrismaModule, AuditModule, GraphModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
