import express from 'express'; // сюда отпр запросы с фронта
import cors from 'cors'; // разрешает фронту обращаться к бэку
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize } from './services/db.js'; // подключение к БД
import { Article } from './models/article.js'; // модель Article
import articleRouter from './controllers/articleController.js'; // роуты для статей
import { setupWebSocket } from './utils/websocket.js'; // WS сервер

// Получаем текущую директорию
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const app = express();
const PORT = 3000;

// Создаём папку для файлов, если нет
const uploadFolder = path.join(currentDir, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

app.use(cors()); // разрешаем фронту делать запросы
app.use(express.json()); // чтобы Express понимал JSON
app.use('/uploads', express.static(uploadFolder)); // отдаём файлы

// Подключаем роуты для статей
app.use('/articles', articleRouter);

// Запуск сервера и WebSocket
const server = app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:' + PORT);
});

setupWebSocket(server); // подключение WS

// Проверка подключения к БД и создание тестовой статьи
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Подключение к базе успешно!');

        // создаём тестовую статью, если таблица пустая
        const count = await Article.count();
        if (count === 0) {
            await Article.create({ title: "Тестовая статья", content: "Текст" });
            console.log('Тестовая статья создана');
        }
    } catch (error) {
        console.error('Ошибка подключения к базе:', error);
    }
})();
//точка входа, подключает модули