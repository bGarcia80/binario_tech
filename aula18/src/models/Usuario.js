const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	senha: {
		type: String,
		required: true
	}
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
