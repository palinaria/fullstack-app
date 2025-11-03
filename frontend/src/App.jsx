import React, { useState, useEffect } from 'react';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import './App.css';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
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

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setSelectedArticle(null);
  };

  const handleFormSubmit = () => {
    setEditingArticle(null);
    fetchArticles();
  };

  const handleDeleteArticle = async (id) => {
    const confirmDelete = window.confirm("Вы точно хотите удалить эту статью?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка при удалении статьи");

      setSelectedArticle(null);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить статью");
    }
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
              <ArticleList
                  articles={articles}
                  onSelect={handleSelectArticle}
                  onEdit={handleEditArticle}
              />
              <ArticleForm
                  onSubmit={handleFormSubmit}
                  articleToEdit={editingArticle}
              />
            </>
        )}

        {selectedArticle && (
            <ArticleView
                article={selectedArticle}
                onBack={() => setSelectedArticle(null)}
                onEdit={handleEditArticle}
                onDelete={handleDeleteArticle}
            />
        )}
      </div>
  );
};

export default App;
