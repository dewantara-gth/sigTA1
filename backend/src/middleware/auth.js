// src/middleware/auth.js - JWT Authentication Middleware
const jwt = require('jsonwebtoken');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseHandler');

/**
 * Verify JWT Token
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided');
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expired');
    }
    return unauthorizedResponse(res, 'Invalid token');
  }
};

/**
 * Check if user is Admin
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return forbiddenResponse(res, 'Admin access required');
  }
  next();
};

/**
 * Check if user is Dosen
 */
const isDosen = (req, res, next) => {
  if (req.user.role !== 'dosen') {
    return forbiddenResponse(res, 'Dosen access required');
  }
  next();
};

/**
 * Check if user is Mahasiswa
 */
const isMahasiswa = (req, res, next) => {
  if (req.user.role !== 'mahasiswa') {
    return forbiddenResponse(res, 'Mahasiswa access required');
  }
  next();
};

/**
 * Check if user is Dosen or Admin
 */
const isDosenOrAdmin = (req, res, next) => {
  if (req.user.role !== 'dosen' && req.user.role !== 'admin') {
    return forbiddenResponse(res, 'Dosen or Admin access required');
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDosen,
  isMahasiswa,
  isDosenOrAdmin
};