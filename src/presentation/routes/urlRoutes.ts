import { Router } from 'express';

import type { UrlControllerType } from '@shorting-urls/presentation/types/ControllerTypes';

export const createUrlRoutes = (urlController: UrlControllerType): Router => {
  const router = Router();

  router.post('/api/urls', urlController.createShortUrl);
  router.get('/api/urls', urlController.getAllUrls);
  router.get('/api/urls/:shortCode/stats', urlController.getUrlStats);
  router.get('/:shortCode', urlController.redirectToLongUrl);

  return router;
};
