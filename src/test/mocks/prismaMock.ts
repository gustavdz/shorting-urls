import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import type { PrismaClient } from '@prisma/client';

export const createPrismaClientMock = (): DeepMockProxy<PrismaClient> => {
  return mockDeep<PrismaClient>();
};

export type PrismaClientMock = DeepMockProxy<PrismaClient>;
