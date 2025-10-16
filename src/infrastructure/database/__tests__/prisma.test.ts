import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock PrismaClient before importing
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $disconnect: vi.fn(),
  })),
}));

describe('Prisma Singleton', () => {
  const setupTest = async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { getPrismaClient, disconnectPrisma } = await import('../prisma');
    return { getPrismaClient, disconnectPrisma };
  };

  afterEach(async () => {
    // Clean up any existing instances
    const { disconnectPrisma } = await import('../prisma');
    await disconnectPrisma();
  });

  it('should return the same instance on multiple calls', async () => {
    const { getPrismaClient } = await setupTest();

    const instance1 = getPrismaClient();
    const instance2 = getPrismaClient();

    expect(instance1).toBe(instance2);
  });

  it('should create new instance after disconnect', async () => {
    const { getPrismaClient, disconnectPrisma } = await setupTest();

    const instance1 = getPrismaClient();
    await disconnectPrisma();
    const instance2 = getPrismaClient();

    expect(instance1).not.toBe(instance2);
  });

  it('should configure logging based on environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { PrismaClient } = await import('@prisma/client');
    await setupTest();

    expect(PrismaClient).toHaveBeenCalledWith({
      log: ['query', 'info', 'warn', 'error'],
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should use error-only logging in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { PrismaClient } = await import('@prisma/client');
    await setupTest();

    expect(PrismaClient).toHaveBeenCalledWith({
      log: ['error'],
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle disconnect gracefully when no instance exists', async () => {
    const { disconnectPrisma } = await setupTest();

    await expect(disconnectPrisma()).resolves.not.toThrow();
  });
});
