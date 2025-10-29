import React, { useState, useEffect } from 'react';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import './App.css';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('http://localhost:3000/articles');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error('Ошибка при загрузке статей:', err);
    }
  };

  const handleSelectArticle = async (article) => {
    try {
      const res = await fetch(`http://localhost:3000/articles/${article.id}`);
      const data = await res.json();
      setSelectedArticle(data);
    } catch (err) {
      console.error('Ошибка при загрузке статьи:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
      <div className="app-container">
        <h1>My Articles</h1>
        {!selectedArticle && (
            <>
              <ArticleList articles={articles} onSelect={handleSelectArticle} />
              <ArticleForm onSubmit={fetchArticles} />
            </>
        )}
        {selectedArticle && (
            <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        )}
      </div>
  );
};

export default App;
