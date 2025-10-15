import { nanoid } from 'nanoid';
import validator from 'validator';
import type {
  UrlService,
  CreateUrlRequest,
  CreateUrlResponse,
} from '@shorting-urls/domain/services/UrlService';
import type { UrlRepository } from '@shorting-urls/domain/repositories/UrlRepository';
import type { Url } from '@shorting-urls/domain/entities/Url';

export const createUrlService = (
  urlRepository: UrlRepository,
  baseUrl: string
): UrlService => {
  const generateUniqueCode = async (attempt = 0): Promise<string> => {
    if (attempt >= 5) {
      throw new Error('Failed to generate unique short code');
    }

    const shortCode = nanoid(8);
    const existing = await urlRepository.findByShortCode(shortCode);

    if (existing) {
      return generateUniqueCode(attempt + 1);
    }

    return shortCode;
  };

  const generateShortCode = async (customCode?: string): Promise<string> => {
    if (customCode) {
      const existing = await urlRepository.findByShortCode(customCode);
      if (existing) {
        throw new Error('Custom code already exists');
      }
      return customCode;
    }

    return generateUniqueCode();
  };

  const createShortUrl = async (
    request: CreateUrlRequest
  ): Promise<CreateUrlResponse> => {
    const { longUrl, customCode } = request;

    if (!validator.isURL(longUrl)) {
      throw new Error('Invalid URL provided');
    }

    const shortCode = await generateShortCode(customCode);
    const url = await urlRepository.create(longUrl, shortCode);

    return {
      shortUrl: `${baseUrl}/${shortCode}`,
      longUrl: url.longUrl,
      shortCode: url.shortCode,
    };
  };

  const getLongUrl = async (shortCode: string): Promise<string | null> => {
    const url = await urlRepository.findByShortCode(shortCode);

    if (!url) {
      return null;
    }

    await urlRepository.incrementClicks(shortCode);
    return url.longUrl;
  };

  const getUrlStats = async (shortCode: string): Promise<Url | null> => {
    return urlRepository.findByShortCode(shortCode);
  };

  const getAllUrls = async (): Promise<Url[]> => {
    return urlRepository.findAll();
  };

  return {
    createShortUrl,
    getLongUrl,
    getUrlStats,
    getAllUrls,
  };
};
