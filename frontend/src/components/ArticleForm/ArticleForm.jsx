import React, { useState } from "react";
import "./ArticleForm.css";

const ArticleForm = ({ onSubmit }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content) {
            setError("Введите заголовок и текст");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const res = await fetch('http://localhost:3000/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error('Ошибка при сохранении статьи');

            const data = await res.json();
            setTitle('');
            setContent('');
            onSubmit(data);
        } catch (err) {
            console.error(err);
            setError("Не удалось сохранить статью");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Create Article</h2>
            <div className="underline"></div>
            <form onSubmit={handleSubmit}>
                {error && <div className="form-error">{error}</div>}
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
                <button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
};

export default ArticleForm;
