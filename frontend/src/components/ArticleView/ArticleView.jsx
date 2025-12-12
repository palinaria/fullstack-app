import React, { useState, useEffect } from 'react';
import './ArticleView.css';

const ArticleView = ({ article, workspaces, onBack, onDelete, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(article.title || '');
    const [description, setDescription] = useState(article.content || '');
    const [workspaceId, setWorkspaceId] = useState(article.workspaceId || '');
    const files = Array.isArray(article.files) ? article.files : [];

    useEffect(() => {
        setTitle(article.title || '');
        setDescription(article.content || '');
        setWorkspaceId(article.workspaceId || '');
    }, [article]);

    const handleSave = async () => {
        if (!title || !description || !workspaceId) return alert('Заполните все поля');
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', description);
            formData.append('workspaceId', workspaceId);

            const res = await fetch(`http://localhost:3000/articles/${article.id}`, {
                method: 'PUT',
                body: formData
            });

            if (!res.ok) throw new Error('Ошибка обновления');
            const updatedArticle = await res.json();
            onUpdate(updatedArticle);
            setEditing(false);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="article-view-container">
            <button className="back-button" onClick={onBack}>Back</button>

            {!editing ? (
                <>
                    <h2>{article.title}</h2>
                    <p><strong>Описание:</strong> {article.content}</p>
                    <p><strong>Workspace:</strong> {workspaces.find(w => w.id === article.workspaceId)?.name}</p>

                    {files.length > 0 && (
                        <div className="attachments">
                            <h3>Вложения:</h3>
                            {files.map((file, index) => {
                                const fileUrl = `http://localhost:3000/uploads/${file}`;
                                const lower = file.toLowerCase();
                                const isImage = lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png');
                                const isPDF = lower.endsWith('.pdf');
                                return (
                                    <div key={index} className="attachment-item">
                                        {isImage && <img src={fileUrl} alt="attachment" className="attachment-image" />}
                                        {isPDF && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-pdf">📄 {file}</a>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="edit-button-container">
                        <button onClick={() => setEditing(true)}>Edit</button>
                        <button onClick={() => onDelete(article.id)}>Delete</button>
                    </div>
                </>
            ) : (
                <div className="article-edit-form">
                    <h2>Редактировать статью</h2>
                    <label>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                    <label>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} />
                    <label>Workspace</label>
                    <select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
                        {workspaces.map(ws => (
                            <option key={ws.id} value={ws.id}>{ws.name}</option>
                        ))}
                    </select>
                    <div className="edit-button-container">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleView;
