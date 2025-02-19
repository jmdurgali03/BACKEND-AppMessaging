import pool from "../config/mysql.config.js";
import MessageRepository from "../repository/message.repository.js";

export const createMessage = async (req, res) => {
    try {
        const { author_id, channel_id, text } = req.body;

        if (!author_id || !channel_id || !text) {
            return res.json({
                ok: false,
                status: 400,
                message: 'All fields are required.'
            })
        }

        const messageId = await MessageRepository.createMessage({ text, author_id, channel_id });

        const [newMessage] = await pool.query(`
            SELECT
                messages._id, 
                messages.text, 
                messages.createdAt, 
                users.name AS author,
            FROM messages
            JOIN users ON messages.author_id = users._id
            WHERE messages._id = ?
        `, [messageId]);

        if (!newMessage) {
            return res.json({
                ok: false,
                status: 404,
                message: 'Message not found'
            })
        }

        return res.status(201).json({
            ok: true,
            status: 201,
            message: 'Message created successfully',
            data: newMessage[0]
        })
    } 
    
    catch (error) {
        console.log('Error creating message: ',error);
        return res.json({
            ok: false,
            status: 500,
            message: 'Internal server error'
        })
    }
}

export const getMessagesByChannelId = async (req, res) => {
    try {
        const { channel_id } = req.params;

        const [messages] = await pool.query(`
            SELECT
                messages._id, 
                messages.text, 
                messages.createdAt, 
                users.username AS author
            FROM messages
            JOIN users ON messages.author_id = users._id
            WHERE messages.channel_id = ?
            ORDER BY messages.createdAt ASC
        `, [channel_id]);

        if (!messages) {
            return res.json({
                ok: false,
                status: 404,
                message: 'Messages not found'
            })
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Messages retrieved successfully',
            data: {
                messages
            }
        })
    } 
    
    catch (error) {
        console.log('Error getting messages: ',error);
        return res.json({
            ok: false,
            status: 500,
            message: 'Internal server error'
        })    
    }
}