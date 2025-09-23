const express = require('express');
const { authRequired } = require('../middleware/auth');
const Project = require('../models/Project');
const Prompt = require('../models/Prompt');
const Message = require('../models/Message');
const { getChatCompletion } = require('../services/openai');

const router = express.Router();

router.use(authRequired);

router.post('/:projectId', async (req, res) => {
	try {
		const { projectId } = req.params;
		const { message } = req.body;
		if (!message) return res.status(400).json({ error: 'Message required' });
		const project = await Project.findOne({ _id: projectId, ownerId: req.user.id });
		if (!project) return res.status(404).json({ error: 'Project not found' });

		const prompts = await Prompt.find({ projectId }).sort({ createdAt: 1 });
		const systemPrompt = prompts.map(p => p.content).join('\n\n');

		await Message.create({ projectId, userId: req.user.id, role: 'user', content: message });
		const completion = await getChatCompletion({
			model: project.model,
			systemPrompt,
			messages: [{ role: 'user', content: message }],
		});
		await Message.create({ projectId, userId: req.user.id, role: 'assistant', content: completion });
		return res.json({ reply: completion });
	} catch (err) {
		console.error('Chat error:', err);
		return res.status(500).json({ error: 'Chat failed', details: err?.message || 'unknown' });
	}
});

module.exports = router;


