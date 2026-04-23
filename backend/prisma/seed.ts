import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============================================================================
  // Subscription Plans
  // ============================================================================
  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { slug: 'pass-24h' },
      update: { priceEur: 6, stripePriceId: 'price_1T5LVF8uXGeIyMMqbiHBpsFh' },
      create: {
        name: 'Pass 24h',
        slug: 'pass-24h',
        priceEur: 6,
        durationDays: 1,
        sortOrder: 1,
        stripePriceId: 'price_1T5LVF8uXGeIyMMqbiHBpsFh',
        features: JSON.stringify({
          signals: true,
          bot: true,
          dashboard: true,
          liveSession: false,
          prioritySupport: false,
          refundable: true,
        }),
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: 'pass-48h' },
      update: { priceEur: 10, stripePriceId: 'price_1T5M4u8uXGeIyMMqcQgTyCol' },
      create: {
        name: 'Pass 48h',
        slug: 'pass-48h',
        priceEur: 10,
        durationDays: 2,
        sortOrder: 2,
        stripePriceId: 'price_1T5M4u8uXGeIyMMqcQgTyCol',
        features: JSON.stringify({
          signals: true,
          bot: true,
          dashboard: true,
          liveSession: false,
          prioritySupport: false,
          refundable: false,
        }),
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: 'weekly' },
      update: { priceEur: 25, stripePriceId: 'price_1T5Laa8uXGeIyMMqw7ia4HOp' },
      create: {
        name: 'Hebdomadaire',
        slug: 'weekly',
        priceEur: 25,
        durationDays: 7,
        sortOrder: 3,
        stripePriceId: 'price_1T5Laa8uXGeIyMMqw7ia4HOp',
        features: JSON.stringify({
          signals: true,
          bot: true,
          dashboard: true,
          liveSession: true,
          prioritySupport: false,
          refundable: false,
        }),
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: 'monthly' },
      update: { priceEur: 85, stripePriceId: 'price_1T5LbF8uXGeIyMMq1Du3EpUL' },
      create: {
        name: 'Mensuel',
        slug: 'monthly',
        priceEur: 85,
        durationDays: 30,
        sortOrder: 4,
        stripePriceId: 'price_1T5LbF8uXGeIyMMq1Du3EpUL',
        features: JSON.stringify({
          signals: true,
          bot: true,
          dashboard: true,
          liveSession: true,
          prioritySupport: true,
          refundable: false,
          bonus: 'Acces analytics avancees',
        }),
      },
    }),
  ]);
  console.log(plans.length + ' subscription plans created');

  // ============================================================================
  // Assets
  // ============================================================================
  const assets = [
    // Forex Major Pairs
    { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', category: 'FOREX', pipSize: 0.0001 },

    // Forex Minor / Cross Pairs
    { symbol: 'EURGBP', name: 'Euro / British Pound', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'EURAUD', name: 'Euro / Australian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'EURCAD', name: 'Euro / Canadian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'EURCHF', name: 'Euro / Swiss Franc', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'EURNZD', name: 'Euro / New Zealand Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'GBPCAD', name: 'British Pound / Canadian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'GBPNZD', name: 'British Pound / New Zealand Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'AUDCAD', name: 'Australian Dollar / Canadian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'AUDCHF', name: 'Australian Dollar / Swiss Franc', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'AUDNZD', name: 'Australian Dollar / New Zealand Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'CADCHF', name: 'Canadian Dollar / Swiss Franc', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'CHFJPY', name: 'Swiss Franc / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'NZDJPY', name: 'New Zealand Dollar / Japanese Yen', category: 'FOREX', pipSize: 0.01 },
    { symbol: 'NZDCAD', name: 'New Zealand Dollar / Canadian Dollar', category: 'FOREX', pipSize: 0.0001 },
    { symbol: 'NZDCHF', name: 'New Zealand Dollar / Swiss Franc', category: 'FOREX', pipSize: 0.0001 },

    // Forex OTC
    { symbol: 'EURUSD_OTC', name: 'Euro / US Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'GBPUSD_OTC', name: 'British Pound / US Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'USDJPY_OTC', name: 'US Dollar / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'USDCHF_OTC', name: 'US Dollar / Swiss Franc OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'AUDUSD_OTC', name: 'Australian Dollar / US Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'USDCAD_OTC', name: 'US Dollar / Canadian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'NZDUSD_OTC', name: 'New Zealand Dollar / US Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'EURGBP_OTC', name: 'Euro / British Pound OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'EURJPY_OTC', name: 'Euro / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'GBPJPY_OTC', name: 'British Pound / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'EURAUD_OTC', name: 'Euro / Australian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'EURCAD_OTC', name: 'Euro / Canadian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'EURCHF_OTC', name: 'Euro / Swiss Franc OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'EURNZD_OTC', name: 'Euro / New Zealand Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'GBPAUD_OTC', name: 'British Pound / Australian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'GBPCAD_OTC', name: 'British Pound / Canadian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'GBPCHF_OTC', name: 'British Pound / Swiss Franc OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'GBPNZD_OTC', name: 'British Pound / New Zealand Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'AUDCAD_OTC', name: 'Australian Dollar / Canadian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'AUDCHF_OTC', name: 'Australian Dollar / Swiss Franc OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'AUDJPY_OTC', name: 'Australian Dollar / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'AUDNZD_OTC', name: 'Australian Dollar / New Zealand Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'CADJPY_OTC', name: 'Canadian Dollar / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'CADCHF_OTC', name: 'Canadian Dollar / Swiss Franc OTC', category: 'FOREX_OTC', pipSize: 0.0001 },
    { symbol: 'CHFJPY_OTC', name: 'Swiss Franc / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'NZDJPY_OTC', name: 'New Zealand Dollar / Japanese Yen OTC', category: 'FOREX_OTC', pipSize: 0.01 },
    { symbol: 'NZDCAD_OTC', name: 'New Zealand Dollar / Canadian Dollar OTC', category: 'FOREX_OTC', pipSize: 0.0001 },

    // Crypto
    { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'BNBUSD', name: 'Binance Coin / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'SOLUSD', name: 'Solana / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'XRPUSD', name: 'Ripple / US Dollar', category: 'CRYPTO', pipSize: 0.0001 },
    { symbol: 'ADAUSD', name: 'Cardano / US Dollar', category: 'CRYPTO', pipSize: 0.0001 },
    { symbol: 'DOTUSD', name: 'Polkadot / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'DOGEUSD', name: 'Dogecoin / US Dollar', category: 'CRYPTO', pipSize: 0.00001 },
    { symbol: 'AVAXUSD', name: 'Avalanche / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'LINKUSD', name: 'Chainlink / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'MATICUSD', name: 'Polygon / US Dollar', category: 'CRYPTO', pipSize: 0.0001 },
    { symbol: 'UNIUSD', name: 'Uniswap / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'ATOMUSD', name: 'Cosmos / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'LTCUSD', name: 'Litecoin / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'NEARUSD', name: 'NEAR Protocol / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'APTUSD', name: 'Aptos / US Dollar', category: 'CRYPTO', pipSize: 0.01 },
    { symbol: 'ARBUSD', name: 'Arbitrum / US Dollar', category: 'CRYPTO', pipSize: 0.0001 },
    { symbol: 'OPUSD', name: 'Optimism / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'FILUSD', name: 'Filecoin / US Dollar', category: 'CRYPTO', pipSize: 0.001 },
    { symbol: 'TRXUSD', name: 'Tron / US Dollar', category: 'CRYPTO', pipSize: 0.00001 },
    { symbol: 'SHIBUSD', name: 'Shiba Inu / US Dollar', category: 'CRYPTO', pipSize: 0.00000001 },
    { symbol: 'XLMUSD', name: 'Stellar / US Dollar', category: 'CRYPTO', pipSize: 0.00001 },
    { symbol: 'ALGOUSD', name: 'Algorand / US Dollar', category: 'CRYPTO', pipSize: 0.0001 },

    // Indices
    { symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'INDICES', pipSize: 1 },
    { symbol: 'US500', name: 'S&P 500', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'USTEC', name: 'Nasdaq 100', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'DE40', name: 'DAX 40', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'UK100', name: 'FTSE 100', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'JP225', name: 'Nikkei 225', category: 'INDICES', pipSize: 1 },
    { symbol: 'FR40', name: 'CAC 40', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'EU50', name: 'Euro Stoxx 50', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'AU200', name: 'ASX 200', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'HK50', name: 'Hang Seng 50', category: 'INDICES', pipSize: 1 },
    { symbol: 'CN50', name: 'China A50', category: 'INDICES', pipSize: 1 },
    { symbol: 'ES35', name: 'IBEX 35', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'IT40', name: 'FTSE MIB', category: 'INDICES', pipSize: 1 },
    { symbol: 'NL25', name: 'AEX 25', category: 'INDICES', pipSize: 0.01 },
    { symbol: 'CH20', name: 'SMI 20', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'VIX', name: 'Volatility Index', category: 'INDICES', pipSize: 0.01 },
    { symbol: 'US2000', name: 'Russell 2000', category: 'INDICES', pipSize: 0.1 },
    { symbol: 'SG30', name: 'SGX 30', category: 'INDICES', pipSize: 0.1 },

    // Commodities
    { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'XAGUSD', name: 'Silver / US Dollar', category: 'COMMODITIES', pipSize: 0.001 },
    { symbol: 'USOIL', name: 'US Crude Oil (WTI)', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'UKOIL', name: 'UK Brent Oil', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'NATGAS', name: 'Natural Gas', category: 'COMMODITIES', pipSize: 0.001 },
    { symbol: 'COPPER', name: 'Copper', category: 'COMMODITIES', pipSize: 0.001 },
    { symbol: 'XPTUSD', name: 'Platinum / US Dollar', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'XPDUSD', name: 'Palladium / US Dollar', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'WHEAT', name: 'Wheat', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'CORN', name: 'Corn', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'SOYBEAN', name: 'Soybean', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'COFFEE', name: 'Coffee', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'SUGAR', name: 'Sugar', category: 'COMMODITIES', pipSize: 0.001 },
    { symbol: 'COTTON', name: 'Cotton', category: 'COMMODITIES', pipSize: 0.01 },
    { symbol: 'COCOA', name: 'Cocoa', category: 'COMMODITIES', pipSize: 1 },
    { symbol: 'LUMBER', name: 'Lumber', category: 'COMMODITIES', pipSize: 0.1 },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: {},
      create: asset,
    });
  }
  console.log(assets.length + ' assets created');

  // ============================================================================
  // Demo Admin User
  // ============================================================================
  const bcrypt = await import('bcryptjs');
  const bcryptMod = bcrypt.default || bcrypt;
  const adminPassword = await bcryptMod.hash('admin123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@marketsignals24.com' },
    update: {},
    create: {
      email: 'admin@marketsignals24.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'MarketSignals24',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });
  console.log('Admin user created');

  // Demo Validator
  const validatorPassword = await bcryptMod.hash('validator123!', 12);
  await prisma.user.upsert({
    where: { email: 'validator@marketsignals24.com' },
    update: {},
    create: {
      email: 'validator@marketsignals24.com',
      passwordHash: validatorPassword,
      firstName: 'Validator',
      lastName: 'Demo',
      role: 'VALIDATOR',
      emailVerified: true,
    },
  });
  console.log('Validator user created');

  // Pro Subscribed User
  const proPassword = await bcryptMod.hash('123456', 12);
  const proUser = await prisma.user.upsert({
    where: { email: 'pro@gmail.comm' },
    update: {},
    create: {
      email: 'pro@gmail.comm',
      passwordHash: proPassword,
      firstName: 'Pro',
      lastName: 'Trader',
      role: 'USER',
      emailVerified: true,
    },
  });

  // Attach active Monthly subscription
  const monthlyPlan = await prisma.subscriptionPlan.findFirst({ where: { slug: 'monthly' } });
  if (monthlyPlan) {
    await prisma.subscription.upsert({
      where: { userId: proUser.id },
      update: {},
      create: {
        userId: proUser.id,
        planId: monthlyPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('Pro user created with active subscription');

  // Admin Premium User
  const adminPassword = await bcryptMod.hash('Hababa11@', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@trades.com' },
    update: { passwordHash: adminPassword, role: 'ADMIN' },
    create: {
      email: 'admin@trades.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Trades',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  const adminMonthlyPlan = await prisma.subscriptionPlan.findFirst({ where: { slug: 'monthly' } });
  if (adminMonthlyPlan) {
    await prisma.subscription.upsert({
      where: { userId: adminUser.id },
      update: {
        planId: adminMonthlyPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: adminUser.id,
        planId: adminMonthlyPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('Admin user (admin@trades.com) created with monthly subscription');

  console.log('\nDatabase seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
