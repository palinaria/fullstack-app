import { Article } from '../models/article.js';
import { ArticleVersion } from '../models/ArticleVersion.js';
import { Comment } from '../models/comment.js';
import { broadcastNotification } from '../utils/ws.js';

// Получить все статьи в workspace
export const getArticlesByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    if (!workspaceId) return res.status(400).json({ message: 'Не указан workspaceId' });
    try {
        const articles = await Article.findAll({
            where: { workspaceId },
            include: [{ model: ArticleVersion, as: 'currentVersion' }]
        });
        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении статей' });
    }
};

// Получить статью по ID
export const getArticleById = async (req, res) => {
    const { id } = req.params;
    const { version } = req.query;
    if (!id) return res.status(400).json({ message: 'Не указан ID статьи' });
    try {
        const article = await Article.findByPk(id, {
            include: [{ model: ArticleVersion, as: 'currentVersion' }]
        });
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        let articleData = article.currentVersion;
        let isReadonly = false;

        if (version) {
            const requestedVersion = parseInt(version);
            if (requestedVersion !== article.currentVersion.version) {
                const oldVersion = await ArticleVersion.findOne({
                    where: { articleId: id, version: requestedVersion }
                });
                if (oldVersion) {
                    articleData = oldVersion;
                    isReadonly = true;
                } else {
                    return res.status(404).json({ message: 'Версия не найдена' });
                }
            }
        }

        const comments = await Comment.findAll({ where: { articleId: id } });
        res.json({
            id: article.id,
            workspaceId: article.workspaceId,
            currentVersion: articleData,
            isReadonly,
            comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при чтении статьи' });
    }
};

// Создать статью
export const createArticle = async (req, res) => {
    const { title, content, workspaceId } = req.body;
    if (!title || !content || !workspaceId) return res.status(400).json({ message: 'Нужно указать заголовок, текст и workspaceId' });
    const files = req.files ? req.files.map(f => f.filename) : [];
    try {
        const article = await Article.create({ workspaceId });
        const version = await ArticleVersion.create({
            articleId: article.id,
            version: 1,
            title,
            content,
            files
        });
        article.currentVersionId = version.id;
        await article.save();
        broadcastNotification({ type: 'article_created', article });
        res.status(201).json({ id: article.id, currentVersion: version });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при создании статьи' });
    }
};

// Обновить статью (создает новую версию)
export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const files = req.files ? req.files.map(f => f.filename) : [];
    if (!id) return res.status(400).json({ message: 'Не указан ID статьи' });
    try {
        const article = await Article.findByPk(id, {
            include: [{ model: ArticleVersion, as: 'currentVersion' }]
        });
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        const newVersionNumber = article.currentVersion.version + 1;
        const newVersion = await ArticleVersion.create({
            articleId: article.id,
            version: newVersionNumber,
            title: title ?? article.currentVersion.title,
            content: content ?? article.currentVersion.content,
            files: files.length ? files : article.currentVersion.files
        });

        article.currentVersionId = newVersion.id;
        await article.save();
        broadcastNotification({ type: 'article_updated', article });
        res.json({ id: article.id, currentVersion: newVersion });
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
        await ArticleVersion.destroy({ where: { articleId: id } });
        await article.destroy();
        broadcastNotification({ type: 'article_deleted', id });
        res.json({ message: 'Статья удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
};

// Получить все версии статьи
export const getArticleVersions = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Не указан ID статьи' });
    try {
        const versions = await ArticleVersion.findAll({
            where: { articleId: id },
            order: [['version', 'DESC']]
        });
        res.json(versions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении версий статьи' });
    }
};
