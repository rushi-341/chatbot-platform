const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema(
	{
		projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
		title: { type: String, required: true },
		content: { type: String, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Prompt', promptSchema);


