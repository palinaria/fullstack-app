import express from 'express'; // сюда отпр запросы с фронта
import cors from 'cors'; // разрешает фронту обращаться к бэку
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer'; // загрузка файлов,картинок с фронта
import { WebSocketServer } from 'ws';
import { Sequelize } from 'sequelize';
import ArticleModel from './models/article.js';


const configPath = path.join(process.cwd(), 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const app = express(); // front будет делать fetch запросы на app
const PORT = 3000;

const uploadFolder = path.join(currentDir, 'uploads'); // storage of pdf
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

app.use(cors()); // Разрешаем фронту  делать запросы
app.use(express.json()); // Позволяет Express понимать JSON из POST/PUT запросов.
app.use('/uploads', express.static(uploadFolder));
// Когда фронт обращается к http://localhost:3000/uploads/filename.jpg
// Express отдаёт реальный файл из папки uploads

// говорит Multer, как и куда сохранять файлы, которые приходят с фронта.
const storage = multer.diskStorage({ // Сохранять файлы на диск, а не в память
    destination: (req, file, cb) => cb(null, uploadFolder), // куда сохранять в uploadFolder
    filename: (req, file, cb) => { // req-запрос от фронта, cb-callback, что делать дальше
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// принимать файлы, сохр в storage, типы
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

// ================== Настройка Sequelize ==================
const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        dialect: config.development.dialect
    }
);

// Инициализация модели Article
const Article = ArticleModel(sequelize);

// Проверка подключения
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Подключение к базе успешно!');

        // создаём тестовую статью
        const count = await Article.count();
        if (count === 0) { // чтобы не создавать каждый раз при старте
            await Article.create({ title: "Тестовая статья", content: "Текст" });
            console.log('Тестовая статья создана');
        }

    } catch (error) {
        console.error('Ошибка подключения к базе:', error);
    }
})();



const server = app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:' + PORT);
}); // запускает сервер Express на порту 3000

const wss = new WebSocketServer({ server }); // передаём уже запущенный HTTP-сервер Express

const broadcastNotification = (message) => {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};



// Получить все статьи
app.get('/articles', async (req, res) => {
    try {
        const articles = await Article.findAll();
        res.json(articles); // отправляем на фронт
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении статей' }); // ошибка сервера
    }
});

// Получить статью по ID
app.get('/articles/:id', async (req, res) => {
    const id = req.params.id; // достаем id статьи
    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при чтении статьи' });
    }
});

// Создать статью с несколькими файлами
app.post('/articles', upload.array('files'), async (req, res) => { // multer возьмёт файлы из поля files
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Нужно ввести заголовок и текст' });

    const files = req.files ? req.files.map(f => f.filename) : [];

    try {
        const newArticle = await Article.create({
            title,
            content,
            files: files || []
        });
        broadcastNotification({ type: 'article_created', article: newArticle });
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при сохранении статьи' });
    }
});

// Обновление статьи с несколькими файлами
app.put('/articles/:id', upload.array('files'), async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const newFiles = req.files ? req.files.map(f => f.filename) : [];

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        article.title = title;
        article.content = content;
        // если новые файлы есть — обновляем, иначе оставляем старые
        article.files = newFiles.length > 0 ? newFiles : (article.files || []);

        await article.save();

        broadcastNotification({ type: 'article_updated', article });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении статьи' });
    }
});

// Удаление статьи
app.delete('/articles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        await article.destroy(); // удаляем запись в базе
        broadcastNotification({ type: 'article_deleted', id });
        res.json({ message: 'Статья удалена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении статьи' });
    }
});
