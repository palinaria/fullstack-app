import React, { useState, useEffect } from "react";
import "./ArticleForm.css";

const ArticleForm = ({ onSubmit, articleToEdit }) => {//onSubmit — функция, которую вызовем после успешного сохранения/articleToEdit — статья, которую нужно редактировать
    const [title, setTitle] = useState(articleToEdit?.title || "");//начальное значение/если есть название если нет создаем
    const [content, setContent] = useState(articleToEdit?.content || "");
    const [files, setFiles] = useState([]);//массив выбранных файлов
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");

    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];

    useEffect(() => {
        setTitle(articleToEdit?.title || "");
        setContent(articleToEdit?.content || "");
        setFiles([]);
        setError("");
        setWarning("");
    }, [articleToEdit]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);//получаем все выбранные файлы в массив
        const invalidFiles = selectedFiles.filter(file => {//берем те которые не подходят
            const ext = file.name.split(".").pop().toLowerCase();//Разделяем имя файла по точке (split(".")) и берём последнее значение (pop()), т.е. расширение.
            return !allowedExtensions.includes(ext);
        });

        if (invalidFiles.length > 0) {
            setWarning(`!Внимание: выбранные файлы не будут прикреплены: ${invalidFiles.map(f => f.name).join(", ")}.   
            Допустимые форматы файлов:"jpg", "jpeg", "png", "pdf"`);

        } else {
            setWarning("");
        }

        const validFiles = selectedFiles.filter(file => allowedExtensions.includes(file.name.split(".").pop().toLowerCase()));//отбираем только правильные файлы
        setFiles(validFiles);
    };

    const handleSubmit = async (e) => {//БЭК!когда пользователь нажимает кнопку «Сохранить»
        e.preventDefault();
        if (!title || !content) {
            setError("Введите заголовок и текст");
            return;
        }

        try {
            const method = articleToEdit ? "PUT" : "POST";//articleToEdit есть → редактируем статью → метод "PUT".Если нет → создаём новую → метод "POST".
            const url = articleToEdit
                ? `http://localhost:3000/articles/${articleToEdit.id}`
                : "http://localhost:3000/articles";//редактируем существующую или создаем

            const formData = new FormData();//через него отдаем на сервер наши артикли
            formData.append("title", title);
            formData.append("content", content);
            files.forEach((file) => formData.append("files", file));

            const res = await fetch(url, {
                method,//post или put
                body: formData,//вот здесь
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Ошибка при сохранении статьи");
            }

            const updatedArticle = await res.json();//ответ от бэка
            onSubmit(updatedArticle);//ОБНОВЛЯЕМ ИНТЕРФЕЙС С ПОЛУЧЕННОЙ ДАТОЙ

            setTitle("");//возвращаем в исходное состояние
            setContent("");
            setFiles([]);
            setError("");
            setWarning("");
        } catch (err) {
            console.error(err);
            setError(err.message || "Не удалось сохранить статью");
        }
    };

    return (
        <div className="form-container">
            <h2>{articleToEdit ? "Редактировать статью" : "Создать статью"}</h2>
            {error && <div className="form-error">{error}</div>}
            {warning && <div className="form-warning">{warning}</div>}
            <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                    type="text"
                    placeholder="Введите заголовок..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label>Content</label>
                <textarea
                    placeholder="Введите текст статьи..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>

                <label>Прикрепить файлы</label>
                <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                />

                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default ArticleForm;
