import { Controller, Get, Param } from '@nestjs/common';
import { VolumeService } from './volume.service';

@Controller('volume')
export class VolumeController {
  constructor(private readonly volumeService: VolumeService) {}

  @Get()
  async getVolume() {
    return await this.volumeService.getVolume();
  }
}
