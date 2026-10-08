const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    profession: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    generatedSummary: {
        type: String,
        trim: true
    }
});

const episodeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    podcastNiche: {
        type: String,
        required: [true, 'Podcast niche is required'],
        enum: [
            'Technology', 'Business & Entrepreneurship', 'Health & Wellness',
            'True Crime', 'Education', 'Entertainment', 'Sports',
            'Politics & News', 'Science', 'Personal Development',
            'Finance', 'Arts & Culture', 'History', 'Comedy',
            'Religion & Spirituality', 'Society & Culture',
            'Kids & Family', 'Music', 'Travel', 'Food'
        ]
    },
    episodeTopic: {
        type: String,
        required: [true, 'Episode topic is required'],
        maxlength: [200, 'Topic cannot exceed 200 characters'],
        trim: true
    },
    tone: {
        type: String,
        enum: ['Casual', 'Professional', 'Humorous', 'Serious'],
        default: 'Professional'
    },
    episodeDuration: {
        type: Number,
        default: 60
    },
    guests: {
        type: [guestSchema],
        validate: {
            validator: function(guests) {
                return guests.length <= 3;
            },
            message: 'Maximum 3 guests allowed per episode'
        }
    },
    status: {
        type: String,
        enum: ['draft', 'research', 'planning', 'complete'],
        default: 'draft'
    },
    researchStatus: {
        type: String,
        enum: ['pending', 'processing', 'complete', 'failed'],
        default: 'pending'
    },
    bookmarkedTopics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Research'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Episode', episodeSchema);