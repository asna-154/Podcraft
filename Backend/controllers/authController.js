const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
    console.log("=== REGISTER FUNCTION STARTED ===");
    console.log("Request body:", req.body);
    
    try {
        const { fullName, email, password } = req.body;
        console.log("Destructured:", { fullName, email, password });

        // Check all fields provided
        if (!fullName || !email || !password) {
            console.log("Missing fields");
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        console.log("About to check User.findOne");
        // Check if user exists
        const userExists = await User.findOne({ email });
        console.log("User exists check completed:", userExists);
        
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        console.log("About to create user");
        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            isVerified: true
        });
        console.log("User created:", user._id);

        console.log("About to generate token");
        const token = generateToken(user._id);
        console.log("Token generated");

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                subscription: user.subscription,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.log("=== CATCH BLOCK HIT ===");
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack  // This will now show in your frontend
        });
    }
};
// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                message: `Account locked. Try again in ${lockTime} minutes`
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            // Increment login attempts
            user.loginAttempts += 1;

            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                user.loginAttempts = 0;
                await user.save();
                return res.status(423).json({
                    success: false,
                    message: 'Account locked for 15 minutes due to too many failed attempts'
                });
            }

            await user.save();
            return res.status(401).json({
                success: false,
                message: `Incorrect email or password. ${5 - user.loginAttempts} attempts remaining`
            });
        }

        // Reset login attempts on success
        user.loginAttempts = 0;
        user.lockUntil = null;
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                subscription: user.subscription,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update account settings
// @route   PUT /api/auth/update
const updateAccount = async (req, res) => {
    try {
        const { fullName, email, notificationPreferences } = req.body;

        const user = await User.findById(req.user.id);

        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (notificationPreferences) 
            user.notificationPreferences = notificationPreferences;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                notificationPreferences: user.notificationPreferences
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Validate new password
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must contain uppercase, number, and special character'
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete account
// @route   DELETE /api/auth/delete
const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateAccount,
    updatePassword,
    logoutUser,
    deleteAccount
};