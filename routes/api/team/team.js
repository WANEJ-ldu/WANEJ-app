const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../../../middleware/authenticate');
const { User, Team } = require('../../../models');
const crypto = require('crypto');

// Créer une équipe
router.post('/create', authenticate, [
    body('name')
        .isLength({ min: 2, max: 50 }).withMessage('Le nom de l\'équipe doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-Z0-9\s\-_]+$/).withMessage('Le nom de l\'équipe ne peut contenir que des lettres, chiffres, espaces, tirets et underscores'),
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
        // Vérifier si l'utilisateur est déjà dans une équipe
        const user = await User.findByPk(req.user.id);
        if (user.teamId) {
            return res.status(400).json({ error: 'Vous êtes déjà membre d\'une équipe' });
        }

        // Générer un code unique pour l'équipe
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();

        // Créer l'équipe
        const team = await Team.create({
            name,
            description,
            code,
            createdBy: req.user.id
        });

        // Ajouter le créateur à l'équipe
        await user.update({ teamId: team.id });

        res.status(201).json({ 
            message: 'Équipe créée avec succès',
            team: {
                id: team.id,
                name: team.name,
                description: team.description,
                code: team.code
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ce nom d\'équipe est déjà utilisé' });
        }
        console.error('Erreur création équipe:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'équipe' });
    }
});

// Rejoindre une équipe
router.post('/join', authenticate, [
    body('code')
        .isLength({ min: 8, max: 8 }).withMessage('Le code d\'équipe doit contenir 8 caractères')
        .matches(/^[A-F0-9]{8}$/).withMessage('Code d\'équipe invalide')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;

    try {
        // Vérifier si l'utilisateur est déjà dans une équipe
        const user = await User.findByPk(req.user.id);
        if (user.teamId) {
            return res.status(400).json({ error: 'Vous êtes déjà membre d\'une équipe' });
        }

        // Trouver l'équipe par le code
        const team = await Team.findOne({ 
            where: { code, isActive: true },
            include: [{
                model: User,
                as: 'members',
                attributes: ['id', 'username']
            }]
        });

        if (!team) {
            return res.status(404).json({ error: 'Équipe non trouvée' });
        }

        // Vérifier si l'équipe n'est pas pleine
        if (team.members.length >= team.maxMembers) {
            return res.status(400).json({ error: 'L\'équipe est complète' });
        }

        // Ajouter l'utilisateur à l'équipe
        await user.update({ teamId: team.id });

        res.json({ 
            message: 'Vous avez rejoint l\'équipe avec succès',
            team: {
                id: team.id,
                name: team.name,
                description: team.description,
                members: team.members.length + 1
            }
        });
    } catch (error) {
        console.error('Erreur rejoindre équipe:', error);
        res.status(500).json({ error: 'Erreur lors de la jointure à l\'équipe' });
    }
});

// Obtenir les informations de l'équipe de l'utilisateur
router.get('/my-team', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Team,
                as: 'team',
                include: [{
                    model: User,
                    as: 'members',
                    attributes: ['id', 'username', 'createdAt']
                }]
            }]
        });

        if (!user.team) {
            return res.status(404).json({ error: 'Vous n\'êtes membre d\'aucune équipe' });
        }

        res.json({
            team: {
                id: user.team.id,
                name: user.team.name,
                description: user.team.description,
                code: user.team.code,
                members: user.team.members,
                isCreator: user.team.createdBy === user.id
            }
        });
    } catch (error) {
        console.error('Erreur récupération équipe:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'équipe' });
    }
});

// Quitter une équipe
router.post('/leave', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (!user.teamId) {
            return res.status(400).json({ error: 'Vous n\'êtes membre d\'aucune équipe' });
        }

        const team = await Team.findByPk(user.teamId);
        
        // Si l'utilisateur est le créateur, supprimer l'équipe
        if (team.createdBy === user.id) {
            await Team.update({ isActive: false }, { where: { id: team.id } });
            await User.update({ teamId: null }, { where: { teamId: team.id } });
            return res.json({ message: 'Équipe supprimée avec succès' });
        }

        // Sinon, juste retirer l'utilisateur
        await user.update({ teamId: null });
        res.json({ message: 'Vous avez quitté l\'équipe avec succès' });
    } catch (error) {
        console.error('Erreur quitter équipe:', error);
        res.status(500).json({ error: 'Erreur lors de la sortie de l\'équipe' });
    }
});

module.exports = router;