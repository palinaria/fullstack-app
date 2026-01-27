import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import '../Auth.css';

const Login = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password } )
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход в систему</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
      <p>Нет аккаунта? <button onClick={onSwitch}>Зарегистрироваться</button></p>
    </div>
  );
};
export default Login;
