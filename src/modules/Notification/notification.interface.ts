import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";

export interface INotification {
    user_id?: (Types.ObjectId | IUserInterface)[]; // array of users
    type: "All" | "Specific";
    notification_title: string;
    notification_description: string;
    notification_big_picture?: string;
}