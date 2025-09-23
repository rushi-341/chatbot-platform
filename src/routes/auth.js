const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: 'Email already registered' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ email, passwordHash, name });
		return res.status(201).json({ id: user._id, email: user.email, name: user.name });
	} catch (err) {
		return res.status(500).json({ error: 'Registration failed' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const token = jwt.sign({ sub: String(user._id), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
		return res.json({ token });
	} catch (err) {
		return res.status(500).json({ error: 'Login failed' });
	}
});

module.exports = router;


