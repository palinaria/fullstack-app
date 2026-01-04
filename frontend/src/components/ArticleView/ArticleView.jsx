import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import './ArticleView.css';

const ArticleView = ({ article, onBack, onDelete, onUpdate, onVersionChange }) => {
    const [versions, setVersions] = useState([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const res = await fetch(`http://localhost:3000/articles/${article.id}/versions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                } );
                const data = await res.json();
                setVersions(data);
            } catch (err) {
                console.error('Ошибка загрузки версий:', err);
            }
        };
        fetchVersions();
    }, [article.id, token]);

    return (
      <div className="article-view">
          <button onClick={onBack}>Назад</button>
          <div className="article-header">
              <h2>{article.currentVersion.title}</h2>
              <div className="actions">
                  <button onClick={() => onUpdate(article)}>Редактировать</button>
                  <button onClick={() => onDelete(article.id)}>Удалить</button>
              </div>
          </div>

          <div className="version-selector">
              <label>Версия: </label>
              <select onChange={(e) => onVersionChange(e.target.value)}>
                  {versions.map(v => (
                    <option key={v.id} value={v.version}>Версия {v.version} ({new Date(v.createdAt).toLocaleString()})</option>
                  ))}
              </select>
          </div>

          <div className="article-content">
              <p>{article.currentVersion.content}</p>
          </div>

          {article.currentVersion.files?.length > 0 && (
            <div className="article-files">
                <h4>Файлы:</h4>
                <ul>
                    {article.currentVersion.files.map((file, idx) => (
                      <li key={idx}>
                          <a href={`http://localhost:3000/uploads/${file}`} target="_blank" rel="noreferrer">{file}</a>
                      </li>
                    ))}
                </ul>
            </div>
          )}
      </div>
    );
};

export default ArticleView;
