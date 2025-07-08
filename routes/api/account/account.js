const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../../../middleware/authenticate');
const { User, Role } = require('../../../models');

// Register
router.post('/register', [
    body('username')
        .isLength({ min: 1 }).withMessage('Username must be at least 1 character long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must contain only letters, numbers, and underscores, and no spaces or special characters')
        .custom(value => value === value.toLowerCase()).withMessage('Username must be in lowercase'),
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    try {
        let existingUser = null;
        if (username) {
            existingUser = await User.findOne({ where: { username } });
        }

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: "Username already in use" });
            }
        }

        await User.create({
            username,
            roleId: 1
        });
        res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create account" });
    }
});

router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['username', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;