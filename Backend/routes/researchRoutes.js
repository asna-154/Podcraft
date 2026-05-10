const express = require('express');
const router = express.Router();
const {
    generateResearch,
    getResearch,
    bookmarkTopic,
    rejectTopic,
    getBookmarkedTopics,
    refreshResearch
} = require('../controllers/researchController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Research routes
router.post('/generate/:episodeId', generateResearch);
router.post('/refresh/:episodeId', refreshResearch);
router.get('/:episodeId', getResearch);
router.get('/:episodeId/bookmarks', getBookmarkedTopics);
router.put('/:researchId/bookmark', bookmarkTopic);
router.put('/:researchId/reject', rejectTopic);

module.exports = router;
