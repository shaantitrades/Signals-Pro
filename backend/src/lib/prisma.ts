import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal',
});

// Test de connexion au démarrage
if (process.env.NODE_ENV !== 'test') {
  prisma.$connect()
    .then(() => console.log('✅ Database connected'))
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      console.error('   Check DATABASE_URL in your .env file');
      console.error('   Supabase projects: https://supabase.com/dashboard');
      // En production, continuer pour éviter que le container crash immédiatement
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
