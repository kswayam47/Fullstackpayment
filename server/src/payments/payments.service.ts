import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { PaymentEntity } from './payment.entity/payment.entity';
import { UserEntity } from '../users/user.entity/user.entity';
import { PaymentsGateway } from './payments.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private paymentsGateway: PaymentsGateway,
  ) {}

  async createPayment(data: Partial<PaymentEntity> & { user?: UserEntity; receiverId?: number }): Promise<PaymentEntity> {
    if (!data.receiverId) throw new BadRequestException('Receiver is required');
    const receiver = await this.usersRepository.findOne({ where: { id: data.receiverId } });
    if (!receiver) throw new BadRequestException('Receiver not found');
    const payment = this.paymentsRepository.create({
      ...data,
      sender: data.user,
      receiver,
    });
    const saved = await this.paymentsRepository.save(payment);
    this.paymentsGateway.emitPaymentCreated(saved);
    return saved;
  }

  async getPayments(filters: {
    status?: 'success' | 'failed' | 'pending',
    method?: 'card' | 'bank' | 'wallet',
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number,
    user?: UserEntity,
    role?: string,
  }): Promise<{ data: PaymentEntity[]; total: number }> {
    let where: FindOptionsWhere<PaymentEntity>[] = [];
    if (filters.role !== 'admin' && filters.user) {
      let senderFilter: any = { sender: { id: filters.user.id } };
      let receiverFilter: any = { receiver: { id: filters.user.id } };
      if (filters.status) senderFilter.status = receiverFilter.status = filters.status;
      if (filters.method) senderFilter.method = receiverFilter.method = filters.method;
      if (filters.startDate && filters.endDate) {
        let start = filters.startDate.length > 10 ? new Date(filters.startDate) : new Date(filters.startDate + 'T00:00:00.000Z');
        let end = filters.endDate.length > 10 ? new Date(filters.endDate) : new Date(filters.endDate + 'T23:59:59.999Z');
        end = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));
        start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0, 0));
        senderFilter.createdAt = receiverFilter.createdAt = Between(start, end);
      }
      where = [senderFilter, receiverFilter];
    } else {
      const base: FindOptionsWhere<PaymentEntity> = {};
      if (filters.status) base.status = filters.status;
      if (filters.method) base.method = filters.method;
      if (filters.startDate && filters.endDate) {
        let start = filters.startDate.length > 10 ? new Date(filters.startDate) : new Date(filters.startDate + 'T00:00:00.000Z');
        let end = filters.endDate.length > 10 ? new Date(filters.endDate) : new Date(filters.endDate + 'T23:59:59.999Z');
        end = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));
        start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0, 0));
        base.createdAt = Between(start, end);
      }
      where = [base];
    }
    const [data, total] = await this.paymentsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
    });
    return { data, total };
  }

  async getPaymentById(id: number, user?: UserEntity, role?: string): Promise<PaymentEntity | null> {
    if (role === 'admin') {
      return this.paymentsRepository.findOne({ where: { id } });
    } else {
      return this.paymentsRepository.findOne({ where: [
        { id, sender: { id: user?.id } },
        { id, receiver: { id: user?.id } }
      ] });
    }
  }

  async getStats(user?: UserEntity, role?: string): Promise<any> {
    let qb = this.paymentsRepository.createQueryBuilder('payment');
    if (role !== 'admin' && user) {
      qb = qb.where('payment.senderId = :userId OR payment.receiverId = :userId', { userId: user.id });
    }
    const totalPayments = await qb.getCount();
    let totalRevenue = 0;
    let dailyRevenue: any[] = [];
    if (role === 'admin') {
      const totalRevenueResult = await qb.andWhere('payment.status = :status', { status: 'success' })
        .select('SUM(payment.amount)', 'sum').getRawOne();
      totalRevenue = Number(totalRevenueResult.sum || 0);
      const today = new Date();
      const last7 = new Date();
      last7.setDate(today.getDate() - 6);
      let dailyRevenueQb = this.paymentsRepository.createQueryBuilder('payment')
        .select("DATE_TRUNC('day', payment.createdAt)", 'date')
        .addSelect('SUM(payment.amount)', 'revenue')
        .where('payment.createdAt >= :last7', { last7 })
        .andWhere('payment.status = :status', { status: 'success' });
      dailyRevenue = await dailyRevenueQb.groupBy('date').orderBy('date', 'ASC').getRawMany();
    } else if (user) {
      const receivedResult = await this.paymentsRepository.createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('payment.receiverId = :userId', { userId: user.id })
        .andWhere('payment.status = :status', { status: 'success' })
        .getRawOne();
      const sentResult = await this.paymentsRepository.createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'sum')
        .where('payment.senderId = :userId', { userId: user.id })
        .andWhere('payment.status = :status', { status: 'success' })
        .getRawOne();
      totalRevenue = Number(receivedResult.sum || 0) - Number(sentResult.sum || 0);
      const today = new Date();
      const last7 = new Date();
      last7.setDate(today.getDate() - 6);
      const receivedDaily = await this.paymentsRepository.createQueryBuilder('payment')
        .select("DATE_TRUNC('day', payment.createdAt)", 'date')
        .addSelect('SUM(payment.amount)', 'revenue')
        .where('payment.createdAt >= :last7', { last7 })
        .andWhere('payment.receiverId = :userId', { userId: user.id })
        .andWhere('payment.status = :status', { status: 'success' })
        .groupBy('date').orderBy('date', 'ASC').getRawMany();
      const sentDaily = await this.paymentsRepository.createQueryBuilder('payment')
        .select("DATE_TRUNC('day', payment.createdAt)", 'date')
        .addSelect('SUM(payment.amount)', 'revenue')
        .where('payment.createdAt >= :last7', { last7 })
        .andWhere('payment.senderId = :userId', { userId: user.id })
        .andWhere('payment.status = :status', { status: 'success' })
        .groupBy('date').orderBy('date', 'ASC').getRawMany();
      const dailyMap: Record<string, number> = {};
      for (const r of receivedDaily) {
        dailyMap[r.date] = Number(r.revenue);
      }
      for (const s of sentDaily) {
        if (dailyMap[s.date]) {
          dailyMap[s.date] -= Number(s.revenue);
        } else {
          dailyMap[s.date] = -Number(s.revenue);
        }
      }
      dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));
    }
    let failedCount = 0;
    if (role === 'admin') {
      failedCount = await qb.andWhere('payment.status = :status', { status: 'failed' }).getCount();
    } else if (user) {
      failedCount = await this.paymentsRepository.createQueryBuilder('payment')
        .where('(payment.senderId = :userId OR payment.receiverId = :userId)', { userId: user.id })
        .andWhere('payment.status = :status', { status: 'failed' })
        .getCount();
    }
    return {
      totalPayments,
      totalRevenue,
      failedCount,
      dailyRevenue,
    };
  }
}
