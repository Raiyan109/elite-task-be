import { Types } from "mongoose";
import { IProject } from "../Project/project.interface";
import { IUserInterface } from "../User/user.interface";

export interface ITask {
    _id: string;
    task_title: string;
    task_description: string;
    project_id: Types.ObjectId | IProject;
    user_id: Types.ObjectId | IUserInterface;
    assignedMembers: Types.ObjectId[];
    task_dueDate: Date;
    task_priority: "high" | "medium" | "low";
    task_status: "todo" | "in_progress" | "completed";

    createdAt: Date;
    updatedAt: Date;
}