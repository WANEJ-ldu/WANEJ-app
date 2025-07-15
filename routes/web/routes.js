const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    // Logique de connexion à implémenter
    const { username, password } = req.body;
    
    // Pour l'instant, redirection simple (à adapter selon votre logique)
    if (username && password) {
        res.redirect('/'); // ou vers une page de tableau de bord
    } else {
        res.render('login', { error: 'Identifiants invalides' });
    }
});

module.exports = router;
