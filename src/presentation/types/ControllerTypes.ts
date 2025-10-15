import type { Request, Response } from 'express';

export interface UrlControllerType {
  createShortUrl: (req: Request, res: Response) => Promise<void>;
  getAllUrls: (req: Request, res: Response) => Promise<void>;
  getUrlStats: (req: Request, res: Response) => Promise<void>;
  redirectToLongUrl: (req: Request, res: Response) => Promise<void>;
}
