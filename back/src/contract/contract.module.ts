import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnownBlockEntity } from './known-block.entity';
import { ContractService } from './contract.service';
import { ContractGateway } from './contract.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([KnownBlockEntity])],
  providers: [ContractGateway, ContractService],
  exports: [ContractService],
})
export class ContractModule {}
