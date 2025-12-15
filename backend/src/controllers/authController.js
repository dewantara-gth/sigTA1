// src/controllers/authController.js - Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse, validationError, unauthorizedResponse } = require('../utils/responseHandler');
const { validateLogin } = require('../utils/validation');

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      role: user.role,
      nama: user.nama
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * LOGIN - Universal untuk Admin, Dosen, Mahasiswa
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    const validation = validateLogin(username, password);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    let user = null;
    let role = null;

    // 1. Cek di tabel Admin
    const adminResults = await db.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );

    if (adminResults.length > 0) {
      user = adminResults[0];
      role = 'admin';
    }

    // 2. Kalau tidak ketemu, cek di tabel Dosen
    if (!user) {
      const dosenResults = await db.query(
        'SELECT d.*, ps.nama_prodi FROM dosen d LEFT JOIN program_studi ps ON d.id_prodi = ps.id WHERE d.username = ?',
        [username]
      );

      if (dosenResults.length > 0) {
        user = dosenResults[0];
        role = 'dosen';
      }
    }

    // 3. Kalau tidak ketemu, cek di tabel Mahasiswa
    if (!user) {
      const mahasiswaResults = await db.query(
        `SELECT m.*, ps.nama_prodi, d.nama as nama_dosen 
         FROM mahasiswa m 
         LEFT JOIN program_studi ps ON m.id_prodi = ps.id 
         LEFT JOIN dosen d ON m.id_dosen_pembimbing = d.id 
         WHERE m.username = ?`,
        [username]
      );

      if (mahasiswaResults.length > 0) {
        user = mahasiswaResults[0];
        role = 'mahasiswa';
      }
    }

    // User tidak ditemukan
    if (!user) {
      return unauthorizedResponse(res, 'Username atau password salah');
    }

    // Debug: Check password field
    console.log('User found:', { username: user.username, hasPassword: !!user.password });
    
    // Verify password
    let isPasswordValid = false;
    
    try {
      // Kalau password masih plain text (untuk testing)
      if (user.password === password) {
        console.log('⚠️ WARNING: Plain text password detected!');
        isPasswordValid = true;
      } else {
        // Hash password
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
    } catch (err) {
      console.error('Password compare error:', err);
      return errorResponse(res, 'Error verifying password', 500, err.message);
    }
    
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Username atau password salah');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: role,
      nama: user.nama
    });

    // Remove password from response
    delete user.password;

    // Response
    return successResponse(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        email: user.email,
        role: role,
        ...(role === 'dosen' && { 
          nik: user.nik,
          prodi: user.nama_prodi,
          no_telp: user.no_telp 
        }),
        ...(role === 'mahasiswa' && { 
          nim: user.nim,
          prodi: user.nama_prodi,
          dosen_pembimbing: user.nama_dosen,
          judul_ta: user.judul_ta,
          no_telp: user.no_telp
        })
      }
    }, 'Login berhasil');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat login', 500, error.message);
  }
};

/**
 * GET CURRENT USER INFO
 */
const getCurrentUser = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user = null;

    if (role === 'admin') {
      const results = await db.query(
        'SELECT id, username, nama, email FROM admin WHERE id = ?',
        [id]
      );
      user = results[0];
    } else if (role === 'dosen') {
      const results = await db.query(
        `SELECT d.id, d.username, d.nama, d.email, d.nik, d.no_telp, d.foto_profil, ps.nama_prodi 
         FROM dosen d 
         LEFT JOIN program_studi ps ON d.id_prodi = ps.id 
         WHERE d.id = ?`,
        [id]
      );
      user = results[0];
    } else if (role === 'mahasiswa') {
      const results = await db.query(
        `SELECT m.id, m.username, m.nama, m.email, m.nim, m.no_telp, m.foto_profil, m.judul_ta,
         ps.nama_prodi, d.nama as nama_dosen, d.email as email_dosen, d.no_telp as telp_dosen
         FROM mahasiswa m 
         LEFT JOIN program_studi ps ON m.id_prodi = ps.id 
         LEFT JOIN dosen d ON m.id_dosen_pembimbing = d.id 
         WHERE m.id = ?`,
        [id]
      );
      user = results[0];
    }

    if (!user) {
      return unauthorizedResponse(res, 'User tidak ditemukan');
    }

    user.role = role;

    return successResponse(res, user, 'Data user berhasil diambil');

  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Gagal mengambil data user', 500, error.message);
  }
};

/**
 * LOGOUT (Optional - biasanya handle di client side)
 */
const logout = (req, res) => {
  return successResponse(res, null, 'Logout berhasil');
};

module.exports = {
  login,
  getCurrentUser,
  logout
};