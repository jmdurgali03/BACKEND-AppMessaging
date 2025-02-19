import express from "express";
import { createMessage, getMessagesByChannelId } from "../controllers/message.controller.js";

const messageRoutes = express.Router();

messageRoutes.post('/', createMessage);

messageRoutes.get('/:channel_id', getMessagesByChannelId);

export default messageRoutes;