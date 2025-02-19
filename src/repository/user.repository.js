import pool from "../config/mysql.config.js";

class UserRepository{
    async createUser  ({ username, email, password, verificationToken }) {
        try {
            const [rows] = await pool.execute(
                `INSERT INTO users (username, email, password, verificationToken) 
                VALUES (?, ?, ?, ?)`, 
                [ username || null, email || null, password || null, verificationToken]
            );
            return rows;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    async findUserByEmail (email){
        const query = `SELECT * FROM users WHERE email = ?`
        const [result] = await pool.execute(query, [email])
        return result[0] || null
    }
    async findById(id){
        const query = `SELECT * FROM users WHERE _id = ?`
        const [result] = await pool.execute(query, [id])
        return result[0] || null
    }

    async verifyUser( user_id ){
        const query = `
        UPDATE users
        SET isVerified = 1
        WHERE _id = ?
        `
        await pool.execute(query, [user_id])
    }
}

export default new UserRepository()