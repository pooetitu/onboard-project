import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AllowanceEntity } from './allowance.entity';
import { TransferEntity } from './transfer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { ContractService } from '../contract/contract.service';
import {VolumeService} from "../volume/volume.service";

@Injectable()
export class BusdService {
  constructor(
    @InjectRepository(AllowanceEntity)
    private allowanceRepository: Repository<AllowanceEntity>,
    @InjectRepository(TransferEntity)
    private transferRepository: Repository<TransferEntity>,
    private readonly contractService: ContractService,
    private readonly volumeService: VolumeService,
  ) {}

  async getLastActions() {
    const [allowances, transfers] = await Promise.all([
      this.allowanceRepository
        .createQueryBuilder()
        .orderBy('block', 'DESC')
        .limit(10)
        .getMany(),
      this.transferRepository
        .createQueryBuilder()
        .orderBy('block', 'DESC')
        .limit(10)
        .getMany(),
    ]);

    const actions = [
      ...allowances.map((allowance) => ({ ...allowance, type: 'Approve' })),
      ...transfers.map((transfer) => ({ ...transfer, type: 'Transfer' })),
    ];
    return actions
      .sort((a, b) => Number(BigInt(b.block) - BigInt(a.block)))
      .slice(0, 10);
  }

  async getLastActionsByAddress(address: string) {
    const [allowances, transfers] = await Promise.all([
      this.allowanceRepository
        .createQueryBuilder()
        .where('AllowanceEntity.owner=:address', { address })
        .orWhere('AllowanceEntity.sender=:address', { address })
        .orderBy('block', 'DESC')
        .limit(10)
        .getMany(),
      this.transferRepository
        .createQueryBuilder()
        .where('TransferEntity.from=:address', { address })
        .orWhere('TransferEntity.to=:address', { address })
        .orderBy('block', 'DESC')
        .limit(10)
        .getMany(),
    ]);
    const actions = [
      ...allowances.map((allowance) => ({ ...allowance, type: 'Approve' })),
      ...transfers.map((transfer) => ({ ...transfer, type: 'Transfer' })),
    ];
    return actions
      .sort((a, b) => Number(BigInt(b.block) - BigInt(a.block)))
      .slice(0, 10);
  }

  async getApprovalsByAddress(address: string) {
    return (
      await this.allowanceRepository
        .createQueryBuilder()
        .distinctOn(['sender'])
        .where('owner=:address', { address })
        .orderBy('sender', 'DESC')
        .addOrderBy('block', 'DESC')
        .getMany()
    ).filter((allowance) => BigInt(allowance.value) > 0);
  }

  @OnEvent('log.approval')
  async saveAllowances(allowance: AllowanceEntity[]) {
    return await this.allowanceRepository.save(allowance);
  }

  @OnEvent('log.transfer')
  async saveTransfers(transfer: TransferEntity[]) {
    return await this.transferRepository.save(transfer);
  }

  deleteAll() {
    this.allowanceRepository.clear();
    this.transferRepository.clear();
    this.contractService.deleteAll();
    this.volumeService.deleteAll();
  }
}
