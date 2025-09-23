const express = require('express');
const { authRequired } = require('../middleware/auth');
const Project = require('../models/Project');
const Prompt = require('../models/Prompt');

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res) => {
	const projects = await Project.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
	return res.json(projects);
});

router.post('/', async (req, res) => {
	const { name, description, model } = req.body;
	if (!name) return res.status(400).json({ error: 'Name required' });
	const project = await Project.create({ ownerId: req.user.id, name, description, model });
	return res.status(201).json(project);
});

router.post('/:projectId/prompts', async (req, res) => {
	const { projectId } = req.params;
	const { title, content } = req.body;
	if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
	const project = await Project.findOne({ _id: projectId, ownerId: req.user.id });
	if (!project) return res.status(404).json({ error: 'Project not found' });
	const prompt = await Prompt.create({ projectId, title, content });
	return res.status(201).json(prompt);
});

router.get('/:projectId/prompts', async (req, res) => {
	const { projectId } = req.params;
	const project = await Project.findOne({ _id: projectId, ownerId: req.user.id });
	if (!project) return res.status(404).json({ error: 'Project not found' });
	const prompts = await Prompt.find({ projectId }).sort({ createdAt: -1 });
	return res.json(prompts);
});

module.exports = router;


