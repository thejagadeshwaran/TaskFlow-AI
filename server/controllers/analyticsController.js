const Task = require("../models/Task");
const Project = require("../models/Project");

// GET PROJECT ANALYTICS (multiple countDocuments)
const getProjectAnalytics = async (req, res) => {
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
            (member) =>
                member.toString() ===
                req.user.userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a project member"
            });
        }

        const totalTasks = await Task.countDocuments({
            project: projectId
        });

        const completedTasks = await Task.countDocuments({
            project: projectId,
            status: "completed"
        });

        const pendingTasks = await Task.countDocuments({
            project: projectId,
            status: "todo"
        });

        const inProgressTasks = await Task.countDocuments({
            project: projectId,
            status: "in_progress"
        });

        const reviewTasks = await Task.countDocuments({
            project: projectId,
            status: "review"
        });

        const overdueTasks = await Task.countDocuments({
            project: projectId,
            dueDate: { $lt: new Date() },
            status: { $ne: "completed" }
        });

        const completionPercentage =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

        res.json({
            success: true,
            analytics: {
                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                reviewTasks,
                overdueTasks,
                completionPercentage
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get project analytics"
        });
    }
};

// GET TASK STATISTICS (by status)
const getTaskStatistics = async (req, res) => {
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
            (member) =>
                member.toString() ===
                req.user.userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a project member"
            });
        }

        const statistics = await Task.aggregate([
            {
                $match: {
                    project: project._id
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            statistics
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get task statistics"
        });
    }
};

// GET PRIORITY STATISTICS (by priority)
const getPriorityStatistics = async (req, res) => {
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
            (member) =>
                member.toString() ===
                req.user.userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a project member"
            });
        }

        const statistics = await Task.aggregate([
            {
                $match: {
                    project: project._id
                }
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        res.json({
            success: true,
            statistics
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get priority statistics"
        });
    }
};

module.exports = {
    getProjectAnalytics,
    getTaskStatistics,
    getPriorityStatistics
};