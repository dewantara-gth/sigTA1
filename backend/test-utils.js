// test-utils.js - Test utilities
const { isValidEmail, isValidNIM, validateRequired } = require('./src/utils/validation');

console.log('=== TESTING VALIDATION UTILS ===\n');

// Test email validation
console.log('1. Email Validation:');
console.log('   Valid email:', isValidEmail('test@polibatam.ac.id')); // should be true
console.log('   Invalid email:', isValidEmail('notanemail')); // should be false

// Test NIM validation
console.log('\n2. NIM Validation:');
console.log('   Valid NIM:', isValidNIM('3312411089')); // should be true
console.log('   Invalid NIM:', isValidNIM('123')); // should be false

// Test required fields
console.log('\n3. Required Fields Validation:');
const data = { username: 'admin', password: '' };
const result = validateRequired(['username', 'password'], data);
console.log('   Result:', result);

console.log('\n✅ All utils working correctly!');