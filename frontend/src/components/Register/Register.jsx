import React, { useState } from 'react';
import '../Auth.css';

const Register = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password } )
      });
      const data = await res.json();
      if (res.ok) {
        alert('Регистрация успешна! Теперь войдите.');
        onSwitch();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Создать аккаунт</button>
      </form>
      <p>Уже есть аккаунт? <button onClick={onSwitch}>Войти</button></p>
    </div>
  );
};
export default Register;
