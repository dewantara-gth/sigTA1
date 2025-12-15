// src/controllers/adminController.js - Admin Controller
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { successResponse, errorResponse, notFoundResponse, validationError } = require('../utils/responseHandler');
const { validateRequired, isValidEmail, isValidNIK, isValidNIM } = require('../utils/validation');

// ==========================================
// DASHBOARD
// ==========================================

/**
 * GET Dashboard Statistics
 */
const getDashboard = async (req, res) => {
  try {
    // Count total mahasiswa
    const totalMahasiswa = await db.query('SELECT COUNT(*) as total FROM mahasiswa');
    
    // Count total dosen
    const totalDosen = await db.query('SELECT COUNT(*) as total FROM dosen');
    
    // Count total berita
    const totalBerita = await db.query('SELECT COUNT(*) as total FROM berita');

    // Get recent berita
    const recentBerita = await db.query(
      'SELECT id, judul, tanggal_posting FROM berita ORDER BY tanggal_posting DESC LIMIT 5'
    );

    return successResponse(res, {
      totalMahasiswa: totalMahasiswa[0].total,
      totalDosen: totalDosen[0].total,
      totalBerita: totalBerita[0].total,
      recentBerita
    }, 'Dashboard data retrieved successfully');

  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, 'Failed to get dashboard data', 500, error.message);
  }
};

// ==========================================
// KELOLA DOSEN
// ==========================================

/**
 * GET All Dosen
 */
const getAllDosen = async (req, res) => {
  try {
    const dosen = await db.query(
      `SELECT d.id, d.nik, d.username, d.nama, d.email, d.no_telp, d.foto_profil,
       ps.nama_prodi, ps.kode_prodi
       FROM dosen d
       LEFT JOIN program_studi ps ON d.id_prodi = ps.id
       ORDER BY d.nama ASC`
    );

    return successResponse(res, dosen, 'Dosen list retrieved successfully');
  } catch (error) {
    console.error('Get all dosen error:', error);
    return errorResponse(res, 'Failed to get dosen list', 500, error.message);
  }
};

/**
 * GET Dosen by ID
 */
const getDosenById = async (req, res) => {
  try {
    const { id } = req.params;

    const dosen = await db.query(
      `SELECT d.*, ps.nama_prodi, ps.kode_prodi
       FROM dosen d
       LEFT JOIN program_studi ps ON d.id_prodi = ps.id
       WHERE d.id = ?`,
      [id]
    );

    if (dosen.length === 0) {
      return notFoundResponse(res, 'Dosen not found');
    }

    // Get mahasiswa bimbingan
    const mahasiswa = await db.query(
      'SELECT id, nim, nama, judul_ta FROM mahasiswa WHERE id_dosen_pembimbing = ?',
      [id]
    );

    return successResponse(res, { ...dosen[0], mahasiswa_bimbingan: mahasiswa }, 'Dosen retrieved successfully');
  } catch (error) {
    console.error('Get dosen by id error:', error);
    return errorResponse(res, 'Failed to get dosen', 500, error.message);
  }
};

/**
 * POST Create Dosen
 */
