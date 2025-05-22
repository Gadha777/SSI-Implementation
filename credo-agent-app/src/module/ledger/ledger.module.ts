import { Module } from "@nestjs/common";
import { Agent1Service } from "../agent1/agent1.service";
import { LedgerService } from "./ledger.service";
import { LedgerController } from "./ledger.controller";
import { Agent2Module } from "../agent2/agent2.module";

@Module({
  imports: [Agent2Module],
  providers: [Agent1Service, LedgerService],
  controllers: [LedgerController],
})
export class ledgerModule {}