const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.route('/profile')
  .get(auth, authController.getProfile)
  .put(auth, authController.updateProfile);

module.exports = router;
