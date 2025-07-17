import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentEntity } from './payment.entity/payment.entity';
import { UserEntity } from '../users/user.entity/user.entity';
import { PaymentsGateway } from './payments.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, UserEntity])],
  providers: [PaymentsService, PaymentsGateway],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
