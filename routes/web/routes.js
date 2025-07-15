const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { verifyToken } = require('../../middleware/authenticate');

// Middleware pour vérifier l'authentification
const authenticateWeb = async (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const user = await verifyToken(token);
        if (!user) {
            res.clearCookie('authToken');
            return res.redirect('/login');
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur authentification web:', error);
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
        // Logique de connexion directe
        const { User, Session } = require('../../models');
        const { Op } = require('sequelize');
        const crypto = require('crypto');

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                ]
            }
        });

        if (!user) {
            return res.render('login', { error: 'Utilisateur non trouvé' });
        }

        const authToken = crypto.randomBytes(64).toString('hex');
        const createdAt = new Date();

        await Session.create({
            token: authToken,
            userId: user.id,
            createdAt,
        });
        
        await user.update({
            lastLoginAt: createdAt
        });

        // Stockage du token en cookie
        res.cookie('authToken', authToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.render('login', { error: 'Erreur de connexion' });
    }
});

router.get('/dashboard', authenticateWeb, async (req, res) => {
    try {
        const { Team } = require('../../models');
        
        // Récupérer l'utilisateur avec son équipe
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Team,
                as: 'team',
                include: [{
                    model: User,
                    as: 'members',
                    attributes: ['id', 'username', 'createdAt']
                }]
            }],
            attributes: ['id', 'username', 'points', 'createdAt', 'lastLoginAt']
        });
        
        res.render('dashboard', { user });
    } catch (error) {
        console.error('Erreur dashboard:', error);
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

router.get('/activities', authenticateWeb, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'points']
        });
        
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        
        res.render('activities', { user });
    } catch (error) {
        console.error('Erreur route activities:', error);
        res.status(500).send('Erreur serveur: ' + error.message);
    }
});

router.get('/activities/:id', authenticateWeb, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'points']
        });
        
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        
        res.render('activity-player', { user, activityId: req.params.id });
    } catch (error) {
        console.error('Erreur route activity-player:', error);
        res.status(500).send('Erreur serveur: ' + error.message);
    }
});

module.exports = router;
