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
import './App.css';

const API_URL = 'http://localhost:3000';

const MainAppContent = () => {
  const { token, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

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


  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const jsonHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });


  const handleAuthStatus = async (res) => {
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Unauthorized');
    }
    return res;
  };

  // ----- WORKSPACES -----
  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${API_URL}/workspaces`, { headers: authHeaders() });
      await handleAuthStatus(res);
      const data = await res.json();

      setWorkspaces(data);
      if (!selectedWorkspace && Array.isArray(data) && data.length > 0) {
        setSelectedWorkspace(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ----- ARTICLES -----
  const fetchArticles = async () => {
    if (!selectedWorkspace || !token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/articles/workspace/${selectedWorkspace}`, {
        headers: authHeaders(),
      });
      await handleAuthStatus(res);

      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();

  }, [selectedWorkspace, token]);

  const handleSelectArticle = async (article) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/articles/${article.id}`, {
        headers: authHeaders(),
      });
      await handleAuthStatus(res);

      const data = await res.json();
      setSelectedArticle(data);

      const commentsRes = await fetch(
        `${API_URL}/comments/article/${data.id}?versionId=${data.currentVersion.id}`,
        { headers: authHeaders() }
      );
      await handleAuthStatus(commentsRes);

      setComments(await commentsRes.json());
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (updated) => {
    setEditingArticle(null);

    if (updated.workspaceId !== selectedWorkspace) {
      setArticles((prev) => prev.filter((a) => a.id !== updated.id));
      setSelectedArticle(null);
    } else {
      setArticles((prev) => {
        const exists = prev.find((a) => a.id === updated.id);
        return exists ? prev.map((a) => (a.id === updated.id ? updated : a)) : [...prev, updated];
      });

      if (selectedArticle?.id === updated.id) setSelectedArticle(updated);
    }
  };

  // ----- COMMENTS -----
  const handleCommentSubmit = async ({ text, articleId, versionId, id }) => {
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_URL}/comments/${id}` : `${API_URL}/comments`;

      const res = await fetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify({ text, articleId, versionId, workspaceId: selectedWorkspace }),
      });

      await handleAuthStatus(res);

      const data = await res.json();
      setComments((prev) => (id ? prev.map((c) => (c.id === id ? data : c)) : [...prev, data]));
      if (id) setEditingComment(null);
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения комментария');
    }
  };

  // ----- WEBSOCKET -----
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket('ws://localhost:3000');
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setNotifications((prev) => [...prev, msg]);

      if (msg.type === 'article_deleted') {
        setArticles((prev) => prev.filter((a) => a.id !== msg.id));
      } else if (msg.article?.workspaceId === selectedWorkspace) {
        fetchArticles();
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== msg.article?.id));
      }
    };

    return () => ws.close();

  }, [selectedWorkspace, token]);


  if (!token) {
    return isRegister ? (
      <Register onSwitch={() => setIsRegister(false)} />
    ) : (
      <Login onSwitch={() => setIsRegister(true)} />
    );
  }


  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Articles</h1>
        <button onClick={logout} className="logout-btn">
          Выйти
        </button>
      </header>

      <WorkspaceManager
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        onSelect={setSelectedWorkspace}
        onChange={() => {
          fetchWorkspaces();
          fetchArticles();
        }}
      />

      <div className="notifications">
        {notifications.map((n, i) => (
          <div key={i} className="notification">
            {n.type === 'article_created' && `Новая статья: "${n.article?.title}"`}
            {n.type === 'article_updated' && `Обновлена: "${n.article?.title}"`}
            {n.type === 'article_deleted' && `Удалена статья ID ${n.id}`}
          </div>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !selectedArticle ? (
        <>
          <ArticleList articles={articles} onSelect={handleSelectArticle} />
          <ArticleForm onSubmit={handleFormSubmit} workspaceId={selectedWorkspace} workspaces={workspaces} />
        </>
      ) : !editingArticle ? (
        <>
          <ArticleView
            article={selectedArticle}
            workspaces={workspaces}
            onBack={() => setSelectedArticle(null)}

            onDelete={async (id) => {
              try {
                const res = await fetch(`${API_URL}/articles/${id}`, {
                  method: 'DELETE',
                  headers: authHeaders(),
                });
                await handleAuthStatus(res);

                setSelectedArticle(null);
                fetchArticles();
              } catch (err) {
                console.error(err);
                alert('Ошибка удаления статьи');
              }
            }}
            onUpdate={setEditingArticle}
            onVersionChange={async (vid) => {
              try {
                const r = await fetch(
                  `${API_URL}/comments/article/${selectedArticle.id}?versionId=${vid}`,
                  { headers: authHeaders() }
                );
                await handleAuthStatus(r);
                setComments(await r.json());
              } catch (err) {
                console.error(err);
              }
            }}
          />

          <CommentList
            comments={comments}
            onEdit={setEditingComment}

            onDelete={async (id) => {
              try {
                const res = await fetch(`${API_URL}/comments/${id}`, {
                  method: 'DELETE',
                  headers: authHeaders(),
                });
                await handleAuthStatus(res);

                setComments((prev) => prev.filter((c) => c.id !== id));
              } catch (err) {
                console.error(err);
                alert('Ошибка удаления комментария');
              }
            }}
          />

          <CommentForm
            onSubmit={(data) => handleCommentSubmit({ ...data, versionId: selectedArticle.currentVersion.id })}
            articleId={selectedArticle.id}
            commentToEdit={editingComment}
            onCancel={() => setEditingComment(null)}
          />
        </>
      ) : (
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
