import { Injectable, ConflictException, NotFoundException, HttpStatus } from '@nestjs/common';
import {
  Agent,
  InitConfig,
  HttpOutboundTransport,
  WsOutboundTransport,
  ConnectionsModule,
  OutOfBandModule,
  DidsModule,
  CredentialsModule,
  V2CredentialProtocol,
} from '@credo-ts/core';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';
import { AskarModule } from '@credo-ts/askar';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import { indyVdr } from '@hyperledger/indy-vdr-nodejs';
import {
  IndyVdrModule,
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidRegistrar,
  IndyVdrIndyDidResolver,
} from '@credo-ts/indy-vdr';
import {
  AnonCredsModule,
  AnonCredsCredentialFormatService,
  LegacyIndyCredentialFormatService,
} from '@credo-ts/anoncreds';
import { genesisTransaction } from 'src/utils/genesis';
import { OpenId4VcVerifierModule } from '@credo-ts/openid4vc';

@Injectable()
export class Agent2Service {
  public agent: Agent;
  async initializeAcmeAgent() {
    try {
      if (this.agent) {
        throw new ConflictException({
          message: 'Agent Acme is already initialized.',
        });
      }

      const config: InitConfig = {
        label: 'demo-agent-acme',
        walletConfig: {
          id: 'mainAcme',
          key: 'demoagentacme0000000000000000000',
        },
        endpoints: ['http://localhost:3001'],
      };

      const agent = new Agent({
        config,
        dependencies: agentDependencies,
        modules: {
          askar: new AskarModule({ ariesAskar }),
          connections: new ConnectionsModule({ autoAcceptConnections: true }),
          oob: new OutOfBandModule(),
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
          credentials: new CredentialsModule({
            credentialProtocols: [
              new V2CredentialProtocol({
                credentialFormats: [
                  new LegacyIndyCredentialFormatService(),
                  new AnonCredsCredentialFormatService(),
                ],
              }),
            ],
          }),
          openId4VcVerifier: new OpenId4VcVerifierModule({
            baseUrl: 'http://127.0.0.1:3001',
          }),
        },
      });

      agent.registerOutboundTransport(new WsOutboundTransport());
      agent.registerOutboundTransport(new HttpOutboundTransport());
      agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }));

      await agent.initialize();
      console.log('Acme is successfully initialized');
      this.setAgent(agent);
      return {
        statusCode: HttpStatus.OK,
        message: 'Acme agent initialized',
        data: agent,
      };
    } catch (error) {
      throw error;
    }
  }
  private setAgent(agent: Agent) {
    this.agent = agent;
  }
  public getAgent(): Agent {
        if (!this.agent) {
          throw new NotFoundException(
            'Acme agent not initialized.',
          );
        }
    return this.agent;
  }
}
