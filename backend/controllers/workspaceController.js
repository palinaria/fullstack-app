
import { Workspace } from '../models/Workspace.js';
import { Article } from '../models/Article.js';
import { Comment } from '../models/Comment.js';

export const listWorkspaces = async (req, res) => {
    try {
        const all = await Workspace.findAll({ order: [['createdAt', 'DESC']] });
        res.json(all);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка загрузки workspaces' });
    }
};

export const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;
        const ws = await Workspace.create({ name, description });
        res.status(201).json(ws);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка создания workspace' });
    }
};

export const getWorkspace = async (req, res) => {
    try {
        const ws = await Workspace.findByPk(req.params.id);
        if (!ws) return res.status(404).json({ message: 'Workspace не найден' });
        res.json(ws);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка' });
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const ws = await Workspace.findByPk(req.params.id);
        if (!ws) return res.status(404).json({ message: 'Workspace не найден' });

        ws.name = req.body.name ?? ws.name;
        ws.description = req.body.description ?? ws.description;
        await ws.save();
        res.json(ws);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении' });
    }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const ws = await Workspace.findByPk(req.params.id);
        if (!ws) return res.status(404).json({ message: 'Workspace не найден' });


        await Comment.destroy({ where: { workspaceId: req.params.id } });
        await Article.destroy({ where: { workspaceId: req.params.id } });
        await ws.destroy();
        res.json({ message: 'Workspace удалён' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
};
