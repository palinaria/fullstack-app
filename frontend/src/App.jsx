import React, { useState, useEffect, useRef } from 'react';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import CommentForm from './components/CommentForm/CommentForm.jsx';
import CommentList from './components/CommentList/CommentList.jsx';
import './App.css';
import './components/CommentForm/CommentForm.css';
import './components/CommentList/CommenList.css';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  // ====================== ARTICLES ======================
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/articles');
      if (!res.ok) throw new Error("Ошибка загрузки статей");
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
      if (!res.ok) throw new Error("Ошибка загрузки статьи");
      const data = await res.json();
      setSelectedArticle(data);
      fetchComments(data.id);
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
        prevArticles.map(a => a.id === updatedArticle.id ? { ...a, ...updatedArticle } : a)
    );
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Вы точно хотите удалить эту статью?")) return;
    try {
      const res = await fetch(`http://localhost:3000/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка при удалении статьи");
      if (selectedArticle && selectedArticle.id === id) setSelectedArticle(null);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить статью");
    }
  };

  // ====================== COMMENTS ======================
  const fetchComments = async (articleId) => {
    try {
      const res = await fetch(`http://localhost:3000/comments/article/${articleId}`);
      if (!res.ok) throw new Error("Ошибка загрузки комментариев");
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setComments([]);
    }
  };

  const handleCommentSubmit = async ({ text, articleId, id }) => {
    try {
      if (!text.trim() || !articleId) return;

      const method = id ? 'PUT' : 'POST';
      const url = id ? `http://localhost:3000/comments/${id}` : `http://localhost:3000/comments`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, articleId })
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('Ошибка от сервера:', errData);
        return;
      }

      const data = await res.json();
      if (!data.id) return;

      setComments(prev => Array.isArray(prev) ? [...prev, data] : [data]);
      if (id) setEditingComment(null);
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
    }
  };

  const handleCommentDelete = async (id) => {
    if (!window.confirm("Удалить комментарий?")) return;
    try {
      const res = await fetch(`http://localhost:3000/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка удаления");
      setComments(prev => Array.isArray(prev) ? prev.filter(c => c.id !== id) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentEdit = (comment) => {
    setEditingComment(comment);
  };

  // ====================== WEBSOCKET ======================
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
          setNotifications(prev => Array.isArray(prev) ? [...prev, message] : [message]);

          if (message.type === 'article_created') setArticles(prev => Array.isArray(prev) ? [...prev, message.article] : [message.article]);
          if (message.type === 'article_deleted') {
            setArticles(prev => Array.isArray(prev) ? prev.filter(a => a.id !== message.id) : []);
            if (selectedArticle && selectedArticle.id === message.id) setSelectedArticle(null);
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
      setNotifications(prev => Array.isArray(prev) ? prev.slice(1) : []);
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
            <>
              <ArticleView
                  article={selectedArticle}
                  onBack={() => setSelectedArticle(null)}
                  onEdit={handleEditArticle}
                  onDelete={handleDeleteArticle}
              />
              <CommentList
                  comments={comments}
                  onEdit={handleCommentEdit}
                  onDelete={handleCommentDelete}
              />
              <CommentForm
                  onSubmit={handleCommentSubmit}
                  articleId={selectedArticle.id}
                  commentToEdit={editingComment}
                  onCancel={() => setEditingComment(null)}
              />
            </>
        )}
      </div>
  );
};

export default App;
