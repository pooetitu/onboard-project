import { Injectable } from '@nestjs/common';
import { createPublicClient, parseAbi, PublicClient, webSocket } from 'viem';
import { polygonMumbai } from 'viem/chains';
import { Repository } from 'typeorm';
import { KnownBlockEntity } from './known-block.entity';
import { busdContract } from '../busd/busd.contract';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ContractService {
  private publicClient: PublicClient;
  private updatingContract = false;

  constructor(
    @InjectRepository(KnownBlockEntity)
    private contractUpdateRepository: Repository<KnownBlockEntity>,
    private eventEmitter: EventEmitter2,
  ) {
    this.connectPublicClient();
    this.fetchLastActions().then(() => this.watchActions());
  }

  private connectPublicClient() {
    this.publicClient = createPublicClient({
      chain: polygonMumbai,
      transport: webSocket(
        'wss://polygon-mumbai.infura.io/ws/v3/27051503de824552a932ba71cc0b5583',
      ),
    });
  }

  @Interval(3600000)
  private async fetchLastActions() {
    if (this.updatingContract) {
      return;
    }
    this.updatingContract = true;
    const currentBlock = await this.publicClient.getBlockNumber();
    let lastBlockUpdated = BigInt(process.env.CONTRACT_CREATION_BLOCK);

    while (lastBlockUpdated < currentBlock) {
      let toBlock = lastBlockUpdated + BigInt(process.env.LOG_BLOCKS);
      if (toBlock > currentBlock) {
        toBlock = currentBlock;
      }
      const fetchedLogs = await this.publicClient.getLogs({
        address: busdContract.contract,
        toBlock: toBlock,
        fromBlock: lastBlockUpdated,
        events: parseAbi([
          'event Approval(address indexed owner, address indexed sender, uint256 value)',
          'event Transfer(address indexed from, address indexed to, uint256 value)',
        ]),
      });
      await this.saveLogs(fetchedLogs);
      lastBlockUpdated += BigInt(process.env.LOG_BLOCKS);
    }
    this.updatingContract = false;
  }

  async saveKnownBlocks(contractUpdate: KnownBlockEntity[]) {
    return await this.contractUpdateRepository.save(contractUpdate);
  }

  async deleteAll() {
    await this.contractUpdateRepository.clear();
  }

  async getBlockDate(blockNumber: bigint) {
    return new Date(
      Number(
        (await this.publicClient.getBlock({ blockNumber })).timestamp *
          BigInt(1000),
      ),
    );
  }

  private async getSavedBlocks() {
    return (await this.contractUpdateRepository.find()).map(
      (block) => block.block,
    );
  }

  private watchActions() {
    this.publicClient.watchEvent({
      address: busdContract.contract,
      events: parseAbi([
        'event Approval(address indexed owner, address indexed sender, uint256 value)',
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ]),
      onLogs: async (logs) => await this.saveLogs(logs),
    });
  }

  private async saveLogs(fetchedLogs: any[]) {
    const savedBlocks = await this.getSavedBlocks();
    const unsavedLogs = fetchedLogs.filter(
      (log) => !savedBlocks.includes(log.blockNumber.toString()),
    );
    this.dispatchApprovals(unsavedLogs);
    await this.dispatchTransfers(unsavedLogs);
    const blocks = Array.from(
      new Set(unsavedLogs.map((log) => log.blockNumber.toString())),
    ).map((block) => ({ block }));
    await this.saveKnownBlocks(Array.from(blocks));
  }

  private async dispatchTransfers(unsavedLogs) {
    const transfers = await Promise.all(
      unsavedLogs
        .filter((log) => log.eventName.toLowerCase() === 'transfer')
        .map(async (log) => ({
          ...log.args,
          value: log.args.value.toString(),
          block: log.blockNumber.toString(),
          date: await this.getBlockDate(log.blockNumber),
        })),
    );
    if (transfers.length > 0) {
      await this.eventEmitter.emitAsync(`log.transfer`, transfers);
    }
  }

  private dispatchApprovals(unsavedLogs) {
    const approvals = unsavedLogs
      .filter((log) => log.eventName.toLowerCase() === 'approval')
      .map((log) => ({
        ...log.args,
        value: log.args.value.toString(),
        block: log.blockNumber.toString(),
      }));
    if (approvals.length > 0) {
      this.eventEmitter.emit(`log.approval`, approvals);
    }
  }
}
