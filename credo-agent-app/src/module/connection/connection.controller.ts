import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { OutOfBandRecord } from '@credo-ts/core';
import { ApiOperation } from '@nestjs/swagger';

@Controller('connection')
export class ConnectionController {
  constructor(private readonly connectionservice: ConnectionService) {}

  @Post('create-invitation')
  @ApiOperation({ summary: 'Create a connection invitation .' })
  async createInvitation() {
    return await this.connectionservice.createInvitation();
  }

  @Get('receive-invitation')
  @ApiOperation({ summary: 'Receive a connection invitation.' })
  async receiveInvitation(@Query('invitationUrl') invitationUrl: string) {
    if (!invitationUrl || typeof invitationUrl !== 'string') {
      throw new Error('Missing or invalid invitationUrl query parameter');
    }
    const record =
      await this.connectionservice.receiveInvitation(invitationUrl);
    return { status: 'received', record };
  }

  @Get('acme-connectionId')
  async getAcmeConnectionId(@Query('id') id: string) {
    const result = await this.connectionservice.getConnectionId(id);
    return result;
  }
}
