import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const app = express();
const PORT = 3000;
const dataFolder = path.join(currentDir, 'data');

app.use(cors());
app.use(express.json());

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

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

app.post('/articles', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });
    }

    const id = Date.now().toString();
    const newArticle = { id, title, content };

    try {
        fs.writeFileSync(path.join(dataFolder, id + '.json'), JSON.stringify(newArticle, null, 2));
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при сохранении статьи' });
    }
});

app.put('/articles/:id', (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    const filePath = path.join(dataFolder, id + '.json');

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Статья не найдена' });
    }

    if (!title || !content) {
        return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });
    }

    const updatedArticle = { id, title, content };

    try {
        fs.writeFileSync(filePath, JSON.stringify(updatedArticle, null, 2));
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
        res.json({ message: 'Статья удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
});

app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:' + PORT);
});
