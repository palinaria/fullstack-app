import React from 'react';
import './ArticleVersionsList.css';

const ArticleVersionsList = ({ versions, currentVersionId, onSelect }) => {
    if (!versions || versions.length === 0) return null;

    return (
        <div className="article-versions-list">
            <h4>Версии статьи:</h4>
            <ul>
                {versions.map(v => (
                    <li key={v.id}>
                        <button
                            className={v.id === currentVersionId ? 'current' : ''}
                            onClick={() => onSelect(v.id)}
                        >
                            Версия {v.version} {v.id === currentVersionId && '(текущая)'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ArticleVersionsList;
