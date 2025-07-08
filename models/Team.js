const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Team = sequelize.define('Team', {
    name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'Teams'
});

Team.associate = (models) => {
    Team.hasMany(models.User, {
        foreignKey: 'team',
        as: 'members'
    });
};

module.exports = Team;