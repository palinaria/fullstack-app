import React from 'react';
import './ArticleView.css';

const ArticleView = ({ article, onBack, onEdit, onDelete }) => {
    if (!article) return null;

    return (
        <div className="article-view">
            <button onClick={onBack}>Back</button>
            <h2>{article.title}</h2>
            <div className="content">{article.content}</div>

            <div className="edit-button-container">
                <button onClick={() => onEdit(article)}>Edit</button>
                <button onClick={() => onDelete(article.id)} style={{ marginLeft: '10px' }}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ArticleView;
