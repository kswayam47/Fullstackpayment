import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PaymentEntity } from './payment.entity/payment.entity';

@WebSocketGateway({ cors: true })
export class PaymentsGateway {
  @WebSocketServer()
  server: Server;

  emitPaymentCreated(payment: PaymentEntity) {
    this.server.emit('paymentCreated', payment);
  }
} 