import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Agent1Module } from './module/agent1/agent1.module';
import { Agent2Module } from './module/agent2/agent2.module';
import { ConnectionModule } from './module/connection/connection.module';
import { ledgerModule } from './module/ledger/ledger.module';
import { CredentialModule } from './module/credential/credential.module';

@Module({
  imports: [Agent1Module, Agent2Module,ConnectionModule,ledgerModule,CredentialModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
