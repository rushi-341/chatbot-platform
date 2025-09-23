const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
	if (!mongoUri) {
		throw new Error('Missing MONGODB_URI');
	}
	mongoose.set('strictQuery', true);
	await mongoose.connect(mongoUri, {
		bufferCommands: false,
		autoIndex: true,
	});
	return mongoose.connection;
}

module.exports = { connectToDatabase };


