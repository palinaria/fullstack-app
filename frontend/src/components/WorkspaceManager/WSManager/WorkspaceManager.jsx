import React, { useState } from 'react';
import WorkspaceForm from '../WorkspaceForm/WorkspaceForm.jsx';
import { useAuth } from '../../../../context/AuthContext.jsx';
import './WorkspaceManager.css'

const WorkspaceManager = ({ workspaces, selectedWorkspace, onSelect, onChange }) => {
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { token } = useAuth();

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить workspace и все его статьи/комментарии?')) return;
        try {
            const res = await fetch(`http://localhost:3000/workspaces/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Ошибка удаления');
            onChange();
            if (selectedWorkspace === id) onSelect(null);
        } catch (err) { console.error(err); }
    };

    const handleEditClick = (ws) => {
        setEditing(ws);
        setShowForm(true);
    };

    const handleCreateClick = () => {
        setEditing(null);
        setShowForm(true);
    };

    const currentWorkspace = workspaces.find(w => w.id === Number(selectedWorkspace));

    return (
      <div className="workspace-manager">
          <div className="workspace-list">
              <label>Workspace:</label>
              <select value={selectedWorkspace || ''} onChange={(e) => onSelect(Number(e.target.value))}>
                  <option value="" disabled>-- Выберите workspace --</option>
                  {workspaces.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
              </select>

              {currentWorkspace?.description && (
                <p className="workspace-description">{currentWorkspace.description}</p>
              )}

              <div className="workspace-controls">
                  <button onClick={handleCreateClick}>+ New</button>
                  <button onClick={() => currentWorkspace && handleEditClick(currentWorkspace)}>Edit</button>
                  <button onClick={() => selectedWorkspace && handleDelete(selectedWorkspace)}>Delete</button>
              </div>
          </div>

          {showForm && (
            <WorkspaceForm
              workspace={editing}
              onClose={() => { setShowForm(false); onChange(); }}
            />
          )}
      </div>
    );
};

export default WorkspaceManager;
