import type { Url } from '@shorting-urls/domain/entities/Url';

export interface CreateUrlRequest {
  longUrl: string;
  customCode?: string;
}

export interface CreateUrlResponse {
  shortUrl: string;
  longUrl: string;
  shortCode: string;
}

export interface UrlService {
  createShortUrl(request: CreateUrlRequest): Promise<CreateUrlResponse>;
  getLongUrl(shortCode: string): Promise<string | null>;
  getUrlStats(shortCode: string): Promise<Url | null>;
  getAllUrls(): Promise<Url[]>;
}
