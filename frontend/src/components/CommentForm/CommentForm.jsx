import React, { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext.jsx';
import './CommentForm.css';

const CommentForm = ({ articleId, onSubmit, commentToEdit, onCancel }) => {
    const [text, setText] = useState("");
    const { token } = useAuth();

    useEffect(() => {
        if (commentToEdit) setText(commentToEdit.text);
        else setText("");
    }, [commentToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !articleId) return;

        try {
            const isEdit = !!commentToEdit?.id;

            const url = isEdit
              ? `http://localhost:3000/comments/${commentToEdit.id}`
              : `http://localhost:3000/comments`;

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text,
                    articleId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || 'Ошибка при сохранении комментария');
                return;
            }

            if (typeof onSubmit === 'function') {
                onSubmit(data);
            }

            setText("");

        } catch (err) {
            console.error(err);
            alert('Произошла ошибка при отправке комментария');
        }
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
