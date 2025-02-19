import express from "express";
import verifyToken from "../middlewares/verifyToken.middle.js";
import isMemberWsMiddle from "../middlewares/isMember.middle.js";
import { createChannelController, getChannelsListController, getMessagesFromChannelController, sendMessageController } from "../controllers/channel.controller.js";

const channelRoutes = express.Router();

channelRoutes.use(verifyToken);

channelRoutes.post('/:workspace_id', isMemberWsMiddle, createChannelController);

channelRoutes.get('/:workspace_id', isMemberWsMiddle, getChannelsListController);

channelRoutes.get('/:workspace_id/:channel_id', isMemberWsMiddle, getMessagesFromChannelController);

channelRoutes.post('/:workspace_id/:channel_id/send-message', isMemberWsMiddle, sendMessageController);

export default channelRoutes;