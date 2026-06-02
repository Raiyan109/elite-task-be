import { Types } from "mongoose";
import { IAdminInterface } from "../Admin/admin.interface";


export interface IBanner {
  banner_image?: string;
  banner_image_key?: string;
  banner_status: "active" | "in-active";
  banner_path?: string;
  banner_serial: number;
  banner_publisher_id?: Types.ObjectId | IAdminInterface;
  banner_updated_by?: Types.ObjectId | IAdminInterface;

  banner_position: string; //"home-top" | "home-center" | "popular-products" | "combo" | "hot-deal" | "weekday"; 
  //banner_position field will be treated as common category names (e.g. --> electronics, toys etc.)
};