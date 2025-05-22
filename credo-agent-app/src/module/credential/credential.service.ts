import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { issueCredentialDto } from './dto/credential';
import { Agent2Service } from '../agent2/agent2.service';
import {
  OpenId4VcVerificationSessionState,
  OpenId4VcVerificationSessionStateChangedEvent,
  OpenId4VcVerifierEvents,
} from '@credo-ts/openid4vc';
import { Agent1Service } from '../agent1/agent1.service';
import {
  CredentialEventTypes,
  CredentialState,
  CredentialStateChangedEvent,
} from '@credo-ts/core';

@Injectable()
export class CredentialService {
  constructor(
    private readonly acmeservice: Agent2Service,
    private readonly agent1Service: Agent1Service,
  ) {}

  async IssuingCredential(dto: issueCredentialDto) {
    try {
      const agent = this.acmeservice.getAgent();

      const indyCredentialExchangeRecord =
        await this.acmeservice.agent.credentials.offerCredential({
          protocolVersion: 'v2' as never,
          connectionId: dto.connectionId,
          credentialFormats: {
            indy: {
              credentialDefinitionId: dto.credentialDefinitionId,
              attributes: dto.attributes,
            },
          },
        });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Credential issued successfully',
        data: indyCredentialExchangeRecord,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to issue credential',
          error: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //holder accept the credential
  async acceptCredential() {
    try {
      const agent = this.agent1Service.getAgent();
      console.log(agent);
      agent.events.on<CredentialStateChangedEvent>(
        CredentialEventTypes.CredentialStateChanged,
        async ({ payload }) => {
          switch (payload.credentialRecord.state) {
            case CredentialState.OfferReceived:
              console.log('received a credential');
              await agent.credentials.acceptOffer({
                credentialRecordId: payload.credentialRecord.id,
              });
              break;
            case CredentialState.Done:
              console.log(
                `Credential for credential id ${payload.credentialRecord.id} is accepted`,
              );
          }
        },
      );
      const credentials = await agent.credentials.getAll();
      console.log(credentials);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error in accepting the offer');
    }
  }

  async verifingCredential() {
    try {
      const verifier = this.acmeservice.getAgent();
      const openId4VcVerifier =
        await verifier.modules.openId4VcVerifier.createVerifier({});
      const { authorizationRequest, verificationSession } =
        await verifier.modules.openId4VcVerifier.createAuthorizationRequest({
          verifierId: openId4VcVerifier.verifierId,
          requestSigner: {
            didUrl: 'did:indy:bcovrin:testnet:2ScuThZb3qN7YhtFkG5PVo',
            method: 'did',
          },
          presentationExchange: {
            definition: {
              id: '9ed05140-b33b-445e-a0f0-9a23aa501868',
              name: 'Student Verification',
              purpose:
                'We need to verify your student status to grant access to the student portal',
              input_descriptors: [
                {
                  id: '9c98fb43-6fd5-49b1-8dcc-69bd2a378f23',
                  constraints: {
                    limit_disclosure: 'required',
                    fields: [
                      {
                        filter: {
                          type: 'string',
                          const: 'Acme_verifier',
                        },
                        path: ['$.vct'],
                      },
                    ],
                  },
                },
              ],
            },
          },
        });

      // Subscribe to verification session events
      verifier.events.on<OpenId4VcVerificationSessionStateChangedEvent>(
        OpenId4VcVerifierEvents.VerificationSessionStateChanged,
        async (event) => {
          if (event.payload.verificationSession.id !== verificationSession.id)
            return;

          console.log(
            'Verification session state changed:',
            event.payload.verificationSession.state,
          );

          if (
            event.payload.verificationSession.state ===
            OpenId4VcVerificationSessionState.ResponseVerified
          ) {
            const verifiedAuthorizationResponse =
              await verifier.modules.openId4VcVerifier.getVerifiedAuthorizationResponse(
                verificationSession.id,
              );

            console.log(
              'Successfully verified presentation.',
              JSON.stringify(verifiedAuthorizationResponse, null, 2),
            );
          }
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'verification request created successfully',
        data: {
          authorizationRequest,
          verificationSessionId: verificationSession.id,
        },
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Credential verification initiation failed',
          error: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
