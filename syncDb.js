// Core dependencies
const readline = require('readline');
// Database
const sequelize = require('./db');
// Models
const { User, Role, Session, Team, TeamActivity } = require('./models/index');

async function initRoles() {
// !!! WARNING !!!
// !!! DO NOT EDIT THE ORDER OF THE ROLES !!!
// !!! DO NOT CHANGE THE PRIMARY KEYS ALREADY ASSIGNED TO A ROLE !!!
// !!! THIS CAN CAUSE CRITICAL SECURITY ISSUES !!!
// !!! AN UNAUTHORIZED USER COULD GAIN ADMIN ACCESS !!!
// !!! IF YOU NEED TO ADD A NEW ROLE, PLEASE ADD A NEW PRIMARY KEY AT THE END OF THE LIST, AFTER THE ADMINISTRATOR ROLE !!!
    const roles = await Role.findAll();
    if (roles.length === 0) {
        await Promise.all([
            Role.create({ id: 1, name: 'Guest' }),
            Role.create({ id: 5, name: 'Administrator' })
        ]);
        console.log('Default roles successfully created.');
    } else {
        console.log('The roles table is not empty, nothing to initialise.');
    }
}

async function askAction() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('What do you want to do with the database?\n' +
            '1. Synchronise the database (without deleting the data)\n' +
            '2. Synchronise the database and delete existing data\n' +
            '3. Modify the table structure without deleting data (Sequelize v6+)\n' +
            '4. Exit\n' +
            'Choice (1/2/3/4) : ',
            async (choice) => {
                rl.close();
                const actions = {
                    '1': { sync: true, force: false, alter: false, message: "Synchronise the database without deleting existing data?" },
                    '2': { sync: true, force: true, alter: false, message: "Synchronise the database and **DELETE** the existing data (Warning: this action is irreversible!)." },
                    '3': { sync: true, force: false, alter: true, message: "Modify the table structure without deleting existing data?" },
                    '4': { sync: false, force: false, alter: false, exit: true, message: "Leave the application?" }
                };

                const action = actions[choice.trim()];
                if (action) {
                    if (await confirmAction(action.message)) {
                        if (action.exit) {
                            console.log('Goodbye!');
                            process.exit(0);
                        }
                        resolve(action);
                    } else {
                        console.log("Action cancelled. Please try again.");
                        resolve(await askAction());
                    }
                } else {
                    console.log('Invalid choice. Goodbye!');
                    process.exit(1);
                }
            }
        );
    });
}

async function confirmAction(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${message} (y/N): `, (response) => {
            rl.close();
            resolve(response.trim().toLowerCase() === 'y' || response.trim().toLowerCase() === 'yes');
        });
    });
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = { sync: false, force: false, alter: false };

    for (const arg of args) {
        switch (arg) {
            case '-s':
            case '--sync':
                options.sync = true;
                break;
            case '-f':
            case '--force':
                options.force = true;
                break;
            case '-a':
            case '--alter':
                options.alter = true;
                break;
            default:
                console.log(`Unknown Option: ${arg}. Ignored.`);
        }
    }
    return options;
}

(async () => {
    let options = process.argv.length > 2? parseArgs() : await askAction();

    try {
        if (options.sync) {
            if (options.force) {
                console.log('** DELETING EXISTING DATA **');
                await sequelize.sync({ force: true });
            } else if (options.alter) {
                console.log('** MODIFYING THE TABLE STRUCTURE **');
                await sequelize.sync({ alter: true });
            } else {
                console.log('** SYNCHRONISATION WITHOUT DELETING DATA **');
                await sequelize.sync({ force: false });
            }
            console.log("Database synced!");

            await initRoles();
        }
    } catch (error) {
        console.error("Unable to sync the database:", error);
    } finally {
        await sequelize.close();
    }
})();