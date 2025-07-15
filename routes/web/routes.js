const express = require('express');
const router = express.Router();

// Middleware pour vérifier l'authentification
const authenticateWeb = async (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/account/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            req.user = user;
            next();
        } else {
            res.clearCookie('authToken');
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('authToken');
        res.redirect('/login');
    }
};

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.render('login', { error: 'Nom d\'utilisateur requis' });
    }

    try {
        // Utilisation de l'API interne pour la connexion
        const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/account/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (response.ok) {
            // Stockage du token en cookie
            res.cookie('authToken', data.authToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 heures
            });
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: data.error || 'Erreur de connexion' });
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.render('login', { error: 'Erreur de connexion' });
    }
});

router.get('/dashboard', authenticateWeb, async (req, res) => {
    try {
        const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/team/my-team`, {
            headers: {
                'Authorization': `Bearer ${req.cookies.authToken}`
            }
        });
        
        let team = null;
        if (response.ok) {
            const teamData = await response.json();
            team = teamData.team;
        }
        
        res.render('dashboard', { user: { ...req.user, team } });
    } catch (error) {
        res.render('dashboard', { user: req.user });
    }
});

router.get('/team/create', authenticateWeb, (req, res) => {
    res.render('team-create');
});

router.get('/team/join', authenticateWeb, (req, res) => {
    res.render('team-join');
});

router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/');
});

router.get('/register', (req, res) => {
    res.render('register');
});

module.exports = router;
