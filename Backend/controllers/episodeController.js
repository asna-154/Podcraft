const Episode = require('../models/Episode');
const Research = require('../models/Research');

// @desc    Create new episode intent
// @route   POST /api/episodes
const createEpisode = async (req, res) => {
    try {
        const { podcastNiche, episodeTopic, tone, episodeDuration } = req.body;

        // Check required fields
        if (!podcastNiche || !episodeTopic) {
            return res.status(400).json({
                success: false,
                message: 'Please provide niche and episode topic'
            });
        }

        // Check free tier limit (3 episodes per month)
        if (req.user.subscription === 'free') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const episodeCount = await Episode.countDocuments({
                user: req.user.id,
                createdAt: { $gte: startOfMonth }
            });

            if (episodeCount >= 3) {
                return res.status(403).json({
                    success: false,
                    message: 'Free tier limit reached. You can only create 3 episodes per month. Please upgrade to premium.'
                });
            }
        }

        // Create episode
        const episode = await Episode.create({
            user: req.user.id,
            podcastNiche,
            episodeTopic,
            tone: tone || 'Professional',
            episodeDuration: episodeDuration || 60,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            message: 'Episode intent created successfully',
            episode
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all episodes for logged in user
// @route   GET /api/episodes
const getEpisodes = async (req, res) => {
    try {
        const episodes = await Episode.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: episodes.length,
            episodes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single episode
// @route   GET /api/episodes/:id
const getEpisode = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.id)
            .populate('bookmarkedTopics');

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        // Make sure episode belongs to logged in user
        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this episode'
            });
        }

        res.status(200).json({
            success: true,
            episode
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update episode intent
// @route   PUT /api/episodes/:id
const updateEpisode = async (req, res) => {
    try {
        let episode = await Episode.findById(req.params.id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        // Make sure episode belongs to logged in user
        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this episode'
            });
        }

        episode = await Episode.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Episode updated successfully',
            episode
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete episode
// @route   DELETE /api/episodes/:id
const deleteEpisode = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        // Make sure episode belongs to logged in user
        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this episode'
            });
        }

        // Also delete associated research
        await Research.deleteMany({ episode: req.params.id });
        await Episode.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Episode deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add guest to episode
// @route   POST /api/episodes/:id/guests
const addGuest = async (req, res) => {
    try {
        const { name, profession, url, bio } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Guest name is required'
            });
        }

        const episode = await Episode.findById(req.params.id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Max 3 guests check
        if (episode.guests.length >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 3 guests allowed per episode'
            });
        }

        // Generate guest summary based on provided info
        const generatedSummary = generateGuestSummary(name, profession, bio);

        episode.guests.push({
            name,
            profession,
            url,
            bio,
            generatedSummary
        });

        await episode.save();

        res.status(200).json({
            success: true,
            message: 'Guest added successfully',
            guests: episode.guests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Edit guest
// @route   PUT /api/episodes/:id/guests/:guestId
const editGuest = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const guest = episode.guests.id(req.params.guestId);
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Guest not found'
            });
        }

        const { name, profession, url, bio } = req.body;
        if (name) guest.name = name;
        if (profession) guest.profession = profession;
        if (url) guest.url = url;
        if (bio) guest.bio = bio;
        guest.generatedSummary = generateGuestSummary(
            guest.name,
            guest.profession,
            guest.bio
        );

        await episode.save();

        res.status(200).json({
            success: true,
            message: 'Guest updated successfully',
            guests: episode.guests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete guest
// @route   DELETE /api/episodes/:id/guests/:guestId
const deleteGuest = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.id);

        if (!episode) {
            return res.status(404).json({
                success: false,
                message: 'Episode not found'
            });
        }

        if (episode.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        episode.guests = episode.guests.filter(
            g => g._id.toString() !== req.params.guestId
        );

        await episode.save();

        res.status(200).json({
            success: true,
            message: 'Guest removed successfully',
            guests: episode.guests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get episode history
// @route   GET /api/episodes/history
const getEpisodeHistory = async (req, res) => {
    try {
        const episodes = await Episode.find({
            user: req.user.id,
            status: 'complete'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: episodes.length,
            episodes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper: Generate guest summary
const generateGuestSummary = (name, profession, bio) => {
    if (bio) {
        return `${name} is a ${profession || 'professional'} with expertise in their field. ${bio}`;
    }
    return `${name} is a ${profession || 'professional'} who brings valuable insights and experience to the conversation.`;
};

module.exports = {
    createEpisode,
    getEpisodes,
    getEpisode,
    updateEpisode,
    deleteEpisode,
    addGuest,
    editGuest,
    deleteGuest,
    getEpisodeHistory
};
