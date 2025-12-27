import express from 'express';
import multerMiddleware from '../services/fileService.js';
import * as ArticleController from '../controllers/articleController.js';

const router = express.Router();


router.get('/workspace/:workspaceId', ArticleController.getArticlesByWorkspace);
router.get('/:id', ArticleController.getArticleById);
router.get('/:id/versions', ArticleController.getArticleVersions);
router.post('/', multerMiddleware.array('files'), ArticleController.createArticle);
router.put('/:id', multerMiddleware.array('files'), ArticleController.updateArticle);
router.delete('/:id', ArticleController.deleteArticle);

export default router;
