// hashPassword.js - Script untuk generate hash password
// Jalankan: node hashPassword.js

const bcrypt = require('bcryptjs');

const passwords = {
  admin123: '',
  dosen123: '',
  mahasiswa123: ''
};

// Generate hash untuk semua password
Object.keys(passwords).forEach(async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('---');
});

// Atau langsung hash satu password
async function hashSingle(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('\n=== HASH RESULT ===');
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
}

// Test hash
setTimeout(async () => {
  await hashSingle('admin123');
  await hashSingle('dosen123');
  await hashSingle('mahasiswa123');
}, 100);