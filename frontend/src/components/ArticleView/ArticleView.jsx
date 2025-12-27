import React, { useState, useEffect } from 'react';
import ArticleVersionsList from '../ArticleVersionsList/ArticleVersionsList.jsx';
import './ArticleView.css';

const ArticleView = ({ article, workspaces, onBack, onDelete, onUpdate }) => {
    const [selectedVersion, setSelectedVersion] = useState(article.currentVersion);
    const [isReadonly, setIsReadonly] = useState(false);

    useEffect(() => {
        setSelectedVersion(article.currentVersion);
        setIsReadonly(false);
    }, [article]);

    const handleVersionSelect = async (versionId) => {
        if (versionId === article.currentVersion.id) {
            setSelectedVersion(article.currentVersion);
            setIsReadonly(false);
        } else {
            try {
                const res = await fetch(`http://localhost:3000/articles/${article.id}?version=${versionId}`);
                const data = await res.json();
                setSelectedVersion(data.currentVersion);
                setIsReadonly(data.isReadonly);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="article-view-container">
            <button className="back-button" onClick={onBack}>Back</button>

            <h2>{selectedVersion.title}</h2>
            <p><strong>Описание:</strong> {selectedVersion.content}</p>
            <p><strong>Workspace:</strong> {workspaces.find(w => w.id === article.workspaceId)?.name}</p>

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
                            </div>
                        );
                    })}
                </div>
            )}

            <ArticleVersionsList
                versions={[...Array(selectedVersion.version).keys()].map(i => ({ id: i+1, version: i+1 }))}
                currentVersionId={selectedVersion.id}
                onSelect={handleVersionSelect}
            />

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
