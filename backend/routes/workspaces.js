import express from 'express';
import * as WorkspaceController from '../controllers/workspaceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, WorkspaceController.listWorkspaces);
router.get('/:id', authenticateToken, WorkspaceController.getWorkspace);
router.post('/', authenticateToken, WorkspaceController.createWorkspace);
router.put('/:id', authenticateToken, WorkspaceController.updateWorkspace);
router.delete('/:id', authenticateToken, WorkspaceController.deleteWorkspace);

export default router;
