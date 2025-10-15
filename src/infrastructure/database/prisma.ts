import { PrismaClient } from '@prisma/client';

const createPrismaConnection = () => {
  const instances = new Map<string, PrismaClient>();
  const SINGLETON_KEY = 'prisma_singleton';

  const getPrismaClient = (): PrismaClient => {
    const existing = instances.get(SINGLETON_KEY);
    if (existing) {
      return existing;
    }

    const newClient = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    instances.set(SINGLETON_KEY, newClient);
    return newClient;
  };

  const disconnectPrisma = async (): Promise<void> => {
    const client = instances.get(SINGLETON_KEY);
    if (client) {
      await client.$disconnect();
      instances.delete(SINGLETON_KEY);
    }
  };

  return { getPrismaClient, disconnectPrisma };
};

const { getPrismaClient, disconnectPrisma } = createPrismaConnection();

export { getPrismaClient, disconnectPrisma };

// Export singleton instance
export const prisma = getPrismaClient();
