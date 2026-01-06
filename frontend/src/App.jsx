import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import ArticleView from './components/ArticleView/ArticleView.jsx';
import ArticleForm from './components/ArticleForm/ArticleForm.jsx';
import CommentForm from './components/CommentForm/CommentForm.jsx';
import CommentList from './components/CommentList/CommentList.jsx';
import WorkspaceManager from './components/WorkspaceManager/WSManager/WorkspaceManager.jsx';
import UserManagement from './components/UserManagement/UserManagement.jsx';
import './App.css';

const MainAppContent = () => {
  const { token, user, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [view, setView] = useState('articles');

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


  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('http://localhost:3000/workspaces', { headers: getHeaders(  ) });
      if (res.status === 401 || res.status === 403) return logout();
      const data = await res.json();
      setWorkspaces(data);
      if (!selectedWorkspace && data.length > 0) setSelectedWorkspace(data[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) fetchWorkspaces();
  }, [token]);

  const fetchArticles = async () => {
    if (!selectedWorkspace || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/articles/workspace/${selectedWorkspace}`, { headers: getHeaders(  ) });
      if (res.status === 401 || res.status === 403) return logout();
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) { setArticles([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, [selectedWorkspace, token]);

  const handleSelectArticle = async (article) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/articles/${article.id}`, { headers: getHeaders(  ) });
      const data = await res.json();
      setSelectedArticle(data);
      const commentsRes = await fetch(`http://localhost:3000/comments/article/${data.id}?versionId=${data.currentVersion.id}`, { headers: getHeaders(  ) });
      setComments(await commentsRes.json());
    } catch (err) { alert('Ошибка загрузки'); } finally { setLoading(false); }
  };

  const handleFormSubmit = (updated) => {
    setEditingArticle(null);
    if (updated.workspaceId !== selectedWorkspace) {
      setArticles(prev => prev.filter(a => a.id !== updated.id));
      setSelectedArticle(null);
    } else {
      setArticles(prev => {
        const exists = prev.find(a => a.id === updated.id);
        return exists ? prev.map(a => a.id === updated.id ? updated : a) : [...prev, updated];
      });
      if (selectedArticle?.id === updated.id) setSelectedArticle(updated);
    }
  };

  const handleCommentSubmit = async ({ text, articleId, versionId, id }) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/comments/${id}` : 'http://localhost:3000/comments';
    const res = await fetch(url, {
      method,
      headers: getHeaders(  ),
      body: JSON.stringify({ text, articleId, versionId, workspaceId: selectedWorkspace })
    });
    const data = await res.json();
    setComments(prev => id ? prev.map(c => c.id === id ? data : c) : [...prev, data]);
    if (id) setEditingComment(null);
  };

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket('ws://localhost:3000');
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      setNotifications(prev => [...prev, msg]);
      if (msg.type === 'article_deleted') setArticles(prev => prev.filter(a => a.id !== msg.id));
      else if (msg.article?.workspaceId === selectedWorkspace) fetchArticles();
      else setArticles(prev => prev.filter(a => a.id !== msg.article?.id));
    };
    return () => ws.close();
  }, [selectedWorkspace, token]);


  if (!token) {
    return isRegister
      ? <Register onSwitch={() => setIsRegister(false)} />
      : <Login onSwitch={() => setIsRegister(true)} />;
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Articles</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user?.role === 'admin' && (
            <button onClick={() => setView(view === 'articles' ? 'users' : 'articles')}>
              {view === 'articles' ? 'Управление пользователями' : 'К статьям'}
            </button>
          )}
          <span>{user?.email} ({user?.role})</span>
          <button onClick={logout} className="logout-btn">Выйти</button>
        </div>
      </header>

      <WorkspaceManager
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        onSelect={setSelectedWorkspace}
        onChange={() => { fetchWorkspaces(); fetchArticles(); }}
      />

      <div className="notifications">
        {notifications.map((n,i) => (
          <div key={i} className="notification">
            {n.type === 'article_created' && `Новая статья: "${n.article?.title}"`}
            {n.type === 'article_updated' && `Обновлена: "${n.article?.title}"`}
            {n.type === 'article_deleted' && `Удалена статья ID ${n.id}`}
          </div>
        ))}
      </div>

      {loading ? <p>Loading...</p> : view === 'users' ? (
        <UserManagement />
      ) : !selectedArticle ? (
        <>
          <ArticleList articles={articles} onSelect={handleSelectArticle} />
          <ArticleForm onSubmit={handleFormSubmit} workspaceId={selectedWorkspace} workspaces={workspaces} />
        </>
      ) : !editingArticle && (
        <>
          <ArticleView
            article={selectedArticle}
            workspaces={workspaces}
            onBack={() => setSelectedArticle(null)}
            onDelete={id => {
              fetch(`http://localhost:3000/articles/${id}`, { method:'DELETE', headers: getHeaders(  ) });
              setSelectedArticle(null);
              fetchArticles();
            }}
            onUpdate={setEditingArticle}
            onVersionChange={async vid => {
              const r = await fetch(`http://localhost:3000/comments/article/${selectedArticle.id}?versionId=${vid}`, { headers: getHeaders(  ) });
              setComments(await r.json());
            }}
          />
          <CommentList
            comments={comments}
            onEdit={setEditingComment}
            onDelete={id => {
              fetch(`http://localhost:3000/comments/${id}`, { method:'DELETE', headers: getHeaders(  ) });
              setComments(prev => prev.filter(c => c.id !== id));
            }}
          />
          <CommentForm
            onSubmit={(data) => handleCommentSubmit({ ...data, versionId: selectedArticle.currentVersion.id })}
            articleId={selectedArticle.id}
            workspaceId={selectedWorkspace}
            commentToEdit={editingComment}
            onCancel={() => setEditingComment(null)}
          />

        </>
      )}
      {editingArticle && (
        <ArticleForm
          articleToEdit={editingArticle.currentVersion}
          articleId={editingArticle.id}
          workspaceId={editingArticle.workspaceId}
          workspaces={workspaces}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};


const App = () => (
  <AuthProvider>
    <MainAppContent />
  </AuthProvider>
);

export default App;
