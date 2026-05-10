const express = require('express');
const router = express.Router();
const {
    createEpisode,
    getEpisodes,
    getEpisode,
    updateEpisode,
    deleteEpisode,
    addGuest,
    editGuest,
    deleteGuest,
    getEpisodeHistory
} = require('../controllers/episodeController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Episode routes
router.get('/history', getEpisodeHistory);
router.route('/')
    .get(getEpisodes)
    .post(createEpisode);

router.route('/:id')
    .get(getEpisode)
    .put(updateEpisode)
    .delete(deleteEpisode);

// Guest routes
router.post('/:id/guests', addGuest);
router.put('/:id/guests/:guestId', editGuest);
router.delete('/:id/guests/:guestId', deleteGuest);

module.exports = router;