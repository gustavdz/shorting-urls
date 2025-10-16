import type { Url } from '@shorting-urls/domain/entities/Url';

import { faker } from '@faker-js/faker';

export const createMockUrl = (overrides: Partial<Url> = {}): Url => ({
  id: faker.string.uuid(),
  shortCode: faker.string.alphanumeric(8),
  longUrl: faker.internet.url(),
  clicks: faker.number.int({ min: 0, max: 1000 }),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createMockUrls = (count: number): Url[] =>
  Array.from({ length: count }, () => createMockUrl());
