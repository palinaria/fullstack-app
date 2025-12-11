
import { Comment } from '../models/Comment.js';

export const createComment = async (req, res) => {
    const { text, articleId, workspaceId } = req.body;
    if (!text || !articleId || !workspaceId) return res.status(400).json({ message: 'Нужно text, articleId и workspaceId' });

    try {
        const comment = await Comment.create({ text, articleId, workspaceId });
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при создании комментария' });
    }
};

export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ message: 'Комментарий не найден' });
        comment.text = text ?? comment.text;
        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении комментария' });
    }
};

export const deleteComment = async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ message: 'Комментарий не найден' });
        await comment.destroy();
        res.json({ message: 'Комментарий удален' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
};

export const getCommentsByArticle = async (req, res) => {
    const { articleId } = req.params;
    try {
        const comments = await Comment.findAll({ where: { articleId } });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении комментариев' });
    }
};
