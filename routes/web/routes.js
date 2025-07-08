const express = require('express');
const router = express.Router();

// Route principale
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

module.exports = router;
