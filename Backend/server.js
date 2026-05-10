require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// CORS middleware - MUST be first
app.use((req, res, next) => {
    // Handle OPTIONS preflight immediately - NO DB CONNECTION
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', 'https://podcraft-taupe.vercel.app');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
        return res.status(200).end();
    }
    
    // Set CORS headers for actual requests
    res.setHeader('Access-Control-Allow-Origin', 'https://podcraft-taupe.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/api/debug-routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
        }
    });
    res.json({ routes });
});

// Database connection with caching for serverless
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }
    
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        isConnected = true;
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Apply DB connection ONLY to actual API routes
app.use('/api/auth', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

app.use('/api/episodes', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed' 
        });
    }
});

app.use('/api/research', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed' 
        });
    }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/episodes', require('./routes/episodeRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working' });
});

app.get('/', (req, res) => {
    res.json({ success: true, message: 'PodCraft API is running' });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        success: false, 
        message: `Route not found: ${req.method} ${req.url}` 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;

// For local development only
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}