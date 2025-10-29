import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const dataFolder = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());


if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}


app.get('/articles', (req, res) => {
    fs.readdir(dataFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при чтении папки' });
        }

        const articles = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                const content = fs.readFileSync(path.join(dataFolder, file), 'utf-8');
                articles.push(JSON.parse(content));
            }
        });

        res.json(articles);
    });
});


app.get('/articles/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(dataFolder, id + '.json');

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Статья не найдена' });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
});


app.post('/articles', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;

    if (!title || !content) {
        return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });
    }

    const id = Date.now().toString();
    const newArticle = { id, title, content };

    fs.writeFile(
        path.join(dataFolder, id + '.json'),
        JSON.stringify(newArticle, null, 2),
        (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка при сохранении статьи' });
            }
            res.status(201).json(newArticle);
        }
    );
});


app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:' + PORT);
});