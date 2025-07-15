const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserActivity = sequelize.define('UserActivity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'activities',
            key: 'id'
        }
    },
    currentStep: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Index de l'étape actuelle
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    attempts: {
        type: DataTypes.JSON,
        defaultValue: [] // Historique des tentatives
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'user_activities',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'activityId']
        }
    ]
});

module.exports = UserActivity;
