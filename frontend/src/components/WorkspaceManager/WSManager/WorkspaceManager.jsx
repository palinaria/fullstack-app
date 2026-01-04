import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import './WorkspaceManager.css';

const WorkspaceManager = ({ workspaces, selectedWorkspace, onSelect, onChange }) => {
    const [newWSName, setNewWSName] = useState('');
    const { token } = useAuth();

    const handleCreateWS = async () => {
        if (!newWSName) return;
        try {
            const res = await fetch('http://localhost:3000/workspaces', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newWSName } )
            });
            if (res.ok) {
                setNewWSName('');
                onChange();
            }
        } catch (err) {
            console.error('Ошибка создания воркспейса:', err);
        }
    };

    return (
      <div className="workspace-manager">
          <div className="ws-selector">
              <select value={selectedWorkspace || ''} onChange={(e) => onSelect(e.target.value)}>
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
              </select>
          </div>
          <div className="ws-create">
              <input
                type="text"
                placeholder="Новый воркспейс"
                value={newWSName}
                onChange={(e) => setNewWSName(e.target.value)}
              />
              <button onClick={handleCreateWS}>Создать</button>
          </div>
      </div>
    );
};

export default WorkspaceManager;
