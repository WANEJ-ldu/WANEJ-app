const express = require('express');
const router = express.Router();

// Route test : retourner la vue test
router.get('/test', (req, res) => {
    res.render('test');
});

module.exports = router;
