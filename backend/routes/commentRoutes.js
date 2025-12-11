import express from "express";
import {
    createComment,
    updateComment,
    deleteComment,
    getCommentsByArticle
} from "../controllers/commentController.js";

//фронт отправляет запросы сюда
//роуты вызывают контроллеры


const router = express.Router();

// Создать комментарий
router.post("/", createComment);

// Обновить комментарий
router.put("/:id", updateComment);

// Удалить комментарий
router.delete("/:id", deleteComment);

// Получить все комментарии для статьи
router.get("/article/:articleId", getCommentsByArticle);

export default router;
