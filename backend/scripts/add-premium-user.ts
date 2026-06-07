import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'shaantitrades@gmail.com';
  const password = 'Hababa11@';
  const planSlug = 'monthly';

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email,
      passwordHash,
      firstName: 'Shaanti',
      lastName: 'Trades',
      role: 'ADMIN',
    },
  });
  console.log(`User upserted: ${user.email} (id: ${user.id})`);

  // Get monthly plan
  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    throw new Error(`Plan "${planSlug}" not found. Run seed first.`);
  }
  console.log(`Plan found: ${plan.name} (id: ${plan.id})`);

  // Upsert subscription (30 days from now)
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30);

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
      canceledAt: null,
    },
    create: {
      userId: user.id,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
    },
  });
  console.log(`Subscription upserted: ${subscription.id} (status: ${subscription.status})`);
  console.log(`Valid until: ${endDate.toISOString()}`);
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
