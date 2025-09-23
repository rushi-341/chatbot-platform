Chatbot Platform (Node.js, Express, MongoDB)
===========================================

Minimal multi-user chatbot platform with JWT auth, projects, prompts, and OpenRouterAI chat.

Features
--------
- User registration/login (email + password, JWT)
- Projects per user with model selection
- Associate multiple prompts to a project
- Chat with OpenRouterAI; messages stored
- Minimal HTML,CSS AND JS frontend

Requirements
------------
- Node.js 18+
- MongoDB (Atlas or local)
- OpenAI API key

Setup
-----
1. Install deps
```bash
npm install
```
2. Create `.env`
```bash
```
3. Run dev
```bash
npm run dev
```

API
---
- POST `/api/auth/register` { email, password, name }
- POST `/api/auth/login` { email, password } -> { token }
- GET `/api/projects` (auth)
- POST `/api/projects` { name, description?, model? } (auth)
- POST `/api/projects/:projectId/prompts` { title, content } (auth)
- POST `/api/chat/:projectId` { message } (auth)

Architecture
------------
- Express server in `src/server.js`
- Mongo via Mongoose models in `src/models`
- JWT middleware `src/middleware/auth.js`
- OpenAI integration `src/services/openai.js`
- Static frontend `public/index.html`

Deploy
------
- Set env vars on Render/Railway/Fly.io or Docker
- Serve with `npm start`


