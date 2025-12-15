// src/routes/beritaRoutes.js - Berita Routes
const express = require('express');
const router = express.Router();
const {
  getAllBerita,
  getBeritaById,
  createBerita,
  updateBerita,
  deleteBerita
} = require('../controllers/beritaController');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/berita
 * @desc    Get all berita (public)
 * @access  Public
 */
router.get('/', getAllBerita);

/**
 * @route   GET /api/berita/:id
 * @desc    Get berita by ID (public)
 * @access  Public
 */
router.get('/:id', getBeritaById);

/**
 * @route   POST /api/berita
 * @desc    Create berita
 * @access  Private (Admin only)
 */
router.post('/', verifyToken, isAdmin, createBerita);

/**
 * @route   PUT /api/berita/:id
 * @desc    Update berita
 * @access  Private (Admin only)
 */
router.put('/:id', verifyToken, isAdmin, updateBerita);

/**
 * @route   DELETE /api/berita/:id
 * @desc    Delete berita
 * @access  Private (Admin only)
 */
router.delete('/:id', verifyToken, isAdmin, deleteBerita);

module.exports = router;