import React, { useState, useEffect } from "react";
import "./ArticleForm.css";

const ArticleForm = ({ onSubmit, articleToEdit }) => {
    const [title, setTitle] = useState(articleToEdit?.title || "");
    const [content, setContent] = useState(articleToEdit?.content || "");
    const [error, setError] = useState("");

    useEffect(() => {
        setTitle(articleToEdit?.title || "");
        setContent(articleToEdit?.content || "");
    }, [articleToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            setError("Введите заголовок и текст");
            return;
        }

        try {
            const method = articleToEdit ? "PUT" : "POST";
            const url = articleToEdit
                ? `http://localhost:3000/articles/${articleToEdit.id}`
                : "http://localhost:3000/articles";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            });

            if (!res.ok) throw new Error("Ошибка при сохранении статьи");

            onSubmit();
            setTitle("");
            setContent("");
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить статью");
        }
    };

    return (
        <div className="form-container">
            <h2>{articleToEdit ? "Редактировать статью" : "Создать статью"}</h2>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                    type="text"
                    placeholder="Введите заголовок..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label>Content</label>
                <textarea
                    placeholder="Введите текст статьи..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>

                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default ArticleForm;
