import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyVolumeEntity } from './daily-volume.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VolumeService {
  constructor(
    @InjectRepository(DailyVolumeEntity)
    private volumeRepository: Repository<DailyVolumeEntity>,
  ) {}

  async getVolume() {
    return this.volumeRepository
      .createQueryBuilder()
      .where("date > CURRENT_DATE - interval '365' day")
      .orderBy('date', 'DESC')
      .getMany();
  }

  async getVolumeByDate(date: Date) {
    return await this.volumeRepository.findOneBy({ date });
  }

  async saveAll(volume: DailyVolumeEntity[]) {
    return await this.volumeRepository.save(volume);
  }

  async update(date: Date, volume: { amount: string; transactions: number }) {
    await this.volumeRepository.update({ date }, volume);
  }
}
