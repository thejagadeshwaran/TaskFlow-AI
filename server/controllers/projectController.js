const Project = require("../models/Project");
const Team = require("../models/Team");
const Activity = require("../models/Activity");

const {
    emitToProject
} = require("../socket");


// ==========================================
// CREATE PROJECT
// ==========================================

const createProject = async (req, res) => {

    try {

        const {
            name,
            description,
            teamId,
            priority,
            startDate,
            deadline
        } = req.body;


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (!name || !teamId) {

            return res.status(400).json({
                success: false,
                message: "Project name and team are required"
            });

        }


        // ==========================================
        // FIND TEAM
        // ==========================================

        const team = await Team.findById(teamId);

        if (!team) {

            return res.status(404).json({
                success: false,
                message: "Team not found"
            });

        }


        // ==========================================
        // CHECK TEAM MEMBERSHIP
        // ==========================================

        const teamMember = team.members.find(
            (member) =>
                member.user.toString() ===
                req.user.userId.toString()
        );


        if (!teamMember) {

            return res.status(403).json({
                success: false,
                message: "You are not a member of this team"
            });

        }


        // ==========================================
        // ONLY MANAGER CAN CREATE PROJECT
        // ==========================================

        if (teamMember.role !== "manager") {

            return res.status(403).json({
                success: false,
                message: "Only team managers can create projects"
            });

        }


        // ==========================================
        // CREATE PROJECT
        // ==========================================

        const project = await Project.create({

            name,

            description,

            team: teamId,

            owner: req.user.userId,

            members: [
                req.user.userId
            ],

            priority:
                priority || "medium",

            startDate,

            deadline

        });


        console.log(
            "PROJECT CREATED:",
            project._id.toString()
        );


        // ==========================================
        // CREATE ACTIVITY
        // ==========================================

        const activity =
            await Activity.create({

                user:
                    req.user.userId,

                project:
                    project._id,

                action:
                    "created",

                description:
                    `Created project "${project.name}"`

            });


        console.log(
            "ACTIVITY CREATED:",
            activity._id.toString()
        );


        // ==========================================
        // POPULATE ACTIVITY
        // ==========================================

        const populatedActivity =
            await Activity.findById(
                activity._id
            )
                .populate(
                    "user",
                    "name email avatar"
                );


        // ==========================================
        // REAL-TIME ACTIVITY
        // ==========================================

        emitToProject(
            project._id.toString(),
            "activity_created",
            populatedActivity
        );


        console.log(
            "📡 REAL-TIME ACTIVITY SENT:",
            project._id.toString()
        );


        // ==========================================
        // RETURN POPULATED PROJECT
        // ==========================================

        const populatedProject =
            await Project.findById(
                project._id
            )
                .populate(
                    "owner",
                    "name email avatar"
                )
                .populate(
                    "team",
                    "name description"
                )
                .populate(
                    "members",
                    "name email avatar"
                );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Project created successfully",

            project:
                populatedProject

        });


    } catch (error) {

        console.error(
            "Create project error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// GET MY PROJECTS
// ==========================================

const getMyProjects = async (req, res) => {

    try {

        const projects =
            await Project.find({

                members:
                    req.user.userId

            })
                .populate(
                    "owner",
                    "name email avatar"
                )
                .populate(
                    "team",
                    "name description"
                )
                .populate(
                    "members",
                    "name email avatar"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            count:
                projects.length,

            projects

        });


    } catch (error) {

        console.error(
            "Get projects error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// GET SINGLE PROJECT
// ==========================================

const getProjectById = async (req, res) => {

    try {

        const project =
            await Project.findById(
                req.params.id
            )
                .populate(
                    "owner",
                    "name email avatar"
                )
                .populate(
                    "team",
                    "name description"
                )
                .populate(
                    "members",
                    "name email avatar"
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

                    member._id.toString() ===
                    req.user.userId.toString()

            );


        if (!isMember) {

            return res.status(403).json({

                success: false,

                message:
                    "You do not have access to this project"

            });

        }


        res.status(200).json({

            success: true,

            project

        });


    } catch (error) {

        console.error(
            "Get project error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// UPDATE PROJECT
// ==========================================

const updateProject = async (req, res) => {

    try {

        const project =
            await Project.findById(
                req.params.id
            );


        if (!project) {

            return res.status(404).json({

                success: false,

                message:
                    "Project not found"

            });

        }


        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(
                project.team
            );


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Team not found"

            });

        }


        // ==========================================
        // FIND LOGGED-IN USER
        // ==========================================

        const teamMember =
            team.members.find(

                (member) =>

                    member.user.toString() ===
                    req.user.userId.toString()

            );


        // ==========================================
        // ONLY MANAGER CAN UPDATE
        // ==========================================

        if (
            !teamMember ||
            teamMember.role !==
            "manager"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only team managers can update projects"

            });

        }


        // ==========================================
        // REQUEST DATA
        // ==========================================

        const {
            name,
            description,
            priority,
            status,
            startDate,
            deadline
        } = req.body;


        // ==========================================
        // UPDATE FIELDS
        // ==========================================

        if (name !== undefined) {

            project.name = name;

        }


        if (description !== undefined) {

            project.description =
                description;

        }


        if (priority !== undefined) {

            project.priority =
                priority;

        }


        if (status !== undefined) {

            project.status =
                status;

        }


        if (startDate !== undefined) {

            project.startDate =
                startDate;

        }


        if (deadline !== undefined) {

            project.deadline =
                deadline;

        }


        await project.save();


        console.log(
            "PROJECT UPDATED:",
            project._id.toString()
        );


        // ==========================================
        // CREATE UPDATE ACTIVITY
        // ==========================================

        const activity =
            await Activity.create({

                user:
                    req.user.userId,

                project:
                    project._id,

                action:
                    "updated",

                description:
                    `Updated project "${project.name}"`

            });


        console.log(
            "UPDATE ACTIVITY CREATED:",
            activity._id.toString()
        );


        // ==========================================
        // POPULATE ACTIVITY
        // ==========================================

        const populatedActivity =
            await Activity.findById(
                activity._id
            )
                .populate(
                    "user",
                    "name email avatar"
                );


        // ==========================================
        // REAL-TIME ACTIVITY
        // ==========================================

        emitToProject(
            project._id.toString(),
            "activity_created",
            populatedActivity
        );


        console.log(
            "📡 REAL-TIME ACTIVITY SENT:",
            project._id.toString()
        );


        // ==========================================
        // RETURN UPDATED PROJECT
        // ==========================================

        const updatedProject =
            await Project.findById(
                project._id
            )
                .populate(
                    "owner",
                    "name email avatar"
                )
                .populate(
                    "team",
                    "name description"
                )
                .populate(
                    "members",
                    "name email avatar"
                );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "Project updated successfully",

            project:
                updatedProject

        });


    } catch (error) {

        console.error(
            "Update project error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// DELETE PROJECT
// ==========================================

const deleteProject = async (req, res) => {

    try {

        const project =
            await Project.findById(
                req.params.id
            );


        if (!project) {

            return res.status(404).json({

                success: false,

                message:
                    "Project not found"

            });

        }


        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(
                project.team
            );


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Team not found"

            });

        }


        // ==========================================
        // FIND TEAM MEMBER
        // ==========================================

        const teamMember =
            team.members.find(

                (member) =>

                    member.user.toString() ===
                    req.user.userId.toString()

            );


        // ==========================================
        // ONLY MANAGER CAN DELETE
        // ==========================================

        if (
            !teamMember ||
            teamMember.role !==
            "manager"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only team managers can delete projects"

            });

        }


        // ==========================================
        // SAVE PROJECT INFORMATION
        // ==========================================

        const projectId =
            project._id.toString();

        const projectName =
            project.name;


        // ==========================================
        // CREATE DELETE ACTIVITY
        // ==========================================

        const activity =
            await Activity.create({

                user:
                    req.user.userId,

                project:
                    project._id,

                action:
                    "deleted",

                description:
                    `Deleted project "${projectName}"`

            });


        console.log(
            "DELETE ACTIVITY CREATED:",
            activity._id.toString()
        );


        // ==========================================
        // POPULATE ACTIVITY
        // ==========================================

        const populatedActivity =
            await Activity.findById(
                activity._id
            )
                .populate(
                    "user",
                    "name email avatar"
                );


        // ==========================================
        // REAL-TIME ACTIVITY
        // ==========================================

        emitToProject(
            projectId,
            "activity_created",
            populatedActivity
        );


        console.log(
            "📡 REAL-TIME ACTIVITY SENT:",
            projectId
        );


        // ==========================================
        // DELETE PROJECT
        // ==========================================

        await Project.findByIdAndDelete(
            project._id
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "Project deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete project error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error",

            error:
                error.message

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createProject,

    getMyProjects,

    getProjectById,

    updateProject,

    deleteProject

};