import React from 'react';
import './ArticleVersionsList.css';

const ArticleVersionsList = ({ versions, currentVersionNumber, onSelect }) => {
    if (!versions || versions.length === 0) return null;
    const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
    return (
        <div className="article-versions-list">
            <h4>Версии статьи:</h4>
            <ul>
                {sortedVersions.map(v => (
                    <li key={v.id}>
                        <button className={v.version === currentVersionNumber ? 'current' : ''} onClick={() => onSelect(v.version)}>
                            Версия {v.version} {v.version === currentVersionNumber && '(текущая)'}
                        </button>
                        <span className="version-date">{new Date(v.createdAt).toLocaleString('ru-RU')}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ArticleVersionsList;
