import React, { useState, useEffect } from 'react';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import './App.css';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/articles');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArticle = async (article) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/articles/${article.id}`);
      const data = await res.json();
      setSelectedArticle(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (newArticle) => {
    setSelectedArticle(newArticle);
    await fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
      <div className="app-container">
        <h1>My Articles</h1>
        {loading && <p>Loading...</p>}
        {!selectedArticle && !loading && (
            <>
              <ArticleList articles={articles} onSelect={handleSelectArticle} />
              <ArticleForm onSubmit={handleCreateArticle} />
            </>
        )}
        {selectedArticle && (
            <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        )}
      </div>
  );
};

export default App;
