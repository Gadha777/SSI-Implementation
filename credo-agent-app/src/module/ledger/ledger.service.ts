import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Agent2Service } from '../agent2/agent2.service';
import { Agent, KeyType, TypedArrayEncoder } from '@credo-ts/core';
import { RegisterCredDefDto } from './dto/register-cred-def.dto';
import axios from 'axios';

@Injectable()
export class LedgerService {
  constructor(private readonly acmeservice: Agent2Service) {}

  async registerSchema(): Promise<unknown> {
    try {
      const agent = this.acmeservice.getAgent();
      if (!agent) {
        throw new BadRequestException('agent not initialized yet!');
      }
      await this.didRegisteration(
        agent,
        'indy',
        'bcovrin:testnet',
        '2ScuThZb3qN7YhtFkG5PVo',
        'f7a1d93e8b45c2d7e9f04a6b1c83e721',
      );
      const schema = await agent.modules.anoncreds.registerSchema({
        schema: {
          attrNames: ['Name', 'Course', 'PhoneNo'],
          issuerId: 'did:indy:bcovrin:testnet:2ScuThZb3qN7YhtFkG5PVo',
          name: 'Student Credential',
          version: '5.0.1',
        },
        options: {},
      }) ;

      return {
        statusCode: HttpStatus.CREATED,
        message: 'schema registered successfully',
        data: schema,
      };
    } catch (error) {}
  }

  private async didRegisteration(
    agent: Agent,
    method: string,
    namespace: string,
    did: string,
    seed: string,
  ): Promise<unknown> {
        const response = await axios.post(
          `http://test.bcovrin.vonx.io/register`,
          {
            role: 'ENDORSER',
            alias: 'Alias',
            seed: seed,
          },
        );

        if (response.data && response.data.did) {
          console.log('DID registered');
        }
    return await agent.dids.import({

      did: `did:${method}:${namespace}:${did}`,
      overwrite: true,
      privateKeys: [
        {
          keyType: KeyType.Ed25519,
          privateKey: TypedArrayEncoder.fromString(`${seed}`),
        },
      ],
    });
  }

  async registerCredentialDefinition(
    dto: RegisterCredDefDto,
  ): Promise<unknown> {
    try {
      const agent = this.acmeservice.getAgent();

      if (!agent) {
        throw new BadRequestException('agent not initialized yet!');
      }
      const result = await agent.modules.anoncreds.registerCredentialDefinition({
        credentialDefinition: {
          tag: 'default',
          issuerId: dto.issuerId,
          schemaId: dto.schemaId,
        },
        options: {
          supportRevocation: false,
        },
      });
      if (result.credentialDefinitionState.state === 'failed') {
        {
          throw new InternalServerErrorException(
            `error creating credential definition ${result.credentialDefinitionState}`,
          );
        }
      }
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Credential Definition created successfully ',
        data: result,
      };
    } catch (error) {
    throw new InternalServerErrorException(
      'Error in registering credential definition',
    );
    }
  }
}
