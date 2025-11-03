import React from 'react';
import './ArticleView.css';

const ArticleView = ({ article, onBack, onEdit }) => {
    if (!article) return null;

    return (
        <div className="article-view">
            <button onClick={onBack}>Back</button>
            <h2>{article.title}</h2>
            <div className="content">{article.content}</div>
            <div className="edit-button-container">
                <button onClick={() => onEdit(article)}>Edit</button>
            </div>
        </div>
    );
};

export default ArticleView;
