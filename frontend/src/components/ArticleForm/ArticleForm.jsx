import React, { useState } from "react";
import "./ArticleForm.css";

const ArticleForm = ({ onSubmit }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!title.trim() || !content.trim()) {
            setError("Введите заголовок и текст");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) throw new Error("Ошибка при сохранении статьи");
            await res.json();

            onSubmit();
            setTitle("");
            setContent("");
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить статью. Попробуйте позже.");
        }
    };

    return (
        <div className="form-container">
            <h2>Create Article</h2>
            <div className="underline"></div>

            <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                    type="text"
                    placeholder="Enter title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label>Content</label>
                <textarea
                    placeholder="Write your content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>


                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Статья успешно сохранена!</p>}

                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default ArticleForm;
