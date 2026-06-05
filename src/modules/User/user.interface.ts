import { Types } from "mongoose";
import { IRole } from "../Role/role.interface";

export interface IUserInterface {
     _id?: Types.ObjectId;
    user_name: string;
    user_email: string;
    user_password: string;
    confirm_password?: string;

    roleId: Types.ObjectId | IRole;
    user_status?: "active" | "in-active";
}

export type TUserRole = "project_manager" | "admin" | "team_member";
export type TUserStatus = "active" | "in-active";

