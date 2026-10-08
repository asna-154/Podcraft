// Run once with:  node sync.js
// Creates the tables in your SQL Server database (existing tables are left alone).
require('dotenv').config();
const { sequelize } = require('./models');

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Tables created (or already existed).');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.parent) console.error('Details:', error.parent.message);
    } finally {
        await sequelize.close();
    }
})();
