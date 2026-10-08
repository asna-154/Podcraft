const { Op } = require('sequelize');
const { sequelize, Episode, Guest, Research, EpisodeBookmark } = require('../models');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Ids are numbers now. Anything else (e.g. an old MongoDB id) simply "isn't found".
const isId = (value) => /^\d+$/.test(String(value));

// Fields a user is allowed to change through PUT /api/episodes/:id
const EDITABLE_FIELDS = [
    'podcastNiche', 'episodeTopic', 'tone', 'episodeDuration', 'status', 'researchStatus'
];

const guestOrder = [{ model: Guest, as: 'guests' }, 'id', 'ASC'];

// What to load together with an episode: its guests and its bookmarked research.
// full = whole research items (like Mongoose populate), otherwise only their ids.
const relations = (full) => [
    { model: Guest, as: 'guests' },
    {
        model: Research,
        as: 'bookmarkedTopics',
        through: { attributes: [] },
        ...(full ? {} : { attributes: ['id'] })
    }
];

// The React app was written for MongoDB documents, so responses keep that shape:
// `_id`, `user` (the owner's id), `guests`, and `bookmarkedTopics`.
const shapeEpisode = (episode, full = false) => {
    const json = episode.toJSON();
    json.user = String(episode.userId);
    json.guests = json.guests || [];
    const topics = json.bookmarkedTopics || [];
    json.bookmarkedTopics = full
        ? topics.map(t => ({ ...t, episode: String(t.episodeId), user: String(t.userId) }))
        : topics.map(t => String(t.id));
    return json;
};

// Finds an episode and checks it belongs to the logged in user.
// If either check fails it sends the error response itself and returns null.
const findOwnedEpisode = async (req, res, episodeId, notAuthorizedMessage = 'Not authorized', options = {}) => {
    const episode = isId(episodeId) ? await Episode.findByPk(episodeId, options) : null;

    if (!episode) {
        res.status(404).json({
            success: false,
            message: 'Episode not found'
        });
        return null;
    }

    // Make sure episode belongs to logged in user
    if (String(episode.userId) !== String(req.user.id)) {
        res.status(401).json({
            success: false,
            message: notAuthorizedMessage
        });
        return null;
    }

    return episode;
};

const loadGuests = (episodeId) =>
    Guest.findAll({ where: { episodeId }, order: [['id', 'ASC']] });

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

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

            const episodeCount = await Episode.count({
                where: {
                    userId: req.user.id,
                    createdAt: { [Op.gte]: startOfMonth }
                }
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
            userId: req.user.id,
            podcastNiche,
            episodeTopic,
            tone: tone || 'Professional',
            episodeDuration: episodeDuration || 60,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            message: 'Episode intent created successfully',
            episode: shapeEpisode(episode)
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
        const episodes = await Episode.findAll({
            where: { userId: req.user.id },
            include: relations(false),
            order: [['createdAt', 'DESC'], guestOrder]
        });

        res.status(200).json({
            success: true,
            count: episodes.length,
            episodes: episodes.map(e => shapeEpisode(e))
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
        const episode = await findOwnedEpisode(
            req, res, req.params.id,
            'Not authorized to access this episode',
            { include: relations(true), order: [guestOrder] }
        );
        if (!episode) return;

        res.status(200).json({
            success: true,
            episode: shapeEpisode(episode, true)
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
        const episode = await findOwnedEpisode(
            req, res, req.params.id, 'Not authorized to update this episode'
        );
        if (!episode) return;

        const updates = {};
        EDITABLE_FIELDS.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        await episode.update(updates);

        const updated = await Episode.findByPk(episode.id, {
            include: relations(false),
            order: [guestOrder]
        });

        res.status(200).json({
            success: true,
            message: 'Episode updated successfully',
            episode: shapeEpisode(updated)
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
        const episode = await findOwnedEpisode(
            req, res, req.params.id, 'Not authorized to delete this episode'
        );
        if (!episode) return;

        // Also delete associated research (and guests): the database does this
        // automatically when the episode goes. Bookmarks are cleared first.
        await sequelize.transaction(async (t) => {
            await EpisodeBookmark.destroy({ where: { episodeId: episode.id }, transaction: t });
            await episode.destroy({ transaction: t });
        });

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

        const episode = await findOwnedEpisode(req, res, req.params.id);
        if (!episode) return;

        // Max 3 guests check
        const guestCount = await Guest.count({ where: { episodeId: episode.id } });
        if (guestCount >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 3 guests allowed per episode'
            });
        }

        // Generate guest summary based on provided info
        const generatedSummary = generateGuestSummary(name, profession, bio);

        await Guest.create({
            episodeId: episode.id,
            name,
            profession,
            url,
            bio,
            generatedSummary
        });

        res.status(200).json({
            success: true,
            message: 'Guest added successfully',
            guests: await loadGuests(episode.id)
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
        const episode = await findOwnedEpisode(req, res, req.params.id);
        if (!episode) return;

        const guest = isId(req.params.guestId)
            ? await Guest.findOne({ where: { id: req.params.guestId, episodeId: episode.id } })
            : null;
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

        await guest.save();

        res.status(200).json({
            success: true,
            message: 'Guest updated successfully',
            guests: await loadGuests(episode.id)
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
        const episode = await findOwnedEpisode(req, res, req.params.id);
        if (!episode) return;

        if (isId(req.params.guestId)) {
            await Guest.destroy({ where: { id: req.params.guestId, episodeId: episode.id } });
        }

        res.status(200).json({
            success: true,
            message: 'Guest removed successfully',
            guests: await loadGuests(episode.id)
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
        const episodes = await Episode.findAll({
            where: { userId: req.user.id, status: 'complete' },
            include: relations(false),
            order: [['createdAt', 'DESC'], guestOrder]
        });

        res.status(200).json({
            success: true,
            count: episodes.length,
            episodes: episodes.map(e => shapeEpisode(e))
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