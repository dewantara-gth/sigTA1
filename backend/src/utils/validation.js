// src/utils/validation.js - Input Validation Functions

/**
 * Validate Email Format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Phone Number (Indonesia)
 */
const isValidPhone = (phone) => {
  // Format: 08xx-xxxx-xxxx atau 628xx-xxxx-xxxx
  const phoneRegex = /^(08|628)[0-9]{8,11}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

/**
 * Validate Password Strength
 * Minimal 6 karakter
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate NIM Format
 * Format: 10 digit angka
 */
const isValidNIM = (nim) => {
  const nimRegex = /^[0-9]{10}$/;
  return nimRegex.test(nim);
};

/**
 * Validate NIK Format
 * Format: minimal 5 karakter
 */
const isValidNIK = (nik) => {
  return nik && nik.length >= 5;
};

/**
 * Sanitize String Input
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate Required Fields
 */
const validateRequired = (fields, data) => {
  const errors = {};
  
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate Login Input
 */
const validateLogin = (username, password) => {
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Username is required';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidNIM,
  isValidNIK,
  sanitizeString,
  validateRequired,
  validateLogin
};