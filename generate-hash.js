import crypto from 'crypto';

const password = process.argv[2];
if (!password) {
  console.log('Uso: node generate-hash.js <tu_contraseña>');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('----------------------------------------');
console.log(`Contraseña: ${password}`);
console.log(`Hash SHA-256: ${hash}`);
console.log('----------------------------------------');
console.log('Copia el Hash SHA-256 y pégalo en tu archivo .env.local y en las variables de entorno de Vercel como:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
