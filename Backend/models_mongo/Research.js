const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
    episode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Episode',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    niche: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    source: {
        type: String,
        trim: true
    },
    sourceUrl: {
        type: String,
        trim: true
    },
    publicationDate: {
        type: String,
        trim: true
    },
    relevanceScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
    },
    category: {
        type: String,
        enum: ['News', 'Academic', 'Social Media', 'Industry Blogs', 'Podcasts'],
        default: 'News'
    },
    isBookmarked: {
        type: Boolean,
        default: false
    },
    isRejected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Research', researchSchema);