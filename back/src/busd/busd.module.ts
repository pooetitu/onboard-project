import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllowanceEntity } from './allowance.entity';
import { TransferEntity } from './transfer.entity';
import { BusdService } from './busd.service';
import { BusdController } from './busd.controller';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AllowanceEntity, TransferEntity]),
    ContractModule,
  ],
  providers: [BusdService],
  controllers: [BusdController],
})
export class BusdModule {}
