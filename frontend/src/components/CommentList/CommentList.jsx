import React from "react";
import './CommenList.css';

const CommentList = ({ comments, onEdit, onDelete, currentUser }) => {
    if (!Array.isArray(comments) || comments.length === 0) return <p>Комментариев нет</p>;

    return (
      <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
                <p>{c.text}</p>
                <div className="comment-actions">
                    {(currentUser?.role === 'admin' || currentUser?.id === c.userId) && (
                      <>
                          <button onClick={() => onEdit(c)}>Редактировать</button>
                          <button onClick={() => onDelete(c.id)}>Удалить</button>
                      </>
                    )}
                </div>
            </div>
          ))}
      </div>
    );
};

export default CommentList;
