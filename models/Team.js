const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    code: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    maxMembers: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'Teams'
});

Team.associate = (models) => {
    Team.hasMany(models.User, {
        foreignKey: 'teamId',
        as: 'members'
    });
    Team.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });
};

module.exports = Team;