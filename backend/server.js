import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { WebSocketServer } from 'ws';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const app = express();
const PORT = 3000;

const dataFolder = path.join(currentDir, 'data');
const uploadFolder = path.join(currentDir, 'uploads');

if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadFolder));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolder),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неверный формат файла. Разрешены JPG, PNG и PDF.'));
        }
    },
});


const server = app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:' + PORT);
});
const wss = new WebSocketServer({ server });


const broadcastNotification = (message) => {
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });
};

app.get('/articles', (req, res) => {
    try {
        const files = fs.readdirSync(dataFolder);
        const articles = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const content = fs.readFileSync(path.join(dataFolder, file), 'utf-8');
                return JSON.parse(content);
            });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при чтении папки' });
    }
});

app.get('/articles/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(dataFolder, id + '.json');

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Статья не найдена' });
    }

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при чтении статьи' });
    }
});

app.post('/articles', upload.single('file'), (req, res) => {
    const { title, content } = req.body;
    const file = req.file ? req.file.filename : null;

    if (!title || !content) {
        return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });
    }

    const id = Date.now().toString();
    const newArticle = { id, title, content, file };

    try {
        fs.writeFileSync(path.join(dataFolder, id + '.json'), JSON.stringify(newArticle, null, 2));


        broadcastNotification({ type: 'article_created', article: newArticle });

        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при сохранении статьи' });
    }
});

app.put('/articles/:id', upload.single('file'), (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    const filePath = path.join(dataFolder, id + '.json');

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Статья не найдена' });
    }

    const oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const updatedArticle = {
        id,
        title,
        content,
        file: req.file ? req.file.filename : oldData.file || null,
    };

    try {
        fs.writeFileSync(filePath, JSON.stringify(updatedArticle, null, 2));


        broadcastNotification({ type: 'article_updated', article: updatedArticle });

        res.json(updatedArticle);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении статьи' });
    }
});

app.delete('/articles/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(dataFolder, id + '.json');

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Статья не найдена' });
    }

    try {
        fs.unlinkSync(filePath);


        broadcastNotification({ type: 'article_deleted', id });

        res.json({ message: 'Статья удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
});
