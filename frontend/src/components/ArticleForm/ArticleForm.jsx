import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx'; // Добавлен импорт контекста
import './ArticleForm.css';

const ArticleForm = ({ onSubmit, articleToEdit, workspaceId, articleId, workspaces }) => {
    const { token } = useAuth(); // Получаем токен из контекста
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

        try {
            const res = await fetch(url, {
                method: articleToEdit ? 'PUT' : 'POST',
                body: formData,
                headers: {
                    // ВАЖНО: Добавляем токен в заголовки
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

            // Сброс поля выбора файлов
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
