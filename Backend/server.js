require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({
    origin: ['https://podcraft-taupe.vercel.app', 'http://localhost:3000', 'http://13.61.216.50'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/episodes', require('./routes/episodeRoutes'));
app.use('/api/research', require('./routes/researchRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'PodCraft API is running' });
});

// Serve the built React app. At deploy time the React "build" folder is copied
// into Backend/public. If it isn't there (e.g. on your own computer), the
// server just answers with the API message like before.
const publicDir = path.join(__dirname, 'public');
const indexFile = path.join(publicDir, 'index.html');

if (fs.existsSync(indexFile)) {
    app.use(express.static(publicDir));

    // Any other page address goes to React, which handles its own pages
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(indexFile);
        }
        next();
    });
} else {
    app.get('/', (req, res) => {
        res.json({ success: true, message: 'PodCraft API is running' });
    });
}

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));