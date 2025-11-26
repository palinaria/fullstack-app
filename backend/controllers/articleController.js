import express from 'express';
import { Article } from '../models/article.js';
import { upload } from '../services/fileService.js';
import { broadcastNotification } from '../utils/websocket.js';

const router = express.Router();

// Получить все статьи
router.get('/', async (req, res) => {
    try {
        const articles = await Article.findAll();
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении статей' });
    }
});

// Получить статью по ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при чтении статьи' });
    }
});

// Создать статью с файлами
router.post('/', upload.array('files'), async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });

    const files = req.files ? req.files.map(f => f.filename) : [];

    try {
        const newArticle = await Article.create({ title, content, files });
        broadcastNotification({ type: 'article_created', article: newArticle });
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при сохранении статьи' });
    }
});

// Обновление статьи с файлами
router.put('/:id', upload.array('files'), async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const newFiles = req.files ? req.files.map(f => f.filename) : [];

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        article.title = title;
        article.content = content;
        article.files = newFiles.length > 0 ? newFiles : (article.files || []);

        await article.save();
        broadcastNotification({ type: 'article_updated', article });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении статьи' });
    }
});

// Удаление статьи
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        await article.destroy();
        broadcastNotification({ type: 'article_deleted', id });
        res.json({ message: 'Статья удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
});

export default router;