const createDosen = async (req, res) => {
  try {
    const { nik, username, password, nama, email, no_telp, id_prodi } = req.body;

    // Validate required fields
    const validation = validateRequired(['nik', 'username', 'password', 'nama', 'email'], req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    // Validate email
    if (!isValidEmail(email)) {
      return validationError(res, { email: 'Invalid email format' });
    }

    // Validate NIK
    if (!isValidNIK(nik)) {
      return validationError(res, { nik: 'NIK must be at least 5 characters' });
    }

    // Check if username already exists
    const existingUsername = await db.query('SELECT id FROM dosen WHERE username = ?', [username]);
    if (existingUsername.length > 0) {
      return validationError(res, { username: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await db.query('SELECT id FROM dosen WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return validationError(res, { email: 'Email already exists' });
    }

    // Check if NIK already exists
    const existingNIK = await db.query('SELECT id FROM dosen WHERE nik = ?', [nik]);
    if (existingNIK.length > 0) {
      return validationError(res, { nik: 'NIK already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert dosen
    const result = await db.query(
      `INSERT INTO dosen (nik, username, password, nama, email, no_telp, id_prodi)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nik, username, hashedPassword, nama, email, no_telp || null, id_prodi || null]
    );

    return successResponse(res, { id: result.insertId }, 'Dosen created successfully', 201);
  } catch (error) {
    console.error('Create dosen error:', error);
    return errorResponse(res, 'Failed to create dosen', 500, error.message);
  }
};

/**
 * PUT Update Dosen
 */
const updateDosen = async (req, res) => {
  try {
    const { id } = req.params;
    const { nik, nama, email, no_telp, id_prodi } = req.body;

    // Check if dosen exists
    const existing = await db.query('SELECT id FROM dosen WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Dosen not found');
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return validationError(res, { email: 'Invalid email format' });
    }

    // Check email uniqueness (exclude current dosen)
    if (email) {
      const emailCheck = await db.query('SELECT id FROM dosen WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return validationError(res, { email: 'Email already exists' });
      }
    }

    // Update dosen
    await db.query(
      `UPDATE dosen 
       SET nik = ?, nama = ?, email = ?, no_telp = ?, id_prodi = ?
       WHERE id = ?`,
      [nik, nama, email, no_telp || null, id_prodi || null, id]
    );

    return successResponse(res, null, 'Dosen updated successfully');
  } catch (error) {
    console.error('Update dosen error:', error);
    return errorResponse(res, 'Failed to update dosen', 500, error.message);
  }
};

/**
 * DELETE Dosen
 */
const deleteDosen = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if dosen exists
    const existing = await db.query('SELECT id FROM dosen WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Dosen not found');
    }

    // Check if dosen has mahasiswa bimbingan
    const mahasiswa = await db.query('SELECT COUNT(*) as total FROM mahasiswa WHERE id_dosen_pembimbing = ?', [id]);
    if (mahasiswa[0].total > 0) {
      return errorResponse(res, 'Cannot delete dosen with active students', 400);
    }

    // Delete dosen
    await db.query('DELETE FROM dosen WHERE id = ?', [id]);

    return successResponse(res, null, 'Dosen deleted successfully');
  } catch (error) {
    console.error('Delete dosen error:', error);
    return errorResponse(res, 'Failed to delete dosen', 500, error.message);
  }
};

// ==========================================
// KELOLA MAHASISWA
// ==========================================

/**
 * GET All Mahasiswa
 */
const getAllMahasiswa = async (req, res) => {
  try {
    const mahasiswa = await db.query(
      `SELECT m.id, m.nim, m.username, m.nama, m.email, m.no_telp, m.judul_ta, m.foto_profil,
       ps.nama_prodi, ps.kode_prodi,
       d.nama as nama_dosen, d.nik as nik_dosen
       FROM mahasiswa m
       LEFT JOIN program_studi ps ON m.id_prodi = ps.id
       LEFT JOIN dosen d ON m.id_dosen_pembimbing = d.id
       ORDER BY m.nama ASC`
    );

    return successResponse(res, mahasiswa, 'Mahasiswa list retrieved successfully');
  } catch (error) {
    console.error('Get all mahasiswa error:', error);
    return errorResponse(res, 'Failed to get mahasiswa list', 500, error.message);
  }
};

/**
 * GET Mahasiswa by ID
 */
const getMahasiswaById = async (req, res) => {
  try {
    const { id } = req.params;

    const mahasiswa = await db.query(
      `SELECT m.*, ps.nama_prodi, d.nama as nama_dosen, d.email as email_dosen
       FROM mahasiswa m
       LEFT JOIN program_studi ps ON m.id_prodi = ps.id
       LEFT JOIN dosen d ON m.id_dosen_pembimbing = d.id
       WHERE m.id = ?`,
      [id]
    );

    if (mahasiswa.length === 0) {
      return notFoundResponse(res, 'Mahasiswa not found');
    }

    return successResponse(res, mahasiswa[0], 'Mahasiswa retrieved successfully');
  } catch (error) {
    console.error('Get mahasiswa by id error:', error);
    return errorResponse(res, 'Failed to get mahasiswa', 500, error.message);
  }
};

/**
 * POST Create Mahasiswa
 */
const createMahasiswa = async (req, res) => {
  try {
    const { nim, username, password, nama, email, no_telp, id_prodi, id_dosen_pembimbing, judul_ta } = req.body;

    // Validate required fields
    const validation = validateRequired(['nim', 'username', 'password', 'nama', 'email'], req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    // Validate email
    if (!isValidEmail(email)) {
      return validationError(res, { email: 'Invalid email format' });
    }

    // Validate NIM
    if (!isValidNIM(nim)) {
      return validationError(res, { nim: 'NIM must be 10 digits' });
    }

    // Check if username already exists
    const existingUsername = await db.query('SELECT id FROM mahasiswa WHERE username = ?', [username]);
    if (existingUsername.length > 0) {
      return validationError(res, { username: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await db.query('SELECT id FROM mahasiswa WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return validationError(res, { email: 'Email already exists' });
    }

    // Check if NIM already exists
    const existingNIM = await db.query('SELECT id FROM mahasiswa WHERE nim = ?', [nim]);
    if (existingNIM.length > 0) {
      return validationError(res, { nim: 'NIM already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert mahasiswa
    const result = await db.query(
      `INSERT INTO mahasiswa (nim, username, password, nama, email, no_telp, id_prodi, id_dosen_pembimbing, judul_ta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nim, username, hashedPassword, nama, email, no_telp || null, id_prodi || null, id_dosen_pembimbing || null, judul_ta || null]
    );

    return successResponse(res, { id: result.insertId }, 'Mahasiswa created successfully', 201);
  } catch (error) {
    console.error('Create mahasiswa error:', error);
    return errorResponse(res, 'Failed to create mahasiswa', 500, error.message);
  }
};

/**
 * PUT Update Mahasiswa
 */
const updateMahasiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nim, nama, email, no_telp, id_prodi, id_dosen_pembimbing, judul_ta } = req.body;

    // Check if mahasiswa exists
    const existing = await db.query('SELECT id FROM mahasiswa WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Mahasiswa not found');
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return validationError(res, { email: 'Invalid email format' });
    }

    // Check email uniqueness (exclude current mahasiswa)
    if (email) {
      const emailCheck = await db.query('SELECT id FROM mahasiswa WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return validationError(res, { email: 'Email already exists' });
      }
    }

    // Update mahasiswa
    await db.query(
      `UPDATE mahasiswa 
       SET nim = ?, nama = ?, email = ?, no_telp = ?, id_prodi = ?, id_dosen_pembimbing = ?, judul_ta = ?
       WHERE id = ?`,
      [nim, nama, email, no_telp || null, id_prodi || null, id_dosen_pembimbing || null, judul_ta || null, id]
    );

    return successResponse(res, null, 'Mahasiswa updated successfully');
  } catch (error) {
    console.error('Update mahasiswa error:', error);
    return errorResponse(res, 'Failed to update mahasiswa', 500, error.message);
  }
};

/**
 * DELETE Mahasiswa
 */
const deleteMahasiswa = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if mahasiswa exists
    const existing = await db.query('SELECT id FROM mahasiswa WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Mahasiswa not found');
    }

    // Delete mahasiswa (cascade will delete related data)
    await db.query('DELETE FROM mahasiswa WHERE id = ?', [id]);

    return successResponse(res, null, 'Mahasiswa deleted successfully');
  } catch (error) {
    console.error('Delete mahasiswa error:', error);
    return errorResponse(res, 'Failed to delete mahasiswa', 500, error.message);
  }
};

