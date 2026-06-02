import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";

export interface IProject {
    _id: string;
    project_name: string;
    project_description?: string;
    project_deadline: Date;
    project_status: "active" | "completed" | "on_hold";

    user_id: Types.ObjectId | IUserInterface;
    members?: Types.ObjectId[];

    createdAt?: Date;
    updatedAt?: Date;
}