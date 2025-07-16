const { User, GameSession } = require('../models');

const requireGameSession = async (req, res, next) => {
    try {
        // Récupérer l'utilisateur avec sa session
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: GameSession,
                as: 'gameSession',
                attributes: ['id', 'code', 'name', 'isActive', 'startDate', 'endDate']
            }]
        });

        if (!user.gameSession) {
            return res.status(403).json({ 
                error: 'Vous devez rejoindre une session pour accéder aux activités',
                requireSession: true
            });
        }

        // Vérifier si la session est active
        if (!user.gameSession.isActive) {
            return res.status(403).json({ 
                error: 'La session actuelle n\'est pas active',
                requireSession: true
            });
        }

        // Vérifier si la session n'est pas expirée
        const now = new Date();
        if (user.gameSession.endDate && user.gameSession.endDate < now) {
            return res.status(403).json({ 
                error: 'La session actuelle a expiré',
                requireSession: true
            });
        }

        // Vérifier si la session a commencé
        if (user.gameSession.startDate && user.gameSession.startDate > now) {
            return res.status(403).json({ 
                error: 'La session n\'a pas encore commencé',
                requireSession: true
            });
        }

        // Ajouter les informations de la session à la requête
        req.gameSession = user.gameSession;
        next();
    } catch (error) {
        console.error('Erreur middleware session:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de session' });
    }
};

module.exports = { requireGameSession };
