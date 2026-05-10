require('dotenv').config();
// Handle CORS preflight
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://podcraft-taupe.vercel.app';

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://podcraft-taupe.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(cors({
    origin: 'https://podcraft-taupe.vercel.app',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/episodes', require('./routes/episodeRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));

// Base route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'PodCraft API is running'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Handle undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});