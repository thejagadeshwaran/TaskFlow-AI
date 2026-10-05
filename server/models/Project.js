const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        status: {
            type: String,
            enum: [
                "planning",
                "in_progress",
                "testing",
                "completed"
            ],
            default: "planning"
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

        startDate: {
            type: Date
        },

        deadline: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);