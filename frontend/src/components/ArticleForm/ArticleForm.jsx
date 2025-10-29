import React, { useState } from "react";
import "./ArticleForm.css";

const ArticleForm = ({ onSubmit }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("Введите заголовок и текст");
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (!res.ok) throw new Error('Ошибка при сохранении статьи');
            await res.json();

            onSubmit();
            setTitle('');
            setContent('');
        } catch (err) {
            console.error(err);
            alert('Не удалось сохранить статью');
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

                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default ArticleForm;
