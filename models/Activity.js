const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Activity = sequelize.define('Activity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false // ex: 'souris', 'internet', 'security', 'html', 'quiz'
    },
    difficulty: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
    },
    content: {
        type: DataTypes.JSON,
        allowNull: false // Structure JSON des questions/leçons
    },
    maxPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Total des points possibles
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Pour l'ordre d'affichage
    }
}, {
    tableName: 'activities',
    timestamps: true
});

module.exports = Activity;
