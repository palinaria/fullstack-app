import React, { useState, useEffect } from 'react';
import './ArticleList.css';

const ArticleList = ({ articles, onSelect, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, onSearch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="article-list-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Начните вводить название или текст статьи..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchQuery && (
          <button type="button" onClick={handleClearSearch} className="clear-button-inline">
            ✕
          </button>
        )}
      </div>

      {searchQuery && (
        <p className="search-results-info">
          Поиск по запросу: "<strong>{searchQuery}</strong>"
        </p>
      )}

      {!articles || articles.length === 0 ? (
        <p className="empty">Статей не найдено</p>
      ) : (
        <div className="article-list">
          {articles.map(article => (
            <div key={article.id} className="article-item">
              <h3>{article.title}</h3>
              <p>{article.content}</p>
              <button onClick={() => onSelect(article)}>View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;
