const { User, Session } = require('../models/index');

// Function to verify the token and return the user if valid
const verifyToken = async (authToken) => {
    if (!authToken) {
        return null;
    }

    const session = await Session.findOne({ where: { token: authToken } });

    if (!session) {
        return null;
    }

    // Vérifier si la session est expirée (24 heures)
    const now = new Date();
    const sessionAge = now.getTime() - session.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

    if (sessionAge > maxAge) {
        // Supprimer la session expirée
        await session.destroy();
        return null;
    }

    const user = await User.findByPk(session.userId);
    if (!user) {
        return null;
    }

    return user;
};

// Middleware : Authenticate the user using the token from the request headers or cookies
const authenticate = async (req, res, next) => {
    let authToken = req.headers.authorization;
    
    // Si pas de token dans les headers, vérifier les cookies
    if (!authToken && req.cookies.authToken) {
        authToken = req.cookies.authToken;
    }
    
    // Nettoyer le token si format Bearer
    if (authToken && authToken.startsWith('Bearer ')) {
        authToken = authToken.slice(7);
    }

    try {
        const user = await verifyToken(authToken);
        if (!user) {
            return res.status(401).json({ error: `Unauthorized` });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: `Unauthorized` });
    }
};

// Middleware : Check if the user is authenticated, and return the user object, or false
const checkAuthentication = async (req, res, next) => {
    const authToken = req.headers.authorization;

    try {
        const user = await verifyToken(authToken);
        req.isAuthenticated = !!user;
        req.user = user;
    } catch (error) {
        req.isAuthenticated = false;
    }
    next();
};

module.exports = { authenticate, checkAuthentication, verifyToken };