const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const Project = require('../models/Project');
const Prompt = require('../models/Prompt');
const Message = require('../models/Message');
const { getChatCompletion } = require('../services/openai');

const router = express.Router();

// Setup multer to store uploads in public/uploads
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
    },
});
const upload = multer({ storage });

router.use(authRequired);

router.post('/:projectId', upload.array('files', 8), async (req, res) => {
	try {
		const { projectId } = req.params;
        const { message } = req.body;
        if (!message && (!req.files || req.files.length === 0)) {
            return res.status(400).json({ error: 'Message or files required' });
        }
		const project = await Project.findOne({ _id: projectId, ownerId: req.user.id });
		if (!project) return res.status(404).json({ error: 'Project not found' });

		const prompts = await Prompt.find({ projectId }).sort({ createdAt: 1 });
		const systemPrompt = prompts.map(p => p.content).join('\n\n');

        // Build attachment URLs from saved files (served statically from /public)
        const attachmentUrls = (req.files || []).map(f => {
            const rel = `/uploads/${path.basename(f.path)}`;
            return rel;
        });

        await Message.create({ projectId, userId: req.user.id, role: 'user', content: message || `(uploaded ${attachmentUrls.length} file(s))` });
		const completion = await getChatCompletion({
			model: project.model,
			systemPrompt,
            messages: [{ role: 'user', content: message || '', attachments: attachmentUrls }],
		});
		await Message.create({ projectId, userId: req.user.id, role: 'assistant', content: completion });
		return res.json({ reply: completion });
	} catch (err) {
		console.error('Chat error:', err);
		return res.status(500).json({ error: 'Chat failed', details: err?.message || 'unknown' });
	}
});

module.exports = router;


