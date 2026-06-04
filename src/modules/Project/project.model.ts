import mongoose, { Schema } from "mongoose";
import { IProject } from "./project.interface";

const ProjectSchema = new mongoose.Schema<IProject>(
    {
        project_name: {
            type: String,
            required: true,
            trim: true,
        },

        project_description: {
            type: String,
            default: "",
        },

        project_deadline: {
            type: Date,
            required: true,
        },

        project_status: {
            type: String,
            enum: ["active", "completed", "on_hold"],
            default: "active",
            required: true,
        },

        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const ProjectModel = mongoose.model<IProject>(
    "projects",
    ProjectSchema
);