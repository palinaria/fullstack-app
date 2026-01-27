import express from 'express';
import * as CommentController from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/article/:articleId', authenticateToken, CommentController.getCommentsByArticle);
router.post('/', authenticateToken, CommentController.createComment);
router.put('/:id', authenticateToken, CommentController.updateComment);
router.delete('/:id', authenticateToken, CommentController.deleteComment);

export default router;
