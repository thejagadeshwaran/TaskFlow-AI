const Activity = require("../models/Activity");
const Project = require("../models/Project");

const getProjectActivities = async (req, res) => {
    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        const isMember = project.members.some(
            member =>
                member.toString() ===
                req.user.userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const activities = await Activity.find({
            project: projectId
        })
            .populate("user", "name email avatar")
            .populate("task", "title")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: activities.length,
            activities
        });

    } catch (error) {

        console.error(
            "Get activities error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getProjectActivities
};