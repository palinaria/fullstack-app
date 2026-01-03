import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const uploadFolder = path.join(currentDir, '../uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolder),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {

            cb(new Error('Неверный формат файла. Разрешены только JPG, PNG и PDF.'));
        }
    }
});

export default upload;
