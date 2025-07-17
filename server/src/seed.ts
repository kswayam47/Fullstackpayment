require('dotenv/config');
const { DataSource } = require('typeorm');
const { UserEntity } = require('./users/user.entity/user.entity');
const { PaymentEntity } = require('./payments/payment.entity/payment.entity');
const bcrypt = require('bcrypt');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Ramayan@2006',
  database: process.env.DB_DATABASE || 'payment_dashboard',
  entities: [UserEntity, PaymentEntity],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserEntity);
  const paymentRepo = AppDataSource.getRepository(PaymentEntity);

  // Seed users
  const users = [
    { username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'admin' },
    { username: 'user', password: await bcrypt.hash('user123', 10), role: 'user' },
  ];
  // Add demo users
  const demoUsernames = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'];
  for (const username of demoUsernames) {
    users.push({ username, password: await bcrypt.hash('demo123', 10), role: 'user' });
  }
  for (const user of users) {
    const exists = await userRepo.findOneBy({ username: user.username });
    if (!exists) await userRepo.save(user);
  }

  // Get all users
  const allUsers = await userRepo.find();
  const adminEntity = await userRepo.findOneBy({ username: 'admin' });
  if (!adminEntity) throw new Error('Admin user not found.');

  // Generate demo payments for the last 30 days
  const statuses = ['success', 'failed', 'pending'];
  const methods = ['card', 'bank', 'wallet'];
  const now = new Date();
  for (let i = 0; i < 200; i++) {
    const sender = allUsers[Math.floor(Math.random() * allUsers.length)];
    const receiver = allUsers.filter((u: any) => u.username !== sender.username)[Math.floor(Math.random() * (allUsers.length - 1))];
    const amount = parseFloat((Math.abs(Math.random()) * 500 + 10).toFixed(2));
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    await paymentRepo.save({
      amount,
      receiver,
      status,
      method,
      sender,
      createdAt,
    });
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); }); 