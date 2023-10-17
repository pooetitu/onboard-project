import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyVolumeEntity } from './daily-volume.entity';
import { VolumeService } from './volume.service';
import { VolumeListener } from './volume.listener';
import { ContractModule } from '../contract/contract.module';
import { VolumeController } from './volume.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DailyVolumeEntity]), ContractModule],
  providers: [VolumeService, VolumeListener],
  exports: [VolumeService],
  controllers: [VolumeController],
})
export class VolumeModule {}
