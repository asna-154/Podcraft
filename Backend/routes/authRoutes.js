const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateAccount,
    updatePassword,
    logoutUser,
    deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);
router.put('/update', protect, updateAccount);
router.put('/update-password', protect, updatePassword);
router.delete('/delete', protect, deleteAccount);

module.exports = router;