import { Controller, Post, Body, Get, UseGuards, Req, Query, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: { username: string; password: string; role?: 'admin' | 'user' }) {
    const user = await this.usersService.createUser(body.username, body.password, body.role);
    const { password, ...result } = user;
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req: Request) {
    const user = req.user;
    if (user?.role !== 'admin') {
      return { error: 'Unauthorized' };
    }
    return this.usersService.getAllUsers();
  }

  @Get('list')
  async list(@Query('q') q?: string) {
    let users = await this.usersService.getAllUsers();
    if (q) {
      users = users.filter(u => u.username.toLowerCase().startsWith(q.toLowerCase()));
    }
    return users;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;
    if (user?.role !== 'admin') {
      return { error: 'Unauthorized' };
    }
    await this.usersService.deleteUser(Number(id));
    return { success: true };
  }
}
