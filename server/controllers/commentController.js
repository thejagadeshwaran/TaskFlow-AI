const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");

const {
    createNotification
} = require("../services/notificationService");

const {
    emitToProject
} = require("../socket");


// =========================
// CREATE COMMENT
// =========================

const createComment = async (req, res) => {

    try {

        const { content } = req.body;
        const { taskId } = req.params;


        // =========================
        // VALIDATE CONTENT
        // =========================

        if (!content || !content.trim()) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }


        // =========================
        // FIND TASK
        // =========================

        const task = await Task.findById(taskId);

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }


        // =========================
        // FIND PROJECT
        // =========================

        const project = await Project.findById(
            task.project
        );

        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found"
            });

        }


        // =========================
        // CHECK PROJECT MEMBERSHIP
        // =========================

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


        // =========================
        // CREATE COMMENT
        // =========================

        const comment = await Comment.create({

            task: taskId,

            user: req.user.userId,

            content: content.trim()

        });


        // =========================
        // CREATE ACTIVITY
        // =========================

        const activity = await Activity.create({

            project: project._id,

            user: req.user.userId,

            action: "commented",

            description:
                `Comment added to task "${task.title}"`

        });


        // =========================
        // POPULATE ACTIVITY
        // =========================

        const populatedActivity =
            await Activity.findById(
                activity._id
            )
                .populate(
                    "user",
                    "name email avatar"
                );


        // =========================
        // REAL-TIME ACTIVITY EVENT
        // =========================

        emitToProject(
            project._id.toString(),
            "activity_created",
            populatedActivity
        );


        console.log(
            "📡 REAL-TIME ACTIVITY SENT:",
            project._id.toString()
        );


        // =========================
        // NOTIFY ASSIGNEE
        // =========================

        if (
            task.assignedTo &&
            task.assignedTo.toString() !==
            req.user.userId.toString()
        ) {

            await createNotification({

                recipient: task.assignedTo,

                sender: req.user.userId,

                type: "comment",

                title: "New Comment",

                message:
                    `Someone commented on "${task.title}"`,

                task: task._id,

                project: project._id

            });

        }


        // =========================
        // POPULATE COMMENT
        // =========================

        const populatedComment =
            await Comment.findById(
                comment._id
            )
                .populate(
                    "user",
                    "name email avatar"
                )
                .populate(
                    "task",
                    "title project"
                );


        // =========================
        // REAL-TIME COMMENT EVENT
        // =========================

        emitToProject(
            project._id.toString(),
            "comment_created",
            populatedComment
        );


        console.log(
            "💬 REAL-TIME COMMENT SENT:",
            project._id.toString()
        );


        // =========================
        // RESPONSE
        // =========================

        res.status(201).json({

            success: true,

            message:
                "Comment added successfully",

            comment: populatedComment

        });


    } catch (error) {

        console.error(
            "Create comment error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};


// =========================
// GET COMMENTS
// =========================

const getTaskComments = async (req, res) => {

    try {

        const { taskId } = req.params;


        // =========================
        // FIND TASK
        // =========================

        const task = await Task.findById(
            taskId
        );

        if (!task) {

            return res.status(404).json({

                success: false,

                message: "Task not found"

            });

        }


        // =========================
        // FIND PROJECT
        // =========================

        const project = await Project.findById(
            task.project
        );

        if (!project) {

            return res.status(404).json({

                success: false,

                message: "Project not found"

            });

        }


        // =========================
        // CHECK MEMBERSHIP
        // =========================

        const isMember = project.members.some(

            (member) =>

                member.toString() ===
                req.user.userId.toString()

        );


        if (!isMember) {

            return res.status(403).json({

                success: false,

                message: "Access denied"

            });

        }


        // =========================
        // GET COMMENTS
        // =========================

        const comments = await Comment.find({

            task: taskId

        })
            .populate(
                "user",
                "name email avatar"
            )
            .sort({
                createdAt: 1
            });


        // =========================
        // RESPONSE
        // =========================

        res.status(200).json({

            success: true,

            count: comments.length,

            comments

        });


    } catch (error) {

        console.error(
            "Get comments error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};


module.exports = {

    createComment,

    getTaskComments

};