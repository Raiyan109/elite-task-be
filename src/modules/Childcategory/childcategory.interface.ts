import { Types } from "mongoose";
import { IAdminInterface } from "../Admin/admin.interface";


export interface IChildcategoryInterface {
  _id?: any;
  childcategory_name: string;
  childcategory_slug: string;
  childcategory_logo: string;
  childcategory_logo_key: string;
  childcategory_banner?: string[];
  childcategory_banner_key?: string[];
  childcategory_status: "active" | "in-active";
  childcategory_serial: number;
  childcategory_publisher_id?: Types.ObjectId | IAdminInterface;
  childcategory_updated_by?: Types.ObjectId | IAdminInterface;
  category_id?: Types.ObjectId;
  subcategory_id: Types.ObjectId;
}

export const childcategorySearchableField = [
  "childcategory_name",
  "childcategory_slug",
  "childcategory_status",
];
