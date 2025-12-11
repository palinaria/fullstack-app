import { Comment } from "../models/comment.js";

export const createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const articleId = parseInt(req.body.articleId, 10);

        if (!text || isNaN(articleId)) {
            return res.status(400).json({ error: "Поле 'text' и числовой 'articleId' обязательны" });
        }

        const comment = await Comment.create({ text, articleId });
        res.json(comment);
    } catch (error) {
        console.error("Ошибка создания комментария:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

export const getCommentsByArticle = async (req, res) => {
    try {
        const articleId = parseInt(req.params.articleId, 10);
        if (isNaN(articleId)) {
            return res.status(400).json({ error: "Неверный articleId" });
        }

        const comments = await Comment.findAll({
            where: { articleId },
            order: [["createdAt", "ASC"]]
        });

        res.json(comments);
    } catch (error) {
        console.error("Ошибка получения комментариев:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ error: error.message, stack: error.stack });
    }

};


export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ error: "Комментарий не найден" });

        comment.text = text;
        await comment.save();

        res.json(comment);
    } catch (error) {
        console.error("Ошибка обновления комментария:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ error: "Комментарий не найден" });

        await comment.destroy();
        res.json({ message: "Комментарий удалён" });
    } catch (error) {
        console.error("Ошибка удаления комментария:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};
