const express = require('express');

const premiumController = require('../controllers/premium');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/get-leaderboard', userAuthentication.isPremiumUser, premiumController.getLeaderboard);


module.exports = router;