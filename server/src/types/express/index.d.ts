import { UserEntity } from '../../users/user.entity/user.entity';

declare module 'express' {
  export interface Request {
    user?: UserEntity;
  }
} 