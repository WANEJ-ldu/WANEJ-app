const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Role = require('./Role');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    roleId: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        references: {
            model: Role,
            key: 'id'
        }
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Teams',
            key: 'id'
        }
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = User;