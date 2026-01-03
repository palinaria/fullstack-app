import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize } from './services/db.js';
import { setupWebSocket } from './utils/ws.js';
import db from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import workspaceRoutes from './routes/workspaces.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const uploadFolder = path.join(currentDir, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadFolder));

// Публичные маршруты
app.use('/auth', authRoutes);

// Защищенные маршруты
app.use('/articles', authenticateToken, articleRoutes);
app.use('/comments', authenticateToken, commentRoutes);
app.use('/workspaces', authenticateToken, workspaceRoutes);

app.use((err, req, res, next) => {
    if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const server = app.listen(PORT, HOST, async () => {
    console.log(`Сервер работает на http://${HOST}:${PORT}`   );
    try {
        await sequelize.authenticate();
        console.log('Подключение к базе успешно!');
        await sequelize.sync();
        console.log('База синхронизирована');
    } catch (error) {
        console.error('Ошибка подключения к базе:', error);
    }
});

setupWebSocket(server);
