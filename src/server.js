import express from "express";
import cors from "cors";

import ENVIROMENT from "./config/enviroment.js";

import userRoutes from "./routes/user.route.js";
import workspaceRoutes from "./routes/workspace.route.js";
import channelRoutes from "./routes/channel.route.js";
import messageRoutes from "./routes/message.route.js";

import createUserTable from "./models/User.model.js";
import createWorkspaceTable from "./models/Workspace.model.js";
import createChannelTable from "./models/Channel.model.js";
import messageModel from "./models/Messages.model.js";
import createWorkspaceMembersTable from "./models/workspace_members.model.js";

const app = express();

const PORT = ENVIROMENT.PORT;

app.use(
    cors({
        origin: ENVIROMENT.URL_FRONTEND || "http://localhost:5173",
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE"]
    })
);

app.use(express.json());

// => Routes
app.use("/users", userRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

const initializeDatabase = async () => {
    try {
        await createUserTable()
        await createWorkspaceTable()

        await createChannelTable()
        messageModel.createMessageTable()
        await createWorkspaceMembersTable()

        console.log("✅ Tables created and verified correctly");
    } catch (error) {
        console.error("❌ Error creating tables:", error);
    }
};
initializeDatabase();


app.listen(PORT, () => {      
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
