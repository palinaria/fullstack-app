import React from 'react';
import './ArticleView.css';

const ArticleView = ({ article, onBack, onEdit, onDelete }) => {
    if (!article) return null;

    const fileUrl = article.file ? `http://localhost:3000/uploads/${article.file}` : null;
    const isImage = fileUrl && (article.file.endsWith('.jpg') || article.file.endsWith('.jpeg') || article.file.endsWith('.png'));
    const isPDF = fileUrl && article.file.endsWith('.pdf');

    return (
        <div className="article-view">
            <button className="back-button" onClick={onBack}>Back</button>
            <h2>{article.title}</h2>

            {fileUrl && (
                <div className="attachments">
                    {isImage && (
                        <img src={fileUrl} alt="attachment" className="attachment-image" />
                    )}
                    {isPDF && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-pdf"
                        >
                            📄 {article.file}
                        </a>
                    )}
                </div>
            )}

            <div className="content">{article.content}</div>

            <div className="edit-button-container">
                <button className="edit-button" onClick={() => onEdit(article)}>Edit</button>
                <button className="delete-button" onClick={() => onDelete(article.id)}>Delete</button>
            </div>
        </div>
    );
};

export default ArticleView;
