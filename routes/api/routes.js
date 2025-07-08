// Core dependencies
const express = require('express');
const router = express.Router();
// Import routes
const accountRoutes = require('./account/account');
// Import config
const config = require('../../config');


router.use('/account', accountRoutes);

module.exports = router;