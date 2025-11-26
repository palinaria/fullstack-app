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
  const wsRef = useRef(null); // хранение WebSocket-соединения

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/articles');
      const data = await res.json(); // получаем с бэка
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
    setSelectedArticle(null); // переключает интерфейс на "форму редактирования статьи"
  };

  // вызывается, когда пользователь закончил редактировать статью и нажал "Сохранить"
  const handleFormSubmit = (updatedArticle) => {
    setEditingArticle(null); // Мы больше не редактируем статью
    if (selectedArticle && selectedArticle.id === updatedArticle.id) {
      // Если сейчас на экране открыта эта же статья, которую мы обновили — нужно обновить её прямо в окне просмотра
      setSelectedArticle(prev => ({ ...prev, ...updatedArticle }));
    }
    setArticles(prevArticles =>
        prevArticles.map(a =>
            a.id === updatedArticle.id ? { ...a, ...updatedArticle } : a
        ) // Если найдёшь статью с таким же id — обнови её. Если нет — оставь как есть.
    );
  };

  const handleDeleteArticle = async (id) => {
    const confirmDelete = window.confirm("Вы точно хотите удалить эту статью?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:3000/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Ошибка при удалении статьи");
      if (selectedArticle && selectedArticle.id === id) {
        // Если да, значит пользователь смотрит статью, которую удаляем
        setSelectedArticle(null); // закрываем окно просмотра этой статьи, чтобы не показывать уже удалённый контент
      }
      setArticles(prevArticles => prevArticles.filter(a => a.id !== id));
      // filter оставляет только те статьи, у которых id НЕ равно удаляемому
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить статью");
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []); // 1 раз при загрузке

  useEffect(() => {
    if (!wsRef.current) { // Проверяем, подключён ли WebSocket
      const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:3000');
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket подключен");

        ws.onmessage = (event) => {
          // срабатывает, когда сервер присылает сообщение
          const message = JSON.parse(event.data);
          if (['article_created', 'article_updated', 'article_deleted'].includes(message.type)) {
            setNotifications(prev => [...prev, message]);
            // создаём новый массив: сначала старые уведомления из prev, потом новое уведомление message

            if (message.type === 'article_created') {
              setArticles(prev => [...prev, message.article]);
            } else if (message.type === 'article_deleted') {
              setArticles(prev => prev.filter(a => a.id !== message.id));
              if (selectedArticle && selectedArticle.id === message.id) {
                // Если пользователь сейчас смотрит статью, которую удалили
                setSelectedArticle(null);
              }
            }
          }
        };

        ws.onerror = (err) => console.error("WebSocket ошибка:", err);

        ws.onclose = () => {
          // Срабатывает, когда сервер закрыл соединение или соединение прервалось
          setTimeout(() => {
            wsRef.current = null; // обнуляем ссылку на старый WebSocket
            connectWebSocket(); // заново создаём соединение WebSocket с сервером
          }, 3000); // если соединение оборвалось, автоматически переподключаемся через 3 секунды
        };
      };

      connectWebSocket();
    }
  }, [selectedArticle]);

  // каждое уведомление отображается 5 секунд, а потом исчезает
  useEffect(() => {
    if (notifications.length === 0) return; // Если нет уведомлений, то ничего не делаем и выходим
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(1)); // создаёт новый массив без первого элемента
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
            // если нет выбранной статьи,то данные не загружаются
            <>
              <ArticleList
                  articles={articles}
                  onSelect={handleSelectArticle}
                  onEdit={handleEditArticle}
              />
              <ArticleForm
                  onSubmit={handleFormSubmit} // handleSubmit выше
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
