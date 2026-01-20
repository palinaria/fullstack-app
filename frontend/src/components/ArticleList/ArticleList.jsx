import React, { useState } from 'react';
import './ArticleList.css';

const ArticleList = ({ articles, onSelect, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    if (onSearch && searchQuery.trim() !== '') {
      onSearch(searchQuery);
      setIsSearched(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearched(false);
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="article-list-container">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Поиск по названию или содержанию..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-button">Поиск</button>

        {(isSearched || searchQuery) && (
          <button type="button" onClick={handleClearSearch} className="clear-button">
            {isSearched ? 'Назад ко всем статьям' : 'Очистить'}
          </button>
        )}
      </form>

      {isSearched && <p className="search-results-info">Результаты поиска для: "<strong>{searchQuery}</strong>"</p>}

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
