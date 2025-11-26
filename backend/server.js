import express from 'express';//сюда отпр запросы с фронта
import cors from 'cors';//разрешает фронту обращаться к бэку
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';//загрузка файлов,картинок с фронта
import { WebSocketServer } from 'ws';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const app = express();//front будет делать fetch запросы на app
const PORT = 3000;

const dataFolder = path.join(currentDir, 'data');//article storage
const uploadFolder = path.join(currentDir, 'uploads');//storage of pdf

if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

app.use(cors());// Разрешаем фронту  делать запросы
app.use(express.json());// Позволяет Express понимать JSON из POST/PUT запросов.
app.use('/uploads', express.static(uploadFolder));
// Когда фронт обращается к http://localhost:3000/uploads/filename.jpg
// Express отдаёт реальный файл из папки uploads



//говорит Multer, как и куда сохранять файлы, которые приходят с фронта.
const storage = multer.diskStorage({//Сохранять файлы на диск, а не в память
    destination: (req, file, cb) => cb(null, uploadFolder),//ф куда сохранять в uploadfolder
    filename: (req, file, cb) => {//req-запрос от фронта,cb-callback,what to do next
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});


const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

//принимать файлы,сохр в storage,типы
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неверный формат файла. Разрешены JPG, PNG и PDF.'));
        }
    },
});



const server = app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:' + PORT);
});//запускает сервер Express на порту 3000

const wss = new WebSocketServer({ server });//передаём уже запущенный HTTP-сервер Express

const broadcastNotification = (message) => {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

// Получить все статьи
//Открывает папку.Смотрит все файлы внутри.Читает и парсит каждый.Возвращает массив всех статей.
app.get('/articles', (req, res) => {//req = запрос от клиента res = ответ, который мы отправим
    try {
        const files = fs.readdirSync(dataFolder);
        const articles = files
            .filter(file => file.endsWith('.json'))
            .map(file => JSON.parse(fs.readFileSync(path.join(dataFolder, file), 'utf-8')));
        res.json(articles);//отправляем на фронт
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при чтении папки' });//ошибка сервера
    }
});

// Получить статью по ID
app.get('/articles/:id', (req, res) => {
    const id = req.params.id;//достаем id статьиа
    const filePath = path.join(dataFolder, id + '.json');
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Статья не найдена' });
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при чтении статьи' });
    }
});

// Создать статью с несколькими файлами
app.post('/articles', upload.array('files'), (req, res) => {//multer возьмёт файлы из поля files
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });

    const files = req.files ? req.files.map(f => f.filename) : [];
    const id = Date.now().toString();
    const newArticle = { id, title, content, files };

    try {
        fs.writeFileSync(path.join(dataFolder, id + '.json'), JSON.stringify(newArticle, null, 2));
        broadcastNotification({ type: 'article_created', article: newArticle });
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при сохранении статьи' });
    }
});

// Обновление статьи с несколькими файлами
app.put('/articles/:id', upload.array('files'), (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    const filePath = path.join(dataFolder, id + '.json');
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Статья не найдена' });

    const oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const newFiles = req.files ? req.files.map(f => f.filename) : oldData.files || []; // Если пользователь загрузил новые файлы — берём их имена
    // Если нет — сохраняем старые файлы (oldData.files)

    const updatedArticle = {
        id,
        title,
        content,
        files: newFiles,
    };

    try {
        fs.writeFileSync(filePath, JSON.stringify(updatedArticle, null, 2)); // Перезаписываем JSON-файл новой версией статьи

        broadcastNotification({ type: 'article_updated', article: updatedArticle });
        res.json(updatedArticle);  // Возвращаем обновлённую статью клиенту
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении статьи' });
    }
});

// Удаление статьи
app.delete('/articles/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(dataFolder, id + '.json');
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Статья не найдена' });

    try {
        fs.unlinkSync(filePath);//unlink = "удалить ссылку на файл"
        broadcastNotification({ type: 'article_deleted', id });
        res.json({ message: 'Статья удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
});
