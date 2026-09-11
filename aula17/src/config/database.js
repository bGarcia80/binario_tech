const mongoose = require('mongoose');

const conectarBanco = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/binario_tech_simulado';
    await mongoose.connect(uri);
    console.log('[Binário Tech] Banco de Dados do Simulado conectado!');
  } catch (erro) {
    console.error(`[ERRO BANCO]: ${erro.message}`);
    process.exit(1);
  }
};

module.exports = conectarBanco;
