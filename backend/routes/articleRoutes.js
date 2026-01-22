import express from 'express';
import multerMiddleware from '../services/fileService.js';
import * as ArticleController from '../controllers/articleController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/workspace/:workspaceId', authenticateToken, ArticleController.getArticlesByWorkspace);
router.get('/workspace/:workspaceId/search', authenticateToken, ArticleController.searchArticles);
router.get('/:id', authenticateToken, ArticleController.getArticleById);
router.get('/:id/versions', authenticateToken, ArticleController.getArticleVersions);
router.get('/:id/export-pdf', authenticateToken, ArticleController.exportArticlePDF);


router.post(
  '/',
  authenticateToken,
  multerMiddleware.array('files'),
  ArticleController.createArticle
);

router.put(
  '/:id',
  authenticateToken,
  multerMiddleware.array('files'),
  ArticleController.updateArticle
);

router.delete('/:id', authenticateToken, ArticleController.deleteArticle);

export default router;
