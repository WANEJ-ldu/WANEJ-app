const User = require('./User');
const Role = require('./Role');
const Session = require('./Session');
const Team = require('./Team');
const Activity = require('./Activity');
const UserActivity = require('./UserActivity');
const TeamActivity = require('./TeamActivity');
const GameSession = require('./GameSession');

// Associations User <-> Role
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

// Associations User <-> Session
Session.belongsTo(User, { foreignKey: 'userId' });

// Associations User <-> Team
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
Team.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Associations User <-> GameSession
User.belongsTo(GameSession, { foreignKey: 'gameSessionId', as: 'gameSession' });
GameSession.hasMany(User, { foreignKey: 'gameSessionId', as: 'participants' });
GameSession.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Associations User <-> Activity
User.hasMany(UserActivity, { foreignKey: 'userId' });
UserActivity.belongsTo(User, { foreignKey: 'userId' });
Activity.hasMany(UserActivity, { foreignKey: 'activityId' });
UserActivity.belongsTo(Activity, { foreignKey: 'activityId' });

// Associations Team <-> Activity
Team.hasMany(TeamActivity, { foreignKey: 'teamId' });
TeamActivity.belongsTo(Team, { foreignKey: 'teamId' });
Activity.hasMany(TeamActivity, { foreignKey: 'activityId' });
TeamActivity.belongsTo(Activity, { foreignKey: 'activityId' });
TeamActivity.belongsTo(User, { foreignKey: 'currentUserId', as: 'currentUser' });
TeamActivity.belongsTo(User, { foreignKey: 'completedBy', as: 'completedByUser' });

module.exports = {
    User,
    Role,
    Session,
    Team,
    Activity,
    UserActivity,
    TeamActivity,
    GameSession
};