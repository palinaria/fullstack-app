import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import API_URL from '../../../apiConfig.js';
import './UserManagement.css';

const UserManagement = () => {
  const { token, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setError('');
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Ошибка при загрузке пользователей');

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }

  }, [token, user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(
        `${API_URL}/auth/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!res.ok) throw new Error('Ошибка при обновлении роли');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err?.message || 'Ошибка');
    }
  };

  if (user?.role !== 'admin') {
    return <p className="um-message um-message--denied">Доступ запрещен</p>;
  }

  if (loading) {
    return <p className="um-message">Загрузка...</p>;
  }

  if (error) {
    return <p className="um-message um-message--error">{error}</p>;
  }

  return (
    <div className="user-management">
      <h2 className="um-title">Управление пользователями</h2>

      <div className="um-tableWrap">
        <table className="um-table">
          <thead>
          <tr>
            <th>Email</th>
            <th>Роль</th>
            <th>Действие</th>
          </tr>
          </thead>

          <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>
                  <span className={`um-badge um-badge--${u.role}`}>
                    {u.role}
                  </span>
              </td>
              <td>
                <select
                  className="um-select"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={u.id === user.id}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                {u.id === user.id ? (
                  <span className="um-hint">Это ты</span>
                ) : null}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
