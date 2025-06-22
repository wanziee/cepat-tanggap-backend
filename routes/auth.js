const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Debug route
router.all('/admin/login', (req, res, next) => {
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Admin login route
router.post('/admin/login', authController.adminLogin);

// Protected routes
router.get('/me', auth, authController.getMe); // Endpoint untuk mendapatkan data user yang sedang login
router.route('/profile')
  .get(auth, authController.getProfile)
  .put(auth, authController.updateProfile);

module.exports = router;
