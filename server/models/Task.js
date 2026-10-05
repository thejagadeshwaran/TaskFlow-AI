const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "todo",
                "in_progress",
                "review",
                "completed"
            ],
            default: "todo"
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "critical"
            ],
            default: "medium"
        },

        dueDate: {
            type: Date
        },

        tags: [
            {
                type: String,
                trim: true
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);