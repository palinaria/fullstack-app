
import express from "express";
import * as CommentController from "../controllers/commentController.js";

const router = express.Router();

router.post("/", CommentController.createComment);
router.put("/:id", CommentController.updateComment);
router.delete("/:id", CommentController.deleteComment);
router.get("/article/:articleId", CommentController.getCommentsByArticle);

export default router;
