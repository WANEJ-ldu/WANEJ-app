const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const TeamActivity = sequelize.define('TeamActivity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Teams',
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
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Verrouillée si quelqu'un de l'équipe l'a commencée
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Terminée par l'équipe
    },
    currentUserId: {
        type: DataTypes.INTEGER,
        allowNull: true, // ID de l'utilisateur qui fait actuellement l'activité
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    completedBy: {
        type: DataTypes.INTEGER,
        allowNull: true, // ID de l'utilisateur qui a terminé l'activité
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'team_activities',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['teamId', 'activityId']
        }
    ]
});

TeamActivity.associate = (models) => {
    TeamActivity.belongsTo(models.Team, {
        foreignKey: 'teamId',
        as: 'team'
    });
    TeamActivity.belongsTo(models.Activity, {
        foreignKey: 'activityId',
        as: 'activity'
    });
    TeamActivity.belongsTo(models.User, {
        foreignKey: 'currentUserId',
        as: 'currentUser'
    });
    TeamActivity.belongsTo(models.User, {
        foreignKey: 'completedBy',
        as: 'completedByUser'
    });
};

module.exports = TeamActivity;
