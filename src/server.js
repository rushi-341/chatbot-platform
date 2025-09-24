const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectToDatabase } = require('./config/db');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ensure uploads directory exists at startup
try {
    const uploadsPath = path.join(__dirname, '..', 'public', 'uploads');
    fs.mkdirSync(uploadsPath, { recursive: true });
} catch {}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/chat', require('./routes/chat'));

const port = process.env.PORT || 3000;

connectToDatabase(process.env.MONGODB_URI)
	.then(() => {
		app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
	})
	.catch((err) => {
		console.error('Failed to connect to DB', err);
		process.exit(1);
	});


