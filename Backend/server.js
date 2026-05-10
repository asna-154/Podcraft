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

// Debug route
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

// ============ LOAD ROUTES WITH ERROR HANDLING ============
console.log('=== Starting to load routes ===');

try {
    console.log('Attempting to load authRoutes...');
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ authRoutes loaded successfully');
} catch (error) {
    console.error('❌ FAILED to load authRoutes:', error.message);
    console.error('Full error:', error);
    // Add a fallback route so we know it failed
    app.use('/api/auth', (req, res) => {
        res.status(500).json({ 
            success: false, 
            message: 'Auth routes failed to load',
            error: error.message 
        });
    });
}

try {
    console.log('Attempting to load episodeRoutes...');
    const episodeRoutes = require('./routes/episodeRoutes');
    app.use('/api/episodes', episodeRoutes);
    console.log('✅ episodeRoutes loaded successfully');
} catch (error) {
    console.error('❌ FAILED to load episodeRoutes:', error.message);
    console.error('Full error:', error);
    app.use('/api/episodes', (req, res) => {
        res.status(500).json({ 
            success: false, 
            message: 'Episode routes failed to load',
            error: error.message 
        });
    });
}

try {
    console.log('Attempting to load researchRoutes...');
    const researchRoutes = require('./routes/researchRoutes');
    app.use('/api/research', researchRoutes);
    console.log('✅ researchRoutes loaded successfully');
} catch (error) {
    console.error('❌ FAILED to load researchRoutes:', error.message);
    console.error('Full error:', error);
    app.use('/api/research', (req, res) => {
        res.status(500).json({ 
            success: false, 
            message: 'Research routes failed to load',
            error: error.message 
        });
    });
}

console.log('=== Finished loading routes ===');
// ============ END ROUTE LOADING ============

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