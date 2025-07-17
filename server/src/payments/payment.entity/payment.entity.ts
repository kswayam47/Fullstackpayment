import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/user.entity/user.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => UserEntity, { eager: true })
  sender: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  receiver: UserEntity;

  @Column({ type: 'enum', enum: ['success', 'failed', 'pending'] })
  status: 'success' | 'failed' | 'pending';

  @Column({ type: 'enum', enum: ['card', 'bank', 'wallet'] })
  method: 'card' | 'bank' | 'wallet';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
