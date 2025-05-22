import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  Agent,
  ConnectionsModule,
  DidsModule,
  HttpOutboundTransport,
  InitConfig,
  OutOfBandModule,
  WsOutboundTransport,
} from '@credo-ts/core';
import { AskarModule } from '@credo-ts/askar';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import { indyVdr } from '@hyperledger/indy-vdr-nodejs';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import {
  IndyVdrModule,
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidResolver,
  IndyVdrIndyDidRegistrar,
} from '@credo-ts/indy-vdr';
import { AnonCredsModule } from '@credo-ts/anoncreds';
import { genesisTransaction } from 'src/utils/genesis';

@Injectable()
export class Agent1Service {
  public agent: Agent;

  async initializeBobAgent() {
    try {
      if (this.agent) {
        throw new ConflictException({
          message: 'Agent Bob is already initialized.',
        });
      }
      const config: InitConfig = {
        label: 'docs-agent-Bob',
        walletConfig: {
          id: 'mainBob',
          key: 'demoagentbob00000000000000000000',
        },
        endpoints: ['http://localhost:3002'],
      };
      const agent = new Agent({
        config,
        dependencies: agentDependencies,
        modules: {
          indyVdr: new IndyVdrModule({
            indyVdr,
            networks: [
              {
                indyNamespace: 'bcovrin:testnet',
                genesisTransactions: genesisTransaction,
                isProduction: false,
                connectOnStartup: true,
              },
            ],
          }),
          anoncreds: new AnonCredsModule({
            anoncreds,
            registries: [new IndyVdrAnonCredsRegistry()],
          }),
          dids: new DidsModule({
            registrars: [new IndyVdrIndyDidRegistrar()],
            resolvers: [new IndyVdrIndyDidResolver()],
          }),
          askar: new AskarModule({ ariesAskar }),
          connections: new ConnectionsModule({ autoAcceptConnections: true }),
          oob: new OutOfBandModule(),
        },
      });

      agent.registerOutboundTransport(new WsOutboundTransport());
      agent.registerOutboundTransport(new HttpOutboundTransport());
      agent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }));

      await agent.initialize();
      this.setAgent(agent);
      console.log('Bob is initialized successfully');
      return {
        statusCode: HttpStatus.OK,
        message: 'User created successfully',
        data: agent,
      };
    } catch (error) {
      console.error('Error initializing Bob agent:', error);
      throw error;
    }
  }
  private setAgent(agent: Agent) {
    this.agent = agent;
  }
  public getAgent(): Agent {
    if (!this.agent) {
      throw new BadRequestException('Bob agent not initialized.');
    }
    return this.agent;
  }
}
