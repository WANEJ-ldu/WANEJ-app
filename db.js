// Core dependencies
const { Sequelize } = require('sequelize');
const path = require('path');

// Config
const config = require('./config');

// Configuration SQLite - Le fichier de base de données sera créé dans le dossier du projet
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', config.database),
    logging: config.sequelize_logging ? console.log : false
});

// DB Connection Test
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('DATABASE: Connection has been established successfully.');
    } catch (error) {
        console.error('DATABASE: Unable to connect to the database.');
    }
}

testConnection();

module.exports = sequelize;