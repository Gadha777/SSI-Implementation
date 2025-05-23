import { Module } from '@nestjs/common';
import { Agent2Service } from './agent2.service';
import { Agent2Controller } from './agent2.controller';

@Module({
  controllers: [Agent2Controller],
  providers: [Agent2Service],
  exports: [Agent2Service],
})
export class Agent2Module {}
