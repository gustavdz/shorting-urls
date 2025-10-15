import type { Request, Response } from 'express';
import type { UrlService } from '@shorting-urls/domain/services/UrlService';
import type { UrlControllerType } from '@shorting-urls/presentation/types/ControllerTypes';

export const createUrlController = (
  urlService: UrlService
): UrlControllerType => {
  const createShortUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { longUrl, customCode } = req.body as {
        longUrl?: string;
        customCode?: string;
      };

      if (!longUrl) {
        res.status(400).json({ error: 'longUrl is required' });
        return;
      }

      const result = await urlService.createShortUrl({
        longUrl,
        ...(customCode && { customCode }),
      });
      res.status(201).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  };

  const redirectToLongUrl = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const shortCode = req.params.shortCode;
      if (!shortCode) {
        res.status(400).json({ error: 'shortCode is required' });
        return;
      }

      const longUrl = await urlService.getLongUrl(shortCode);

      if (!longUrl) {
        res.status(404).json({ error: 'Short URL not found' });
        return;
      }

      res.redirect(longUrl);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getUrlStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const shortCode = req.params.shortCode;
      if (!shortCode) {
        res.status(400).json({ error: 'shortCode is required' });
        return;
      }

      const url = await urlService.getUrlStats(shortCode);

      if (!url) {
        res.status(404).json({ error: 'Short URL not found' });
        return;
      }

      res.json(url);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getAllUrls = async (_req: Request, res: Response): Promise<void> => {
    try {
      const urls = await urlService.getAllUrls();
      res.json(urls);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  return {
    createShortUrl,
    redirectToLongUrl,
    getUrlStats,
    getAllUrls,
  };
};
