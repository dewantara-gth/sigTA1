// src/controllers/beritaController.js - Berita Controller
const db = require('../config/database');
const { successResponse, errorResponse, notFoundResponse, validationError } = require('../utils/responseHandler');
const { validateRequired } = require('../utils/validation');

/**
 * GET All Berita
 */
const getAllBerita = async (req, res) => {
  try {
    const berita = await db.query(
      `SELECT b.id, b.judul, b.konten, b.tanggal_posting,
       a.nama as author
       FROM berita b
       LEFT JOIN admin a ON b.id_admin = a.id
       ORDER BY b.tanggal_posting DESC`
    );

    return successResponse(res, berita, 'Berita list retrieved successfully');
  } catch (error) {
    console.error('Get all berita error:', error);
    return errorResponse(res, 'Failed to get berita list', 500, error.message);
  }
};

/**
 * GET Berita by ID
 */
const getBeritaById = async (req, res) => {
  try {
    const { id } = req.params;

    const berita = await db.query(
      `SELECT b.*, a.nama as author
       FROM berita b
       LEFT JOIN admin a ON b.id_admin = a.id
       WHERE b.id = ?`,
      [id]
    );

    if (berita.length === 0) {
      return notFoundResponse(res, 'Berita not found');
    }

    return successResponse(res, berita[0], 'Berita retrieved successfully');
  } catch (error) {
    console.error('Get berita by id error:', error);
    return errorResponse(res, 'Failed to get berita', 500, error.message);
  }
};

/**
 * POST Create Berita
 */
const createBerita = async (req, res) => {
  try {
    const { judul, konten } = req.body;
    const id_admin = req.user.id; // dari JWT token

    // Validate required fields
    const validation = validateRequired(['judul'], req.body);
    if (!validation.isValid) {
      return validationError(res, validation.errors);
    }

    // Insert berita
    const result = await db.query(
      'INSERT INTO berita (judul, konten, id_admin) VALUES (?, ?, ?)',
      [judul, konten || null, id_admin]
    );

    return successResponse(res, { id: result.insertId }, 'Berita created successfully', 201);
  } catch (error) {
    console.error('Create berita error:', error);
    return errorResponse(res, 'Failed to create berita', 500, error.message);
  }
};

/**
 * PUT Update Berita
 */
const updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, konten } = req.body;

    // Check if berita exists
    const existing = await db.query('SELECT id FROM berita WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Berita not found');
    }

    // Update berita
    await db.query(
      'UPDATE berita SET judul = ?, konten = ? WHERE id = ?',
      [judul, konten || null, id]
    );

    return successResponse(res, null, 'Berita updated successfully');
  } catch (error) {
    console.error('Update berita error:', error);
    return errorResponse(res, 'Failed to update berita', 500, error.message);
  }
};

/**
 * DELETE Berita
 */
const deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if berita exists
    const existing = await db.query('SELECT id FROM berita WHERE id = ?', [id]);
    if (existing.length === 0) {
      return notFoundResponse(res, 'Berita not found');
    }

    // Delete berita
    await db.query('DELETE FROM berita WHERE id = ?', [id]);

    return successResponse(res, null, 'Berita deleted successfully');
  } catch (error) {
    console.error('Delete berita error:', error);
    return errorResponse(res, 'Failed to delete berita', 500, error.message);
  }
};

module.exports = {
  getAllBerita,
  getBeritaById,
  createBerita,
  updateBerita,
  deleteBerita
};