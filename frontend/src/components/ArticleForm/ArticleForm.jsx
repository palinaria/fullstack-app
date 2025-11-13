import React, { useState, useEffect } from "react";
import "./ArticleForm.css";

const ArticleForm = ({ onSubmit, articleToEdit }) => {
    const [title, setTitle] = useState(articleToEdit?.title || "");
    const [content, setContent] = useState(articleToEdit?.content || "");
    const [file, setFile] = useState(null);
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


            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (file) {
                formData.append("file", file);
            }

            const res = await fetch(url, {
                method,
                body: formData,
            });

            if (!res.ok) throw new Error("Ошибка при сохранении статьи");

            onSubmit();
            setTitle("");
            setContent("");
            setFile(null);
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

                <label>Прикрепить файл</label>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default ArticleForm;
