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
    team: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: 'teams',
            key: 'name'
        }
    },
}, {
    timestamps: true
});

module.exports = User;