import { Body, Controller, Get, Post } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { issueCredentialDto } from './dto/credential';
import { ApiOperation } from '@nestjs/swagger';

@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post('issue-credentials')
  @ApiOperation({ summary: 'Issueing the credential by issuer (acme).' })
  async offerCredential(@Body() issueCredentialDto: issueCredentialDto) {
    return this.credentialService.IssuingCredential(issueCredentialDto);
  }

  @Get('Accept-credentials')
  @ApiOperation({ summary: 'Accepting the credential by holder (Bob).' })
  async getCredential() {
    const result = await this.credentialService.acceptCredential();
    return result;
  }

  @Post('verify-credentials')
  @ApiOperation({ summary: 'verify the credentials' })
  async verifyCredential() {
    return await this.credentialService.verifingCredential();
  }
}
