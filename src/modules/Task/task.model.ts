import mongoose, { Schema } from "mongoose";
import { ITask } from "./task.interface";

const TaskSchema = new mongoose.Schema<ITask>(
    {
        task_title: {
            type: String,
            required: true,
            trim: true,
        },

        task_description: {
            type: String,
            required: true,
            trim: true,
        },

        project_id: {
            type: Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },

        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        assignedMembers: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
            },
        ],

        task_dueDate: {
            type: Date,
            required: true,
        },

        task_priority: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
            required: true,
        },

        task_status: {
            type: String,
            enum: ["todo", "in_progress", "completed"],
            default: "todo",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const TaskModel = mongoose.model<ITask>("tasks", TaskSchema);