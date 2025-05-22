import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { Agent2Module } from '../agent2/agent2.module'; 
import { Agent1Module } from '../agent1/agent1.module';

@Module({
  imports: [Agent2Module,Agent1Module],
  controllers: [CredentialController],
  providers: [CredentialService],
})
export class CredentialModule {}
