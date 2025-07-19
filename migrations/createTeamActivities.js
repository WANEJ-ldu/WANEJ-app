const { DataTypes } = require('sequelize');
const sequelize = require('../db');

async function createTeamActivitiesTable() {
    try {
        await sequelize.getQueryInterface().createTable('team_activities', {
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
                },
                onDelete: 'CASCADE'
            },
            activityId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'activities',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            isLocked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            isCompleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            currentUserId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            },
            completedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            pointsEarned: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Ajouter l'index unique
        await sequelize.getQueryInterface().addIndex('team_activities', ['teamId', 'activityId'], {
            unique: true,
            name: 'team_activities_team_activity_unique'
        });

        console.log('Table team_activities créée avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de la table team_activities:', error);
    }
}

module.exports = { createTeamActivitiesTable };

// Exécuter si appelé directement
if (require.main === module) {
    createTeamActivitiesTable().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Erreur:', error);
        process.exit(1);
    });
}
