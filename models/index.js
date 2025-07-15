const User = require('./User');
const Role = require('./Role');
const Session = require('./Session');
const Team = require('./Team');

// Associations User <-> Role
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

// Associations User <-> Session
Session.belongsTo(User, { foreignKey: 'userId' });

// Associations User <-> Team
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
Team.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
    User,
    Role,
    Session,
    Team
};