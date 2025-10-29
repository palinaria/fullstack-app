import React from "react";
import "./ArticleList.css";

const ArticleList = ({ articles, onSelect }) => {
    if (!articles.length) return <p className="empty">Нет статей</p>;

    return (
        <div className="article-list">
            {articles.map((article) => (
                <div
                    key={article.id}
                    className="article-item"
                    onClick={() => onSelect(article)}
                >
                    <h3>{article.title}</h3>
                </div>
            ))}
        </div>
    );
};

export default ArticleList;
