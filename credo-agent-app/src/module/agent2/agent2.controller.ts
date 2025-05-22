import { Controller, Get, Post } from '@nestjs/common';
import { Agent2Service } from './agent2.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('Acme-Agent')
export class Agent2Controller {
  constructor(private readonly agent2Service: Agent2Service) {}

  @Get('initialize-acme')
  @ApiOperation({ summary: 'Initialize the Acme' })
  async initializeAcmeAgent() {
    const agent = await this.agent2Service.initializeAcmeAgent();
    return {
      message: 'Acme agent initialized',
      agentdata: {
        label: agent.data.config.label,
        walletId: agent.data.config?.walletConfig?.id,
        endpoints: agent.data.config.endpoints,
      },
    };
  }
}
