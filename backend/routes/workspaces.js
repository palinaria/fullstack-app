const express = require("express");
const router = express.Router();

const Workspace = require("../models/Workspace");
const Article = require("../models/Article");
const Comment = require("../models/Comment");

// ===== CREATE WORKSPACE =====
router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;

        const workspace = await Workspace.create({
            name,
            description,
        });

        res.status(201).json(workspace);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== GET ALL WORKSPACES =====
router.get("/", async (req, res) => {
    try {
        const list = await Workspace.findAll({ order: [["createdAt", "DESC"]] });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== GET ONE WORKSPACE =====
router.get("/:id", async (req, res) => {
    try {
        const workspace = await Workspace.findByPk(req.params.id);

        if (!workspace)
            return res.status(404).json({ error: "Workspace not found" });

        res.json(workspace);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== UPDATE WORKSPACE (edit name/description) =====
router.put("/:id", async (req, res) => {
    try {
        const { name, description } = req.body;

        const workspace = await Workspace.findByPk(req.params.id);

        if (!workspace)
            return res.status(404).json({ error: "Workspace not found" });

        workspace.name = name ?? workspace.name;
        workspace.description = description ?? workspace.description;

        await workspace.save();

        res.json(workspace);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== DELETE WORKSPACE (with all its articles and comments) =====
router.delete("/:id", async (req, res) => {
    try {
        const workspaceId = req.params.id;

        const workspace = await Workspace.findByPk(workspaceId);
        if (!workspace)
            return res.status(404).json({ error: "Workspace not found" });

        // delete comments → delete articles → delete workspace
        await Comment.destroy({ where: { workspaceId } });
        await Article.destroy({ where: { workspaceId } });
        await workspace.destroy();

        res.json({ message: "Workspace deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
