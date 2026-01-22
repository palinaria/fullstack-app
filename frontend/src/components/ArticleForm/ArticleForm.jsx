import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import API_URL from '../../../apiConfig.js';
import './ArticleForm.css';

const ArticleForm = ({ onSubmit, articleToEdit, workspaceId, articleId, workspaces }) => {
    const { token } = useAuth();
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

        const url = articleToEdit ? `${API_URL}/articles/${articleId}` : `${API_URL}/articles`;

        try {
            const res = await fetch(url, {
                method: articleToEdit ? 'PUT' : 'POST',
                body: formData,
                headers: {

                    'Authorization': `Bearer ${token}`
                }
            } );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || 'Ошибка при сохранении статьи');
                return;
            }

            onSubmit(data);
            setTitle('');
            setContent('');
            setFiles([]);


            const fileInput = e.target.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

        } catch (err) {
            console.error(err);
            alert('Произошла ошибка при отправке данных');
        }
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
