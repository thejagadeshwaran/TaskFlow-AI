const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");

const {
    createNotification
} = require("../services/notificationService");

const {
    emitToProject
} = require("../socket");

// ==========================================
// CREATE TASK
// ==========================================

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            projectId,
            assignedTo,
            priority,
            dueDate,
            tags
        } = req.body;

        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (!title || !projectId) {
            return res.status(400).json({
                success: false,
                message:
                    "Title and project are required"
            });
        }

        // ==========================================
        // FIND PROJECT
        // ==========================================

        const project =
            await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // ==========================================
        // CHECK PROJECT MEMBERSHIP
        // ==========================================

        const isMember =
            project.members.some(
                (member) =>
                    member.toString() ===
                    req.user.userId.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not a project member"
            });
        }

        // ==========================================
        // CHECK ASSIGNED USER
        // ==========================================

        if (assignedTo) {

            const isAssignedUserMember =
                project.members.some(
                    (member) =>
                        member.toString() ===
                        assignedTo.toString()
                );

            if (!isAssignedUserMember) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Assigned user is not a project member"
                });
            }
        }

        // ==========================================
        // CREATE TASK
        // ==========================================

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignedTo: assignedTo || null,
            createdBy: req.user.userId,
            priority: priority || "medium",
            dueDate,
            tags: tags || []
        });

        console.log(
            "TASK CREATED:",
            task._id.toString()
        );

        // ==========================================
        // CREATE ACTIVITY
        // ==========================================

        const activity =
            await Activity.create({
                user: req.user.userId,
                project: projectId,
                action: "created",
                description:
                    `Created task "${task.title}"`
            });

        console.log(
            "TASK ACTIVITY CREATED:",
            activity._id.toString()
        );

        // ==========================================
        // NOTIFY ASSIGNEE
        // ==========================================

        if (assignedTo) {
            await createNotification({
                recipient: assignedTo,
                sender: req.user.userId,
                type: "task_assigned",
                title: "New Task Assigned",
                message:
                    `You were assigned the task "${title}"`,
                task: task._id,
                project: projectId
            });
        }

        // ==========================================
        // POPULATE TASK
        // ==========================================

        const populatedTask =
            await Task.findById(task._id)
                .populate(
                    "assignedTo",
                    "name email avatar"
                )
                .populate(
                    "createdBy",
                    "name email"
                )
                .populate(
                    "project",
                    "name status"
                );

        // ==========================================
        // REAL-TIME TASK CREATED
        // ==========================================

        emitToProject(
            projectId,
            "task_created",
            populatedTask
        );

        console.log(
            "📡 REAL-TIME TASK CREATED:",
            task._id.toString()
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({
            success: true,
            message:
                "Task created successfully",
            task: populatedTask
        });

    } catch (error) {

        console.error(
            "Create task error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET PROJECT TASKS
// ==========================================

const getProjectTasks = async (req, res) => {
    try {

        const {
            projectId
        } = req.params;

        const {
            search = "",
            status,
            priority,
            assignedTo,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        // ==========================================
        // FIND PROJECT
        // ==========================================

        const project =
            await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });
        }

        // ==========================================
        // CHECK PROJECT MEMBERSHIP
        // ==========================================

        const isMember =
            project.members.some(
                (member) =>
                    member.toString() ===
                    req.user.userId.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this project"
            });
        }

        // ==========================================
        // BUILD QUERY
        // ==========================================

        const query = {
            project: projectId
        };

        if (search.trim()) {
            query.title = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        // ==========================================
        // PAGINATION
        // ==========================================

        const currentPage =
            Math.max(Number(page), 1);

        const perPage =
            Math.min(
                Math.max(
                    Number(limit),
                    1
                ),
                100
            );

        const skip =
            (currentPage - 1) *
            perPage;

        // ==========================================
        // SORTING
        // ==========================================

        const sortOrder =
            order === "asc"
                ? 1
                : -1;

        const sortObject = {
            [sortBy]: sortOrder
        };

        // ==========================================
        // GET TOTAL COUNT
        // ==========================================

        const totalTasks =
            await Task.countDocuments(
                query
            );

        // ==========================================
        // GET TASKS
        // ==========================================

        const tasks =
            await Task.find(query)
                .populate(
                    "assignedTo",
                    "name email avatar"
                )
                .populate(
                    "createdBy",
                    "name email"
                )
                .sort(sortObject)
                .skip(skip)
                .limit(perPage);

        // ==========================================
        // TOTAL PAGES
        // ==========================================

        const totalPages =
            Math.ceil(
                totalTasks /
                perPage
            );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,

            pagination: {
                currentPage,
                perPage,
                totalTasks,
                totalPages,
                hasNextPage:
                    currentPage <
                    totalPages,
                hasPreviousPage:
                    currentPage > 1
            },

            tasks
        });

    } catch (error) {

        console.error(
            "Get project tasks error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE TASK
// ==========================================

const getTaskById = async (req, res) => {
    try {

        const task =
            await Task.findById(
                req.params.id
            )
                .populate(
                    "assignedTo",
                    "name email avatar"
                )
                .populate(
                    "createdBy",
                    "name email"
                )
                .populate(
                    "project",
                    "name status"
                );

        if (!task) {
            return res.status(404).json({
                success: false,
                message:
                    "Task not found"
            });
        }

        const project =
            await Project.findById(
                task.project._id
            );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });
        }

        // ==========================================
        // CHECK PROJECT MEMBERSHIP
        // ==========================================

        const isMember =
            project.members.some(
                (member) =>
                    member.toString() ===
                    req.user.userId.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this task"
            });
        }

        res.status(200).json({
            success: true,
            task
        });

    } catch (error) {

        console.error(
            "Get task error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE TASK
// ==========================================

const updateTask = async (req, res) => {
    try {

        const task =
            await Task.findById(
                req.params.id
            );

        if (!task) {
            return res.status(404).json({
                success: false,
                message:
                    "Task not found"
            });
        }

        const project =
            await Project.findById(
                task.project
            );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });
        }

        // ==========================================
        // CHECK PROJECT MEMBERSHIP
        // ==========================================

        const isMember =
            project.members.some(
                (member) =>
                    member.toString() ===
                    req.user.userId.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this task"
            });
        }

        const {
            title,
            description,
            assignedTo,
            status,
            priority,
            dueDate,
            tags
        } = req.body;

        // ==========================================
        // CHECK ASSIGNED USER
        // ==========================================

        if (assignedTo) {

            const isAssignedUserMember =
                project.members.some(
                    (member) =>
                        member.toString() ===
                        assignedTo.toString()
                );

            if (!isAssignedUserMember) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Assigned user is not a project member"
                });
            }

            task.assignedTo =
                assignedTo;
        }

        // ==========================================
        // UPDATE TASK FIELDS
        // ==========================================

        if (title !== undefined) {
            task.title = title;
        }

        if (description !== undefined) {
            task.description =
                description;
        }

        if (status !== undefined) {
            task.status = status;
        }

        if (priority !== undefined) {
            task.priority = priority;
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate;
        }

        if (tags !== undefined) {
            task.tags = tags;
        }

        await task.save();

        console.log(
            "TASK UPDATED:",
            task._id.toString()
        );

        // ==========================================
        // CREATE UPDATE ACTIVITY
        // ==========================================

        const activity =
            await Activity.create({
                user: req.user.userId,
                project: project._id,
                action: "updated",
                description:
                    `Updated task "${task.title}"`
            });

        console.log(
            "TASK UPDATE ACTIVITY CREATED:",
            activity._id.toString()
        );

        // ==========================================
        // GET UPDATED TASK
        // ==========================================

        const updatedTask =
            await Task.findById(task._id)
                .populate(
                    "assignedTo",
                    "name email avatar"
                )
                .populate(
                    "createdBy",
                    "name email"
                )
                .populate(
                    "project",
                    "name status"
                );

        // ==========================================
        // REAL-TIME TASK UPDATED
        // ==========================================

        emitToProject(
            project._id.toString(),
            "task_updated",
            updatedTask
        );

        console.log(
            "📡 REAL-TIME TASK UPDATED:",
            task._id.toString()
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            message:
                "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {

        console.error(
            "Update task error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// DELETE TASK
// ==========================================

const deleteTask = async (req, res) => {
    try {

        const task =
            await Task.findById(
                req.params.id
            );

        if (!task) {
            return res.status(404).json({
                success: false,
                message:
                    "Task not found"
            });
        }

        const project =
            await Project.findById(
                task.project
            );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });
        }

        // ==========================================
        // CHECK PROJECT MEMBERSHIP
        // ==========================================

        const isMember =
            project.members.some(
                (member) =>
                    member.toString() ===
                    req.user.userId.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this task"
            });
        }

        // ==========================================
        // SAVE TASK DATA BEFORE DELETE
        // ==========================================

        const deletedTaskId =
            task._id.toString();

        const deletedProjectId =
            project._id.toString();

        const deletedTaskTitle =
            task.title;

        // ==========================================
        // CREATE DELETE ACTIVITY
        // ==========================================

        const activity =
            await Activity.create({
                user: req.user.userId,
                project: project._id,
                action: "deleted",
                description:
                    `Deleted task "${task.title}"`
            });

        console.log(
            "TASK DELETE ACTIVITY CREATED:",
            activity._id.toString()
        );

        // ==========================================
        // DELETE TASK
        // ==========================================

        await Task.findByIdAndDelete(
            task._id
        );

        console.log(
            "TASK DELETED:",
            deletedTaskId
        );

        // ==========================================
        // REAL-TIME TASK DELETED
        // ==========================================

        emitToProject(
            deletedProjectId,
            "task_deleted",
            {
                taskId: deletedTaskId,
                projectId: deletedProjectId,
                title: deletedTaskTitle
            }
        );

        console.log(
            "📡 REAL-TIME TASK DELETED:",
            deletedTaskId
        );

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            message:
                "Task deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createTask,
    getProjectTasks,
    getTaskById,
    updateTask,
    deleteTask
};