import pool from '../config/mysql.config.js'

const createUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            _id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(30) NOT NULL,
            email VARCHAR(30) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            isVerified BOOLEAN DEFAULT FALSE,
            verificationToken VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            modifiedAt TIMESTAMP DEFAULT NULL
        );
    `
    await pool.query(query);
}

export default createUserTable