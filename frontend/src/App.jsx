// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import CommentForm from './components/CommentForm/CommentForm.jsx';
import CommentList from './components/CommentList/CommentList.jsx';
import WorkspaceManager from './components/WorkspaceManager/WSManager/WorkspaceManager.jsx';

import './App.css';
import "./components/CommentForm/CommentForm.css";
import './components/CommentList/CommenList.css';
import './components/ArticleForm/ArticleForm.css';
import './components/ArticleList/ArticleList.css';
import './components/ArticleView/ArticleView.css';


const App = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);

  // fetch workspaces
  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('http://localhost:3000/workspaces');
      const data = await res.json();
      setWorkspaces(data);
      if (!selectedWorkspace && data.length > 0) setSelectedWorkspace(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  // articles per workspace
  const fetchArticles = async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/articles/workspace/${selectedWorkspace}`);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, [selectedWorkspace]);

  const handleSelectArticle = async (article) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/articles/${article.id}`);
      const data = await res.json();
      setSelectedArticle(data);
      const commentsRes = await fetch(`http://localhost:3000/comments/article/${data.id}`);
      const commentsData = await commentsRes.json();
      setComments(commentsData);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleFormSubmit = (updatedArticle) => {
    setEditingArticle(null);
    if (selectedArticle && selectedArticle.id === updatedArticle.id) setSelectedArticle(prev => ({ ...prev, ...updatedArticle }));
    setArticles(prev => prev.map(a => a.id === updatedArticle.id ? { ...a, ...updatedArticle } : a));
  };

  // delete article
  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Вы точно хотите удалить эту статью?')) return;
    try {
      const res = await fetch(`http://localhost:3000/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка');
      setArticles(prev => prev.filter(a => a.id !== id));
      if (selectedArticle?.id === id) setSelectedArticle(null);
    } catch (err) {
      console.error(err);
    }
  };

  // comments
  const handleCommentSubmit = async ({ text, articleId, id }) => {
    try {
      if (!text.trim()) return;
      const method = id ? 'PUT' : 'POST';
      const url = id ? `http://localhost:3000/comments/${id}` : 'http://localhost:3000/comments';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, articleId, workspaceId: selectedWorkspace })
      });
      const data = await res.json();
      if (id) {
        setComments(prev => prev.map(c => c.id === id ? data : c));
        setEditingComment(null);
      } else {
        setComments(prev => [...prev, data]);
      }
    } catch (err) { console.error(err); }
  };

  const handleCommentDelete = async (id) => {
    if (!window.confirm('Удалить комментарий?')) return;
    try {
      await fetch(`http://localhost:3000/comments/${id}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  // websockets for notifications
  useEffect(() => {
    if (!wsRef.current) {
      const connect = () => {
        const ws = new WebSocket('ws://localhost:3000');
        wsRef.current = ws;
        ws.onopen = () => console.log('WS connected');
        ws.onmessage = e => {
          const msg = JSON.parse(e.data);
          setNotifications(prev => [...prev, msg]);
          if (msg.article && msg.article.workspaceId !== selectedWorkspace) return;
          if (msg.type === 'article_created') setArticles(prev => [...prev, msg.article]);
          if (msg.type === 'article_deleted') setArticles(prev => prev.filter(a => a.id !== msg.id));
        };
        ws.onclose = () => { wsRef.current = null; setTimeout(connect, 2000); };
      };
      connect();
    }
  }, [selectedWorkspace]);

  return (
      <div className="app-container">
        <h1>My Articles</h1>

        <WorkspaceManager
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace}
            onSelect={setSelectedWorkspace}
            onChange={() => { fetchWorkspaces(); fetchArticles(); }}
        />

        <div className="notifications">
          {notifications.map((n,i) => (
              <div key={i} className="notification">
                {n.type === 'article_created' && `Новая статья: "${n.article.title}"`}
                {n.type === 'article_updated' && `Обновлена: "${n.article.title}"`}
                {n.type === 'article_deleted' && `Удалена статья ID ${n.id}`}
              </div>
          ))}
        </div>

        {loading && <p>Loading...</p>}

        {!selectedArticle && !loading && (
            <>
              <ArticleList articles={articles} onSelect={handleSelectArticle} onEdit={setEditingArticle} />
              <ArticleForm
                  onSubmit={handleFormSubmit}
                  articleToEdit={editingArticle}
                  workspaceId={selectedWorkspace}
                  onCreated={() => fetchArticles()}
              />
            </>
        )}

        {selectedArticle && (
            <>
              <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} onEdit={setEditingArticle} onDelete={handleDeleteArticle} />
              <CommentList comments={comments} onEdit={setEditingComment} onDelete={handleCommentDelete} />
              <CommentForm onSubmit={handleCommentSubmit} articleId={selectedArticle.id} commentToEdit={editingComment} onCancel={() => setEditingComment(null)} />
            </>
        )}
      </div>
  );
};

export default App;
