// Core dependencies
const express = require('express');
const router = express.Router();
// Import routes
const accountRoutes = require('./account/account');
const teamRoutes = require('./team/team');
const activityRoutes = require('./activities/activities');
const gameSessionRoutes = require('./game-session/game-session');
const leaderboardRoutes = require('./leaderboard/leaderboard');
// Import config
const config = require('../../config');


router.use('/account', accountRoutes);
router.use('/team', teamRoutes);
router.use('/activities', activityRoutes);
router.use('/game-session', gameSessionRoutes);
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;