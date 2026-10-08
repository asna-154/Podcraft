// config/db.js  (replaces the Mongoose version)
const sequelize = require('./database');
require('../models'); // loads every model and its relationships once, at startup

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`SQL Server Connected: ${process.env.DB_HOST}/${process.env.DB_NAME}`);

        await sequelize.sync();          // <-- add this
        console.log('Tables synced');
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

module.exports = connectDB;
