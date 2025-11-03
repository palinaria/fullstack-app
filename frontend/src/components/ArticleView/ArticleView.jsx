import React from 'react';
import './ArticleView.css';

const ArticleView = ({ article, onBack }) => {
    if (!article) return null;
    return (
        <div className="article-view">
            <button onClick={onBack}>Back</button>
            <h2>{article.title}</h2>
            <div className="content">{article.content}</div>
        </div>
    );
};

export default ArticleView;
