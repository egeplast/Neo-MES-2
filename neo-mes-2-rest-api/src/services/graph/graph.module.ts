import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';

@Module({
  imports: [ConfigModule],
  controllers: [GraphController],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}
