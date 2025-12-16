import React from 'react';
import './ArticleList.css';

const ArticleList = ({ articles, onSelect }) => {
    // Проверка на пустой массив
    if (!articles || articles.length === 0) return <p className="empty">Статей нет</p>;

    return (
        <div className="article-list">
            {articles.map(article => (
                <div key={article.id} className="article-item">
                    <h3>{article.title}</h3>
                    <p>{article.content}</p>
                    <button onClick={() => onSelect(article)}>View</button>
                </div>
            ))}
        </div>
    );
};

export default ArticleList;
