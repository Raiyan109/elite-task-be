import { Types } from "mongoose";
import { IAdminInterface } from "../Admin/admin.interface";


export type IYTLink = {
  ytLink_link: string;
  ytLink_serial: number;
  ytLink_status: "active" | "in-active";
  ytLink_publisher_id?: Types.ObjectId | IAdminInterface;
  ytLink_updated_by?: Types.ObjectId | IAdminInterface;
  category_type?: string;
};