// ==========================================
// GET ALL USERS (for Daftar Pengguna page)
// ==========================================

/**
 * GET All Users (Dosen + Mahasiswa)
 */
const getAllUsers = async (req, res) => {
  try {
    // Get all mahasiswa with details
    const mahasiswa = await db.query(
      `SELECT m.id, m.nim, m.nama, m.judul_ta,
       ps.nama_prodi,
       d.nama as nama_dosen
       FROM mahasiswa m
       LEFT JOIN program_studi ps ON m.id_prodi = ps.id
       LEFT JOIN dosen d ON m.id_dosen_pembimbing = d.id
       ORDER BY m.nama ASC`
    );

    // Get all dosen with mahasiswa count
    const dosen = await db.query(
      `SELECT d.id, d.nik, d.nama,
       ps.nama_prodi,
       COUNT(m.id) as jumlah_mahasiswa
       FROM dosen d
       LEFT JOIN program_studi ps ON d.id_prodi = ps.id
       LEFT JOIN mahasiswa m ON d.id = m.id_dosen_pembimbing
       GROUP BY d.id, d.nik, d.nama, ps.nama_prodi
       ORDER BY d.nama ASC`
    );

    return successResponse(res, { mahasiswa, dosen }, 'All users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 'Failed to get users', 500, error.message);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getDashboard,
  getAllDosen,
  getDosenById,
  createDosen,
  updateDosen,
  deleteDosen,
  getAllMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
  getAllUsers
};