import React from 'react';
import './ArticleView.css';

const ArticleView = ({ article, onBack, onEdit, onDelete }) => {
    if (!article) return null;

    const files = Array.isArray(article.files) ? article.files : [];//создаем file,чтобы можно было мэпиться

    return (
        <div className="article-view">
            <button className="back-button" onClick={onBack}>Back</button>
            <h2>{article.title}</h2>
            {files.length > 0 && (
                <div className="attachments">
                    <h3>Вложения:</h3>

                    {files.map((file, index) => {
                        const fileUrl = `http://localhost:3000/uploads/${file}`;
                        const lower = file.toLowerCase();

                        const isImage =// Определяем тип файла
                            lower.endsWith('.jpg') ||
                            lower.endsWith('.jpeg') ||
                            lower.endsWith('.png');

                        const isPDF = lower.endsWith('.pdf');

                        return (
                            <div key={index} className="attachment-item">
                                {isImage && (
                                    <img
                                        src={fileUrl}
                                        alt="attachment"
                                        className="attachment-image"
                                    />
                                )}

                                {isPDF && (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="attachment-pdf"
                                    >
                                        📄 {file}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="content">{article.content}</div>

            <div className="edit-button-container">
                <button className="edit-button" onClick={() => onEdit(article)}>
                    Edit
                </button>
                <button className="delete-button" onClick={() => onDelete(article.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ArticleView;
