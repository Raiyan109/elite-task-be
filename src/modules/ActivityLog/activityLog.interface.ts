import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";

export interface IActivityLog {
  _id: string;
  user_id: Types.ObjectId | IUserInterface;
  action: string;

  entityType:
    | "project"
    | "task"
    | "member";

  entityId: Types.ObjectId;

  description: string;

  createdAt: Date;
}