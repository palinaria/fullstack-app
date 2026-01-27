import { Article } from '../models/article.js';
import { ArticleVersion } from '../models/articleVersion.js';
import { Comment } from '../models/comment.js';
import { broadcastNotification } from '../utils/ws.js';

export const getArticlesByWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    if (!workspaceId) return res.status(400).json({ message: 'Не указан workspaceId' });
    try {
        const articles = await Article.findAll({
            where: { workspaceId },
            include: [{ model: ArticleVersion, as: 'currentVersion' }]
        });
        const formattedArticles = articles.map(article => ({
            id: article.id,
            workspaceId: article.workspaceId,
            authorId: article.authorId,
            title: article.currentVersion?.title || 'Без названия',
            content: article.currentVersion?.content || 'Без описания',
            currentVersion: article.currentVersion
        }));
        res.json(formattedArticles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении статей' });
    }
};

export const getArticleById = async (req, res) => {
    const { id } = req.params;
    const { version } = req.query;
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
                const oldVersion = await ArticleVersion.findOne({ where: { articleId: id, version: requestedVersion } });
                if (oldVersion) { articleData = oldVersion; isReadonly = true; }
            }
        }
        res.json({ id: article.id, workspaceId: article.workspaceId, authorId: article.authorId, currentVersion: articleData, isReadonly });
    } catch (err) { res.status(500).json({ message: 'Ошибка' }); }
};

export const createArticle = async (req, res) => {
    const { title, content, workspaceId } = req.body;
    const files = req.files ? req.files.map(f => f.filename) : [];
    try {
        const article = await Article.create({ workspaceId, authorId: req.user.id });
        const version = await ArticleVersion.create({ articleId: article.id, version: 1, title, content, files });
        article.currentVersionId = version.id;
        await article.save();
        broadcastNotification({ type: 'article_created', article: { id: article.id, workspaceId: article.workspaceId, title: version.title } });
        res.status(201).json({ id: article.id, workspaceId: article.workspaceId, title: version.title, content: version.content, currentVersion: version });
    } catch (err) { res.status(500).json({ message: 'Ошибка' }); }
};

export const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content, workspaceId } = req.body;
    const files = req.files ? req.files.map(f => f.filename) : [];
    try {
        const article = await Article.findByPk(id, { include: [{ model: ArticleVersion, as: 'currentVersion' }] });
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        if (article.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав на редактирование этой статьи' });
        }

        if (workspaceId) article.workspaceId = parseInt(workspaceId);
        const newVersion = await ArticleVersion.create({
            articleId: article.id,
            version: article.currentVersion.version + 1,
            title: title ?? article.currentVersion.title,
            content: content ?? article.currentVersion.content,
            files: files.length ? files : article.currentVersion.files
        });
        article.currentVersionId = newVersion.id;
        await article.save();
        broadcastNotification({ type: 'article_updated', article: { id: article.id, workspaceId: article.workspaceId, title: newVersion.title } });
        res.json({ id: article.id, workspaceId: article.workspaceId, title: newVersion.title, content: newVersion.content, currentVersion: newVersion });
    } catch (err) { res.status(500).json({ message: 'Ошибка' }); }
};

export const deleteArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findByPk(id);
        if (article) {
            if (article.authorId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'У вас нет прав на удаление этой статьи' });
            }
            await ArticleVersion.destroy({ where: { articleId: id } });
            await article.destroy();
            broadcastNotification({ type: 'article_deleted', id });
        }
        res.json({ message: 'Удалено' });
    } catch (err) { res.status(500).json({ message: 'Ошибка' }); }
};

export const getArticleVersions = async (req, res) => {
    const { id } = req.params;
    try {
        const versions = await ArticleVersion.findAll({ where: { articleId: id }, order: [['version', 'DESC']] });
        res.json(versions);
    } catch (err) { res.status(500).json({ message: 'Ошибка' }); }
};
