const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Log incoming headers for debugging
    console.log('Auth Headers:', req.headers);
    
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'Tidak ada token, otentikasi gagal' });
    }

    // Handle both 'Bearer token' and just 'token' formats
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : authHeader.trim();

    if (!token) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ message: 'Format token tidak valid' });
    }

    console.log('Verifying token:', token);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }  // Don't include password
    });

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    console.log('User authenticated:', user.id, user.nama);
    
    // Attach user and token to request object
    req.token = token;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token telah kadaluarsa' });
    }
    
    res.status(401).json({ message: 'Otentikasi gagal' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} tidak diizinkan mengakses resource ini` 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
