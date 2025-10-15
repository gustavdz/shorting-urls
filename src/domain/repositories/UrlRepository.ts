import type { Url } from '@shorting-urls/domain/entities/Url';

export interface UrlRepository {
  create(longUrl: string, shortCode: string): Promise<Url>;
  findByShortCode(shortCode: string): Promise<Url | null>;
  incrementClicks(shortCode: string): Promise<void>;
  findAll(): Promise<Url[]>;
}
