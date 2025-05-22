import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { Agent1Module } from '../agent1/agent1.module';
import { ConnectionController } from './connection.controller';
import { Agent2Module } from '../agent2/agent2.module';

@Module({
  imports: [Agent1Module, Agent2Module],
  providers: [ConnectionService],
  exports: [ConnectionService],
  controllers: [ConnectionController],
})
export class ConnectionModule {}
