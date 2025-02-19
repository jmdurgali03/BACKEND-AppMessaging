import pool from "../config/mysql.config.js";

class MessageRepository {
    async getAllMessagesFromChannel (channel_id) {
        try {
            const query = `
                SELECT 
                    messages._id,
                    messages.text,
                    messages.createdAt,
                    users.username AS author_username
                FROM messages
                JOIN users ON messages.author_id = users._id
                WHERE messages.channel_id = ?
                ORDER BY messages.createdAt ASC
            `;
            const [messages] = await pool.execute(query, [channel_id]);

            return messages;
        } catch (error) {
            console.error("Error getting messages:", error);
            throw new Error("Error getting messages.");
        }
    }

    async createMessage({ text, author_id, channel_id }) {
        try {
            const query = `INSERT INTO messages (text, author_id, channel_id) VALUES (?, ?, ?)`;
            const [result] = await pool.execute(query, [text, author_id, channel_id]);

            return {
                _id: result.insertId,
                text,
                author_id,
                channel_id,
                createdAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error creating message:", error);
            throw new Error("Error creating message.");
        }
    }
}

export default new MessageRepository()