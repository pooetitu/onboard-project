import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Socket } from 'socket.io';
import { TransferEntity } from '../busd/transfer.entity';
import { AllowanceEntity } from '../busd/allowance.entity';

@WebSocketGateway({ cors: true })
export class ContractGateway {
  @WebSocketServer()
  server: Socket;

  @OnEvent('log.transfer')
  onTransfer(transfers: TransferEntity[]) {
    this.server.emit(
      'transfer',
      transfers.map((transfer) => ({
        ...transfer,
        type: 'Transfer',
      })),
    );
  }

  @OnEvent('log.approval')
  onApproval(allowances: AllowanceEntity[]) {
    this.server.emit(
      'approval',
      allowances.map((allowance) => ({ ...allowance, type: 'Approve' })),
    );
  }
}
