import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { VolumeService } from './volume.service';
import { TransferEvent } from './event/transfer.event';
import { DailyVolumeEntity } from './daily-volume.entity';

@Injectable()
export class VolumeListener {
  constructor(private volumeService: VolumeService) {}

  @OnEvent('log.transfer')
  async saveVolume(transfers: TransferEvent[]) {
    const volumes = new Map<string, DailyVolumeEntity>();
    for (const transfer of transfers) {
      const dateMidnight = new Date(
        transfer.date.getFullYear(),
        transfer.date.getMonth(),
        transfer.date.getDate(),
      );
      const newVolume: DailyVolumeEntity = {
        date: dateMidnight,
        transactions: 1,
        amount: transfer.value,
      };
      let previousVolume = volumes.get(dateMidnight.toISOString());
      if (!previousVolume) {
        previousVolume = await this.volumeService.getVolumeByDate(dateMidnight);
        volumes.set(dateMidnight.toISOString(), previousVolume);
      }
      if (!previousVolume) {
        volumes.set(dateMidnight.toISOString(), newVolume);
        continue;
      }

      previousVolume.transactions += newVolume.transactions;
      previousVolume.amount = (
        BigInt(previousVolume.amount) + BigInt(newVolume.amount)
      ).toString();
    }
    await this.volumeService.saveAll(Array.from(volumes.values()));
  }
}
