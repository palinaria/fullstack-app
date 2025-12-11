import React, { useState, useEffect } from "react";
import './CommentForm.css';

const CommentForm = ({ articleId, onSubmit, commentToEdit, onCancel }) => {
    const [text, setText] = useState("");

    // Если редактируем комментарий, подставляем его текст
    useEffect(() => {
        if (commentToEdit) setText(commentToEdit.text);
        else setText(""); // при создании нового комментария очищаем
    }, [commentToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !articleId) return; // проверяем, что есть текст и articleId
        onSubmit({ text, articleId, id: commentToEdit?.id });
        setText(""); // очищаем поле после отправки
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <textarea
                placeholder="Введите комментарий..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">{commentToEdit ? "Сохранить" : "Добавить"}</button>
            {commentToEdit && <button type="button" onClick={onCancel}>Отмена</button>}
        </form>
    );
};

export default CommentForm;
