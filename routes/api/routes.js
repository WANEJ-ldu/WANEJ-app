// Core dependencies
const express = require('express');
const router = express.Router();
// Import routes
const accountRoutes = require('./account/account');
const teamRoutes = require('./team/team');
const activityRoutes = require('./activities/activities');
// Import config
const config = require('../../config');


router.use('/account', accountRoutes);
router.use('/team', teamRoutes);
router.use('/activities', activityRoutes);

module.exports = router;