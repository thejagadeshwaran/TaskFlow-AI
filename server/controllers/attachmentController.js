const Attachment = require("../models/Attachment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");


// ==========================================
// UPLOAD ATTACHMENT
// ==========================================

const uploadAttachment = async (req, res) => {
    try {

        const { taskId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a file"
            });
        }

        // Find task
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Find project
        const project = await Project.findById(
            task.project
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Check project membership
        const isMember = project.members.some(
            member =>
                member.toString() ===
                req.user.userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a project member"
            });
        }

        // Upload to Cloudinary
        const result = await new Promise(
            (resolve, reject) => {

                const uploadStream =
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "taskflow-ai"
                        },
                        (error, result) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }

                        }
                    );

                uploadStream.end(
                    req.file.buffer
                );
            }
        );

        // Save metadata to MongoDB
        const attachment =
            await Attachment.create({

                task: taskId,

                uploadedBy:
                    req.user.userId,

                originalName:
                    req.file.originalname,

                fileUrl:
                    result.secure_url,

                publicId:
                    result.public_id,

                fileType:
                    req.file.mimetype,

                fileSize:
                    req.file.size
            });

        res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            attachment
        });

    } catch (error) {

        console.error(
            "Upload attachment error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "File upload failed"
        });
    }
};


// ==========================================
// GET ATTACHMENTS
// ==========================================

const getTaskAttachments = async (req, res) => {
    try {

        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        const project = await Project.findById(
            task.project
        );

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

        const attachments =
            await Attachment.find({
                task: taskId
            })
            .populate(
                "uploadedBy",
                "name email avatar"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: attachments.length,
            attachments
        });

    } catch (error) {

        console.error(
            "Get attachments error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    uploadAttachment,
    getTaskAttachments
};