import WorkspaceRepository from "../repository/workspace.repository.js";
import ChannelRepository from "../repository/channel.repository.js";

const handleErrorResponse = (res, error) => {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    return res.status(status).json({
        ok: false,
        message,
        status
    });
}

export const createWorkspaceController = async (req, res) => {
    try {
        const { name, img, channels } = req.body;
        const { id } = req.user;

        if (!name || !id) {
            return res.json({
                ok: false,
                status: 400,
                message: 'All fields are required.',
            })
        }

        const existingWorkspace = await WorkspaceRepository.getWorkspaceByNameAndOwner(name, id);
        if (existingWorkspace) {
            return res.json({
                ok: false,
                status: 400,
                message: 'Workspace already exists',
            })
        }

        const new_workspace = await WorkspaceRepository.createWorkspace({
            name,
            owner: id,
        });

        const channelName = channels[0]?.name || 'General';

        const new_channel = await ChannelRepository.createChannel({
            name: channelName,
            workspace_id: new_workspace._id,
        });

        console.log("Nuevo canal creado:", new_channel);

        return res.status(201).json({
            ok: true,
            message: 'Workspace and channel created successfully',
            status: 201,
            data: {
                new_workspace,
                new_channel,
            },
        });
    } catch (error) {
        console.error("Error en createWorkspaceController:", error);
        handleErrorResponse(res, error);
    }
};

export const getWorkspacesController = async (req, res) => {
    try {
        const { id } = req.user;
        const workspaces = await WorkspaceRepository.getAllWorkspacesByMemberId(id);

        for (let workspace of workspaces) {
            const channels = await ChannelRepository.getAllChannelsByWorkspaceId(workspace._id);
            workspace.channels = channels; 
        }

        return res.status(200).json({
            status: 200,
            ok: true,
            message: 'Workspaces retrieved successfully',
            data: {
                workspaces,
            },
        });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

export const inviteUserToWorkspaceController = async (req, res) => {
    const { workspace_id } = req.params;
    const { email } = req.body;

    const [workspace] = await pool.query('SELECT * FROM workspaces WHERE _id = ? AND owner = ?', [workspace_id, req.user.id]);

    if (!workspace) {
        return res.status(403).json({
            ok: false,
            message: 'You are not the owner of this workspace',
            status: 404,
        });
    }

    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
        return res.status(404).json({
            ok: false,
            message: 'User not found',
            status: 404,
        });
    }

    const userId = user[0]._id;

    const [existingMember] = await pool.query('SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?', [workspace_id, userId]);

    if (existingMember.length > 0) {
        return res.status(400).json({
            ok: false,
            message: 'User is already a member of this workspace',
            status: 400,
        })
    }

    await pool.query('INSERT INTO workspace_members (workspace_id, user_id) VALUES (?, ?)', [workspace_id, userId]);

    return res.status(200).json({
        ok: true,
        message: 'User invited to workspace successfully',
        status: 200,
    });
};