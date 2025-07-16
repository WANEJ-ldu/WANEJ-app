const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authenticate');
const { User, GameSession } = require('../../../models');
const { Op } = require('sequelize');

// Obtenir le classement global
router.get('/global', authenticate, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'points', 'createdAt'],
            include: [{
                model: GameSession,
                as: 'gameSession',
                attributes: ['name', 'code'],
                required: false
            }],
            order: [['points', 'DESC'], ['createdAt', 'ASC']],
            limit: 50
        });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            points: user.points,
            sessionName: user.gameSession ? user.gameSession.name : 'Aucune session',
            sessionCode: user.gameSession ? user.gameSession.code : null,
            isCurrentUser: user.id === req.user.id
        }));

        res.json({ leaderboard });
    } catch (error) {
        console.error('Erreur récupération classement global:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du classement' });
    }
});

// Obtenir le classement par session
router.get('/session/:sessionId', authenticate, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Vérifier que la session existe
        const session = await GameSession.findByPk(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session non trouvée' });
        }

        const users = await User.findAll({
            attributes: ['id', 'username', 'points', 'createdAt'],
            where: {
                gameSessionId: sessionId
            },
            order: [['points', 'DESC'], ['createdAt', 'ASC']],
            limit: 50
        });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            points: user.points,
            isCurrentUser: user.id === req.user.id
        }));

        res.json({ 
            leaderboard,
            session: {
                id: session.id,
                name: session.name,
                code: session.code,
                description: session.description
            }
        });
    } catch (error) {
        console.error('Erreur récupération classement session:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du classement' });
    }
});

// Obtenir le classement de la session actuelle de l'utilisateur
router.get('/current-session', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: GameSession,
                as: 'gameSession',
                attributes: ['id', 'name', 'code', 'description']
            }]
        });

        if (!user.gameSession) {
            return res.status(404).json({ error: 'Aucune session active' });
        }

        const users = await User.findAll({
            attributes: ['id', 'username', 'points', 'createdAt'],
            where: {
                gameSessionId: user.gameSession.id
            },
            order: [['points', 'DESC'], ['createdAt', 'ASC']],
            limit: 50
        });

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            points: user.points,
            isCurrentUser: user.id === req.user.id
        }));

        res.json({ 
            leaderboard,
            session: user.gameSession
        });
    } catch (error) {
        console.error('Erreur récupération classement session actuelle:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du classement' });
    }
});

// Obtenir la liste des sessions avec leurs statistiques
router.get('/sessions', authenticate, async (req, res) => {
    try {
        const sessions = await GameSession.findAll({
            attributes: ['id', 'name', 'code', 'description', 'isActive', 'startDate', 'endDate'],
            include: [{
                model: User,
                as: 'participants',
                attributes: ['id', 'username', 'points'],
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        const sessionStats = sessions.map(session => ({
            id: session.id,
            name: session.name,
            code: session.code,
            description: session.description,
            isActive: session.isActive,
            startDate: session.startDate,
            endDate: session.endDate,
            participantCount: session.participants.length,
            topScore: session.participants.length > 0 ? Math.max(...session.participants.map(p => p.points)) : 0,
            avgScore: session.participants.length > 0 ? Math.round(session.participants.reduce((sum, p) => sum + p.points, 0) / session.participants.length) : 0,
            userParticipating: session.participants.some(p => p.id === req.user.id)
        }));

        res.json({ sessions: sessionStats });
    } catch (error) {
        console.error('Erreur récupération sessions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des sessions' });
    }
});

module.exports = router;
