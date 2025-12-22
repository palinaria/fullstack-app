
import React, { useState, useEffect } from 'react';
import './WorkspaceForm.css'


const WorkspaceForm = ({ workspace, onClose }) => {
    const [name, setName] = useState(workspace?.name || '');
    const [description, setDescription] = useState(workspace?.description || '');

    useEffect(() => {
        setName(workspace?.name || '');
        setDescription(workspace?.description || '');
    }, [workspace]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (workspace) {
                await fetch(`http://localhost:3000/workspaces/${workspace.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description })
                });
            } else {
                await fetch('http://localhost:3000/workspaces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description })
                });
            }
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="workspace-form-modal">
            <form className="workspace-form" onSubmit={handleSubmit}>
                <h3>{workspace ? 'Edit workspace' : 'Create workspace'}</h3>
                <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="workspace-form-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default WorkspaceForm;
