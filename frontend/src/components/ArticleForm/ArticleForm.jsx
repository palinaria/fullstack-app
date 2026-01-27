import React, { useState, useEffect } from 'react';
import './ArticleForm.css';

const ArticleForm = ({ onSubmit, articleToEdit, workspaceId, articleId, workspaces }) => {
    const [title, setTitle] = useState(articleToEdit?.title || '');
    const [content, setContent] = useState(articleToEdit?.content || '');
    const [selectedWS, setSelectedWS] = useState(workspaceId);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        setTitle(articleToEdit?.title || '');
        setContent(articleToEdit?.content || '');
        setSelectedWS(workspaceId);
    }, [articleToEdit, workspaceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('workspaceId', selectedWS);
        files.forEach(f => formData.append('files', f));

        const url = articleToEdit ? `http://localhost:3000/articles/${articleId}` : 'http://localhost:3000/articles';
        const res = await fetch(url, { method: articleToEdit ? 'PUT' : 'POST', body: formData } );
        onSubmit(await res.json());
        setTitle(''); setContent(''); setFiles([]);
    };

    return (
        <div className="article-form">
            <h2>{articleToEdit ? 'Редактировать статью' : 'Создать статью'}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Заголовок" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea placeholder="Текст" value={content} onChange={e => setContent(e.target.value)} />
                <select value={selectedWS} onChange={e => setSelectedWS(e.target.value)}>
                    {workspaces?.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
                </select>
                <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files))} />
                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};
export default ArticleForm;
