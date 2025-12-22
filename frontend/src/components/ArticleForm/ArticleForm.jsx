
import React, { useState, useEffect } from 'react';
import './ArticleForm.css';

const ArticleForm = ({ onSubmit, articleToEdit, workspaceId }) => {
    const [title, setTitle] = useState(articleToEdit?.title || '');
    const [content, setContent] = useState(articleToEdit?.content || '');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        setTitle(articleToEdit?.title || '');
        setContent(articleToEdit?.content || '');
        setFiles([]);
        setError('');
    }, [articleToEdit]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            setError('Введите заголовок и текст');
            return;
        }

        try {
            const method = articleToEdit ? 'PUT' : 'POST';
            const url = articleToEdit ? `http://localhost:3000/articles/${articleToEdit.id}` : 'http://localhost:3000/articles';

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('workspaceId', workspaceId);
            files.forEach((file) => formData.append('files', file));

            const res = await fetch(url, { method, body: formData });
            if (!res.ok) throw new Error('Ошибка при сохранении статьи');

            const updatedArticle = await res.json();
            onSubmit(updatedArticle);
            setTitle('');
            setContent('');
            setFiles([]);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Не удалось сохранить статью');
        }
    };

    return (
        <div className="article-form">
            <h2>{articleToEdit ? 'Редактировать статью' : 'Создать статью'}</h2>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Введите заголовок..." value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea placeholder="Введите текст статьи..." value={content} onChange={(e) => setContent(e.target.value)} />
                <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default ArticleForm;
