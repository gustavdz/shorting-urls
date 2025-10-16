import type { Request, Response } from 'express';
import { vi } from 'vitest';

export const createMockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  }) as Request;

export const createMockResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn(),
    send: vi.fn(),
    end: vi.fn(),
  };

  // Chain methods
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res as unknown as Response;
};
