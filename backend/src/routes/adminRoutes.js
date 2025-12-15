// src/routes/adminRoutes.js - Admin Routes
const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(verifyToken, isAdmin);

// ==========================================
// DASHBOARD
// ==========================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/dashboard', getDashboard);

// ==========================================
// DOSEN ROUTES
// ==========================================

/**
 * @route   GET /api/admin/dosen
 * @desc    Get all dosen
 * @access  Private (Admin only)
 */
router.get('/dosen', getAllDosen);

/**
 * @route   GET /api/admin/dosen/:id
 * @desc    Get dosen by ID
 * @access  Private (Admin only)
 */
router.get('/dosen/:id', getDosenById);

/**
 * @route   POST /api/admin/dosen
 * @desc    Create new dosen
 * @access  Private (Admin only)
 */
router.post('/dosen', createDosen);

/**
 * @route   PUT /api/admin/dosen/:id
 * @desc    Update dosen
 * @access  Private (Admin only)
 */
router.put('/dosen/:id', updateDosen);

/**
 * @route   DELETE /api/admin/dosen/:id
 * @desc    Delete dosen
 * @access  Private (Admin only)
 */
router.delete('/dosen/:id', deleteDosen);

// ==========================================
// MAHASISWA ROUTES
// ==========================================

/**
 * @route   GET /api/admin/mahasiswa
 * @desc    Get all mahasiswa
 * @access  Private (Admin only)
 */
router.get('/mahasiswa', getAllMahasiswa);

/**
 * @route   GET /api/admin/mahasiswa/:id
 * @desc    Get mahasiswa by ID
 * @access  Private (Admin only)
 */
router.get('/mahasiswa/:id', getMahasiswaById);

/**
 * @route   POST /api/admin/mahasiswa
 * @desc    Create new mahasiswa
 * @access  Private (Admin only)
 */
router.post('/mahasiswa', createMahasiswa);

/**
 * @route   PUT /api/admin/mahasiswa/:id
 * @desc    Update mahasiswa
 * @access  Private (Admin only)
 */
router.put('/mahasiswa/:id', updateMahasiswa);

/**
 * @route   DELETE /api/admin/mahasiswa/:id
 * @desc    Delete mahasiswa
 * @access  Private (Admin only)
 */
router.delete('/mahasiswa/:id', deleteMahasiswa);

// ==========================================
// USERS (Daftar Pengguna)
// ==========================================

/**
 * @route   GET /api/admin/pengguna
 * @desc    Get all users (dosen + mahasiswa)
 * @access  Private (Admin only)
 */
router.get('/pengguna', getAllUsers);

module.exports = router;