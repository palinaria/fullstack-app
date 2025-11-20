import React, { useState, useEffect, useRef } from 'react';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import './App.css';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

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

  const handleFormSubmit = (updatedArticle) => {
    setEditingArticle(null);
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      setSelectedArticle(prev => ({ ...prev, ...updatedArticle }));
    }
    setArticles(prevArticles =>
        prevArticles.map(a => (a.id === updatedArticle.id ? { ...a, ...updatedArticle } : a))
    );
  };

  const handleDeleteArticle = async (id) => {
    const confirmDelete = window.confirm("Вы точно хотите удалить эту статью?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:3000/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка при удалении статьи");
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle(null);
      }
      setArticles(prevArticles => prevArticles.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить статью");
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!wsRef.current) {
      const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:3000');
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket подключен");

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (['article_created', 'article_updated', 'article_deleted'].includes(message.type)) {
            setNotifications(prev => [...prev, message]);
            if (message.type === 'article_created') {
              setArticles(prev => [...prev, message.article]);
            } else if (message.type === 'article_deleted') {
              setArticles(prev => prev.filter(a => a.id !== message.id));
              if (selectedArticle && selectedArticle.id === message.id) {
                setSelectedArticle(null);
              }
            }
          }
        };

        ws.onerror = (err) => console.error("WebSocket ошибка:", err);

        ws.onclose = () => {
          setTimeout(() => {
            wsRef.current = null;
            connectWebSocket();
          }, 3000);
        };
      };

      connectWebSocket();
    }
  }, [selectedArticle]);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [notifications]);

  return (
      <div className="app-container">
        <h1>My Articles</h1>

        <div className="notifications">
          {notifications.map((n, index) => (
              <div key={index} className="notification">
                {n.type === 'article_created' && `Новая статья: "${n.article.title}"`}
                {n.type === 'article_updated' && `Статья обновлена: "${n.article.title}"`}
                {n.type === 'article_deleted' && `Статья удалена (ID: ${n.id})`}
              </div>
          ))}
        </div>

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
