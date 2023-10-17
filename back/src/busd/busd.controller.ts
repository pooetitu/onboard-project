import { Controller, Delete, Get, Param } from '@nestjs/common';
import { BusdService } from './busd.service';

@Controller()
export class BusdController {
  constructor(private readonly busdService: BusdService) {}

  @Get('/allowance/:address')
  async getAllowance(@Param('address') address: string) {
    return await this.busdService.getApprovalsByAddress(address);
  }
  @Get()
  async getLastActions() {
    return await this.busdService.getLastActions();
  }

  @Get('/:address')
  async getUserLastActions(@Param('address') address: string) {
    return await this.busdService.getLastActionsByAddress(address);
  }

  @Delete()
  clearActions() {
    this.busdService.deleteAll();
  }
}
