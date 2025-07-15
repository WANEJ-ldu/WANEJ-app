// Core dependencies
const express = require('express');
const router = express.Router();
// Import routes
const accountRoutes = require('./account/account');
const teamRoutes = require('./team/team');
// Import config
const config = require('../../config');


router.use('/account', accountRoutes);
router.use('/team', teamRoutes);

module.exports = router;