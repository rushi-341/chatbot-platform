const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
	{
		ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		name: { type: String, required: true },
		description: { type: String },
		model: { type: String, default: 'gpt-4o-mini' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);


