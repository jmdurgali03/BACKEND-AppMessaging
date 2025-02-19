import express from "express";
import { createWorkspaceController, getWorkspacesController, inviteUserToWorkspaceController } from "../controllers/workspace.controller.js";
import WorkspaceRepository from "../repository/workspace.repository.js";
import verifyToken from "../middlewares/verifyToken.middle.js";

const workspaceRoutes = express.Router();

workspaceRoutes.post('/', verifyToken, createWorkspaceController);

workspaceRoutes.get('/', verifyToken, getWorkspacesController);

workspaceRoutes.get('/:workspace_id', verifyToken, async (req, res) => {
    const { workspace_id } = req.params;
    try {
        const workspace = await WorkspaceRepository.getWorkspaceById(workspace_id);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        return res.status(200).json({
            ok: true,
            message: 'Workspace retrieved successfully',
            data: { workspace }
        });
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

workspaceRoutes.post('/:workspace_id/invite', verifyToken, inviteUserToWorkspaceController)

export default workspaceRoutes;