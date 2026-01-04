import React, { useState, useEffect } from 'react';
import ArticleVersionsList from '../ArticleVersionsList/ArticleVersionsList.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import './ArticleView.css';

const ArticleView = ({ article, workspaces, onBack, onDelete, onUpdate }) => {
    const [selectedVersion, setSelectedVersion] = useState(article.currentVersion);
    const [isReadonly, setIsReadonly] = useState(false);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const res = await fetch(`http://localhost:3000/articles/${article.id}/versions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Ошибка загрузки версий');
                const data = await res.json();
                setVersions(data);
            } catch (err) { setError('Не удалось загрузить версии статьи'); }
        };
        fetchVersions();
    }, [article.id, token]);

    useEffect(() => {
        setSelectedVersion(article.currentVersion);
        setIsReadonly(false);
        setError('');
    }, [article]);

    const handleVersionSelect = async (versionNumber) => {
        if (versionNumber === article.currentVersion.version) {
            setSelectedVersion(article.currentVersion);
            setIsReadonly(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:3000/articles/${article.id}?version=${versionNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Ошибка загрузки версии');
            const data = await res.json();
            setSelectedVersion(data.currentVersion);
            setIsReadonly(data.isReadonly);
        } catch (err) { setError('Не удалось загрузить выбранную версию'); } finally { setLoading(false); }
    };

    if (!selectedVersion) return <div className="article-view-container">Загрузка данных...</div>;

    return (
      <div className="article-view-container">
          <button className="back-button" onClick={onBack}>Back</button>
          {isReadonly && (
            <div className="readonly-banner">
                ⚠️ Вы просматриваете старую версию статьи (версия {selectedVersion.version}). Редактирование недоступно.
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Загрузка версии...</div>}
          <h2>{selectedVersion.title}</h2>
          <p><strong>Описание:</strong> {selectedVersion.content}</p>
          <p><strong>Workspace:</strong> {workspaces.find(w => w.id === article.workspaceId)?.name}</p>
          <p><strong>Версия:</strong> {selectedVersion.version}</p>
          {Array.isArray(selectedVersion.files) && selectedVersion.files.length > 0 && (
            <div className="attachments">
                <h3>Вложения:</h3>
                {selectedVersion.files.map((file, index) => {
                    const fileUrl = `http://localhost:3000/uploads/${file}`;
                    const lower = file.toLowerCase();
                    const isImage = lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png');
                    const isPDF = lower.endsWith('.pdf');
                    return (
                      <div key={index} className="attachment-item">
                          {isImage && <img src={fileUrl} alt="attachment" className="attachment-image" />}
                          {isPDF && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-pdf">📄 {file}</a>}
                          {!isImage && !isPDF && <a href={fileUrl} target="_blank" rel="noopener noreferrer">📎 {file}</a>}
                      </div>
                    );
                })}
            </div>
          )}
          <ArticleVersionsList versions={versions} currentVersionNumber={selectedVersion.version} onSelect={handleVersionSelect} />
          {!isReadonly && (
            <div className="edit-button-container">
                <button onClick={() => onUpdate(article)}>Edit</button>
                <button onClick={() => onDelete(article.id)}>Delete</button>
            </div>
          )}
      </div>
    );
};

export default ArticleView;
