import express from 'express';
import * as CommentController from '../controllers/commentController.js';

const router = express.Router();

router.get('/article/:articleId', CommentController.getCommentsByArticle);
router.post('/', CommentController.createComment);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;
