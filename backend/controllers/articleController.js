import { Article } from '../models/Article.js';
import { Comment } from '../models/Comment.js';
import { broadcastNotification } from '../utils/ws.js';

// Получить все статьи в workspace
export const getArticlesByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;

    if (!workspaceId) {
        return res.status(400).json({ message: 'Не указан workspaceId' });
    }

    try {
        const articles = await Article.findAll({ where: { workspaceId } });
        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении статей' });
    }
};

// Получить статью по ID (с комментариями)
export const getArticleById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Не указан ID статьи' });
    }

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        const comments = await Comment.findAll({ where: { articleId: id } });
        res.json({ ...article.toJSON(), comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при чтении статьи' });
    }
};

// Создать статью
export const createArticle = async (req, res) => {
    const { title, content, workspaceId } = req.body;

    if (!title || !content || !workspaceId) {
        return res.status(400).json({ message: 'Нужно указать заголовок, текст и workspaceId' });
    }

    const files = req.files ? req.files.map(f => f.filename) : [];

    try {
        const newArticle = await Article.create({
            title,
            content,
            workspaceId,
            files
        });

        broadcastNotification({
            type: 'article_created',
            article: newArticle
        });

        res.status(201).json(newArticle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при сохранении статьи' });
    }
};

// Обновить статью
export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content, workspaceId } = req.body;
    const newFiles = req.files ? req.files.map(f => f.filename) : [];

    if (!id) return res.status(400).json({ message: 'Не указан ID статьи' });

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        article.title = title ?? article.title;
        article.content = content ?? article.content;
        article.workspaceId = workspaceId ?? article.workspaceId;

        if (newFiles.length > 0) article.files = newFiles;

        await article.save();

        broadcastNotification({
            type: 'article_updated',
            article
        });

        res.json(article);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при обновлении статьи' });
    }
};

// Удалить статью
export const deleteArticle = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: 'Не указан ID статьи' });

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        await Comment.destroy({ where: { articleId: id } });
        await article.destroy();

        broadcastNotification({
            type: 'article_deleted',
            id
        });

        res.json({ message: 'Статья удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
};
