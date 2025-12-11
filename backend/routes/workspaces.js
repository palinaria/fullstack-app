
import express from 'express';
import * as WorkspaceController from '../controllers/workspaceController.js';

const router = express.Router();

router.get('/', WorkspaceController.listWorkspaces);
router.get('/:id', WorkspaceController.getWorkspace);
router.post('/', WorkspaceController.createWorkspace);
router.put('/:id', WorkspaceController.updateWorkspace);
router.delete('/:id', WorkspaceController.deleteWorkspace);

export default router;
