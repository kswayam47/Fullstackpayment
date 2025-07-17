import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({ where: { username } });
    console.log('findByUsername:', username, '=>', user);
    return user;
  }

  async createUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<UserEntity> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ username, password: hash, role });
    const saved = await this.usersRepository.save(user);
    console.log('createUser:', saved);
    return saved;
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
