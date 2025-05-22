import { Controller, Get } from '@nestjs/common';
import { Agent1Service } from './agent1.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('Bob-Agent')
export class Agent1Controller {
  constructor(private readonly agent1Service: Agent1Service) {}

  @Get('initialize-bob')
  @ApiOperation({ summary: 'Initialize the Bob' })
  async initializeBobAgent() {
    const agent = await this.agent1Service.initializeBobAgent();
    return {
      message: 'Bob agent initialized',
      agentdata: {
        label: agent.data.config.label,
        walletId: agent.data.config?.walletConfig?.id,
        endpoints: agent.data.config.endpoints,
      },
    };
  }
}
