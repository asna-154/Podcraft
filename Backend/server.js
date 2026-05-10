require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://podcraft-taupe.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect DB on each request
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        family: 4
    });
};

app.use(async (req, res, next) => {
    await connectDB();
    next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/episodes', require('./routes/episodeRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));

app.get('/', (req, res) => {
    res.json({ success: true, message: 'PodCraft API is running' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}