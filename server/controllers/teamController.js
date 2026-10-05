const Team = require("../models/Team");
const User = require("../models/User");


// Create Team
const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Team name is required"
            });
        }

        const team = await Team.create({
            name,
            description,
            owner: req.user.userId,
            members: [
                {
                    user: req.user.userId,
                    role: "manager"
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            team
        });

    } catch (error) {
        console.error("Create team error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get My Teams
const getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            "members.user": req.user.userId
        })
            .populate("owner", "name email")
            .populate("members.user", "name email avatar");

        res.status(200).json({
            success: true,
            count: teams.length,
            teams
        });

    } catch (error) {
        console.error("Get teams error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Get Single Team
const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members.user", "name email avatar");

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        const isMember = team.members.some(
            member =>
                member.user._id.toString() === req.user.userId
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this team"
            });
        }

        res.status(200).json({
            success: true,
            team
        });

    } catch (error) {
        console.error("Get team error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Add Member
const addMember = async (req, res) => {
    try {
        const { email, role = "member" } = req.body;

        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check manager/owner
        const currentMember = team.members.find(
            member =>
                member.user.toString() === req.user.userId
        );

        if (!currentMember || currentMember.role !== "manager") {
            return res.status(403).json({
                success: false,
                message: "Only team managers can add members"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check duplicate member
        const alreadyMember = team.members.some(
            member =>
                member.user.toString() === user._id.toString()
        );

        if (alreadyMember) {
            return res.status(409).json({
                success: false,
                message: "User is already a team member"
            });
        }

        team.members.push({
            user: user._id,
            role
        });

        await team.save();

        res.status(200).json({
            success: true,
            message: "Member added successfully",
            team
        });

    } catch (error) {
        console.error("Add member error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// Remove Member
const removeMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        const currentMember = team.members.find(
            member =>
                member.user.toString() === req.user.userId
        );

        if (!currentMember || currentMember.role !== "manager") {
            return res.status(403).json({
                success: false,
                message: "Only team managers can remove members"
            });
        }

        const memberExists = team.members.some(
            member =>
                member.user.toString() === req.params.userId
        );

        if (!memberExists) {
            return res.status(404).json({
                success: false,
                message: "Member not found in team"
            });
        }

        team.members = team.members.filter(
            member =>
                member.user.toString() !== req.params.userId
        );

        await team.save();

        res.status(200).json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error) {
        console.error("Remove member error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createTeam,
    getMyTeams,
    getTeamById,
    addMember,
    removeMember
};