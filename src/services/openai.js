const OpenAI = require('openai');

function mapAttachmentsToContents(attachments, basePublicUrl) {
    const items = [];
    (attachments || []).forEach((relUrl) => {
        const url = (basePublicUrl || '') + relUrl;
        const lower = relUrl.toLowerCase();
        if (lower.match(/\.(png|jpg|jpeg|gif|webp|bmp|tiff|svg)$/)) {
            items.push({ type: 'image_url', image_url: { url } });
        } else if (lower.match(/\.(mp3|wav|m4a|flac|ogg|webm)$/)) {
            // OpenRouter input_audio for supported models
            items.push({ type: 'input_audio', input_audio: { url } });
        } else {
            // Fallback: include as a plain URL reference
            items.push({ type: 'text', text: `Attached file: ${url}` });
        }
    });
    return items;
}

async function getChatCompletion({ model, systemPrompt, messages }) {
	const useOpenRouter = !!process.env.OPENROUTER_API_KEY;
	const allMessages = [
		...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages.map((m) => {
            // Expand any attachments into multimodal content array for OpenRouter
            if (m.attachments && m.attachments.length > 0) {
                const basePublicUrl = process.env.PUBLIC_BASE_URL || process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000';
                const contentItems = [];
                if (m.content) contentItems.push({ type: 'text', text: m.content });
                contentItems.push(...mapAttachmentsToContents(m.attachments, basePublicUrl));
                return { role: m.role, content: contentItems };
            }
            return m;
        }),
	];

	if (useOpenRouter) {
		const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
        const resp = await fetch(baseUrl + '/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
				'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
				'X-Title': process.env.OPENROUTER_TITLE || 'Chatbot Platform',
			},
            body: JSON.stringify({ model: model || 'openai/gpt-4o-mini', messages: allMessages, temperature: 0.7 }),
		});
		if (!resp.ok) {
			const text = await resp.text();
			throw new Error(text || `OpenRouter error ${resp.status}`);
		}
		const data = await resp.json();
		return data.choices?.[0]?.message?.content || '';
	}

	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) throw new Error('Missing OPENAI_API_KEY or OPENROUTER_API_KEY');
	const client = new OpenAI({ apiKey });
	const response = await client.chat.completions.create({
		model: model || 'gpt-4o-mini',
		messages: allMessages,
		temperature: 0.7,
	});
	return response.choices?.[0]?.message?.content || '';
}

module.exports = { getChatCompletion };


