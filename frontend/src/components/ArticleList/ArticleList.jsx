import React from "react";
import "./ArticleList.css";

const ArticleList = ({ articles, onSelect, onEdit }) => {
    if (!Array.isArray(articles) || articles.length === 0) return <p className="empty">Нет статей</p>;
    return (
        <ul className="article-list">
            {articles.map((article) => (
                <li key={article.id} onClick={() => onSelect(article)}>
                    <div className="article-item">
                        <h3>{article.title}</h3>
                        <div className="article-actions">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(article); }}>Edit</button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ArticleList;