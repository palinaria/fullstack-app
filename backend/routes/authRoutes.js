import express from 'express';
import * as AuthController from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/users', authenticateToken, isAdmin, AuthController.getAllUsers);
router.put('/users/:id/role', authenticateToken, isAdmin, AuthController.updateUserRole);

export default router;
