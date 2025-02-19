import WorkspaceRepository from "../repository/workspace.repository.js";

const isMemberWsMiddle = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { workspace_id } = req.params;

        const workspace_selected = await WorkspaceRepository.findWorkspaceById(workspace_id);

        if (!workspace_selected) {
            return res.status(404).json({
                ok: false,
                message: "Workspace not found",
                status: 404,
            });
        }

        const isMember = await WorkspaceRepository.isUserMemberOfWorkspace(id, workspace_id);

        if (!isMember) {
            return res.status(403).json({
                ok: false,
                message: "You are not a member of this workspace",
                status: 403,
            });
        }

        req.workspace_selected = workspace_selected

        return next()
    }
    catch (error) {
        console.error(error);
        
        return res.status(500).json({
            ok: false,
            message: "Internal server error",
            status: 500,
        });
    }
};

export default isMemberWsMiddle;