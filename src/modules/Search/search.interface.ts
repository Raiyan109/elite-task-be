import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";

export interface ISearch{
    user_id: Types.ObjectId | IUserInterface;
    searchTerm: string;
    searchedAt: Date;
}