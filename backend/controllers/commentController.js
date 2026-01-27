import { Comment } from '../models/comment.js';
import { Article } from '../models/article.js';

export const createComment = async (req, res) => {
    const { text, articleId, workspaceId } = req.body;
    if (!text || !articleId || !workspaceId) {
        return res.status(400).json({ message: 'Необходимо указать text, articleId и workspaceId' });
    }

    try {
        const article = await Article.findByPk(articleId);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        const comment = await Comment.create({
            text,
            articleId,
            workspaceId,
            userId: req.user.id
        });
        res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при создании комментария' });
    }
};

export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    try {
        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ message: 'Комментарий не найден' });

        // Проверка прав: автор или админ
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав на редактирование этого комментария' });
        }

        comment.text = text ?? comment.text;
        await comment.save();
        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при обновлении комментария' });
    }
};

export const deleteComment = async (req, res) => {
    const { id } = req.params;

    try {
        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ message: 'Комментарий не найден' });

        // Проверка прав: автор или админ
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав на удаление этого комментария' });
        }

        await comment.destroy();
        res.json({ message: 'Комментарий удалён' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при удалении комментария' });
    }
};

export const getCommentsByArticle = async (req, res) => {
    const { articleId } = req.params;

    try {
        const article = await Article.findByPk(articleId);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        const comments = await Comment.findAll({ where: { articleId } });
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении комментариев' });
    }
};
