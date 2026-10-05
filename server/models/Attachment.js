const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        publicId: {
            type: String,
            required: true
        },

        fileType: {
            type: String
        },

        fileSize: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Attachment",
    attachmentSchema
);