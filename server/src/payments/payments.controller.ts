import { Controller, Get, Post, Param, Body, Query, Req, UseGuards, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Parser as Json2csvParser } from 'json2csv';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getPayments(
    @Query('status') status?: 'success' | 'failed' | 'pending',
    @Query('method') method?: 'card' | 'bank' | 'wallet',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    const user = req?.user;
    const pageVal = page === '' ? undefined : page;
    const limitVal = limit === '' ? undefined : limit;
    const pageNum = pageVal && !isNaN(Number(pageVal)) ? parseInt(pageVal) : 1;
    const limitNum = limitVal && !isNaN(Number(limitVal)) ? parseInt(limitVal) : 10;
    return this.paymentsService.getPayments({
      status,
      method,
      startDate,
      endDate,
      page: pageNum,
      limit: limitNum,
      user,
      role: user?.role,
    });
  }

  @Get('export')
  async exportPayments(
    @Query('status') status?: 'success' | 'failed' | 'pending',
    @Query('method') method?: 'card' | 'bank' | 'wallet',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
    @Res() res?: Response,
  ) {
    const user = req?.user;
    const pageVal = page === '' ? undefined : page;
    const limitVal = limit === '' ? undefined : limit;
    const pageNum = pageVal && !isNaN(Number(pageVal)) ? parseInt(pageVal) : 1;
    const limitNum = limitVal && !isNaN(Number(limitVal)) ? parseInt(limitVal) : 1000;
    const { data } = await this.paymentsService.getPayments({
      status,
      method,
      startDate,
      endDate,
      page: pageNum,
      limit: limitNum,
      user,
      role: user?.role,
    });
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Amount', value: 'amount' },
      { label: 'Status', value: 'status' },
      { label: 'Method', value: 'method' },
      { label: 'Sender', value: (row: any) => row.sender?.username },
      { label: 'Receiver', value: (row: any) => row.receiver?.username },
      { label: 'Created At', value: 'createdAt' },
      { label: 'Updated At', value: 'updatedAt' },
    ];
    const parser = new Json2csvParser({ fields });
    const csv = parser.parse(data);
    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    res!.send(csv);
  }

  @Get('stats')
  async getStats(@Req() req: Request) {
    const user = req.user;
    return this.paymentsService.getStats(user, user?.role);
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;
    return this.paymentsService.getPaymentById(Number(id), user, user?.role);
  }

  @Post()
  async createPayment(@Body() body: any, @Req() req: Request) {
    const user = req.user;
    return this.paymentsService.createPayment({ ...body, user });
  }
}
