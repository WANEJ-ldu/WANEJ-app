const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../../../middleware/authenticate');
const { User, GameSession } = require('../../../models');
const { Op } = require('sequelize');

// Rejoindre une session avec un code
router.post('/join', authenticate, [
    body('code').isString().isLength({ min: 1 }).withMessage('Le code de session est requis')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;

    try {
        // Vérifier si la session existe et est active
        const gameSession = await GameSession.findOne({
            where: { 
                code: code,
                isActive: true
            }
        });

        if (!gameSession) {
            return res.status(404).json({ error: 'Session non trouvée ou inactive' });
        }

        // Vérifier si la session n'est pas expirée
        const now = new Date();
        if (gameSession.endDate && gameSession.endDate < now) {
            return res.status(400).json({ error: 'Cette session a expiré' });
        }

        // Vérifier si la session n'a pas encore commencé
        if (gameSession.startDate && gameSession.startDate > now) {
            return res.status(400).json({ error: 'Cette session n\'a pas encore commencé' });
        }

        // Vérifier le nombre maximum de participants
        if (gameSession.maxParticipants) {
            const participantCount = await User.count({
                where: { gameSessionId: gameSession.id }
            });
            
            if (participantCount >= gameSession.maxParticipants) {
                return res.status(400).json({ error: 'Cette session a atteint le nombre maximum de participants' });
            }
        }

        // Mettre à jour l'utilisateur avec la session
        await User.update(
            { gameSessionId: gameSession.id },
            { where: { id: req.user.id } }
        );

        // Récupérer les informations de la session
        const sessionInfo = {
            id: gameSession.id,
            code: gameSession.code,
            name: gameSession.name,
            description: gameSession.description,
            startDate: gameSession.startDate,
            endDate: gameSession.endDate
        };

        res.json({ 
            message: 'Session rejointe avec succès', 
            gameSession: sessionInfo 
        });
    } catch (error) {
        console.error('Erreur lors de la jointure de session:', error);
        res.status(500).json({ error: 'Erreur lors de la jointure de session' });
    }
});

// Obtenir la session actuelle de l'utilisateur
router.get('/current', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: GameSession,
                as: 'gameSession',
                attributes: ['id', 'code', 'name', 'description', 'startDate', 'endDate', 'isActive']
            }]
        });

        if (!user.gameSession) {
            return res.status(404).json({ error: 'Aucune session active' });
        }

        res.json({ gameSession: user.gameSession });
    } catch (error) {
        console.error('Erreur récupération session:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la session' });
    }
});

// Quitter la session actuelle
router.post('/leave', authenticate, async (req, res) => {
    try {
        await User.update(
            { gameSessionId: null },
            { where: { id: req.user.id } }
        );

        res.json({ message: 'Session quittée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la sortie de session:', error);
        res.status(500).json({ error: 'Erreur lors de la sortie de session' });
    }
});

// Routes d'administration (pour les administrateurs)
// Créer une nouvelle session
router.post('/create', authenticate, [
    body('code').isString().isLength({ min: 1 }).withMessage('Le code de session est requis'),
    body('name').isString().isLength({ min: 1 }).withMessage('Le nom de session est requis'),
    body('description').optional().isString(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('maxParticipants').optional().isInt({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Vérifier les permissions (seulement les administrateurs)
    if (req.user.roleId !== 1) {
        return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    const { code, name, description, startDate, endDate, maxParticipants } = req.body;

    try {
        // Vérifier si le code existe déjà
        const existingSession = await GameSession.findOne({ where: { code } });
        if (existingSession) {
            return res.status(400).json({ error: 'Ce code de session existe déjà' });
        }

        const gameSession = await GameSession.create({
            code,
            name,
            description,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            maxParticipants,
            createdBy: req.user.id
        });

        res.status(201).json({ 
            message: 'Session créée avec succès', 
            gameSession: {
                id: gameSession.id,
                code: gameSession.code,
                name: gameSession.name,
                description: gameSession.description,
                startDate: gameSession.startDate,
                endDate: gameSession.endDate,
                maxParticipants: gameSession.maxParticipants,
                isActive: gameSession.isActive
            }
        });
    } catch (error) {
        console.error('Erreur création session:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la session' });
    }
});

// Lister toutes les sessions (administrateurs seulement)
router.get('/list', authenticate, async (req, res) => {
    // Vérifier les permissions
    if (req.user.roleId !== 1) {
        return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    try {
        const sessions = await GameSession.findAll({
            include: [{
                model: User,
                as: 'participants',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ sessions });
    } catch (error) {
        console.error('Erreur récupération sessions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des sessions' });
    }
});

module.exports = router;
