import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize } from './services/db.js';
import { setupWebSocket } from './utils/ws.js';
import db from './models/index.js';

import articleRoutes from './routes/articleRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import workspaceRoutes from './routes/workspaces.js';

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

app.use('/articles', articleRoutes);
app.use('/comments', commentRoutes);
app.use('/workspaces', workspaceRoutes);

const server = app.listen(PORT, HOST, async () => {
    console.log(`Сервер работает на http://${HOST}:${PORT}` );
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
