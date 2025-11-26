import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Получаем текущую директорию
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

// Папка для загруженных файлов
export const uploadFolder = path.join(currentDir, '../uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Настройка Multer для сохранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolder),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// Разрешённые форматы
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// Экспортируем объект multer
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неверный формат файла. Разрешены JPG, PNG и PDF.'));
        }
    }
});
//Файл отвечает за приём и сохранение файлов с фронта.