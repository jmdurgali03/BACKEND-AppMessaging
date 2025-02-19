import mysql from 'mysql2/promise'
import ENVIROMENT from './enviroment.js'

const pool = mysql.createPool({
    host: ENVIROMENT.MYSQL.DB_HOST,
    user: ENVIROMENT.MYSQL.DB_USER,
    password: ENVIROMENT.MYSQL.DB_PASSWORD,
    database: ENVIROMENT.MYSQL.DB_DATABASE,
    port: ENVIROMENT.MYSQL.DB_PORT
});

(async () => {
    try {
        await pool.getConnection();
        console.log('✅ Connected to Clever Cloud MySQL');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
})();

export default pool;