const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
	{
		projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
		content: { type: String, required: true },
		meta: { type: Object },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);


