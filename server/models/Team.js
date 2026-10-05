const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        role: {
            type: String,
            enum: ["manager", "member"],
            default: "member"
        }
    },
    {
        _id: false
    }
);

const teamSchema = new mongoose.Schema(
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
            maxlength: 500
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [teamMemberSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Team", teamSchema);