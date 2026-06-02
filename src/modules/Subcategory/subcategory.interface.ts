import { Types } from "mongoose";
import { IAdminInterface } from "../Admin/admin.interface";


export interface ISubcategoryInterface {
  _id?: any;
  subcategory_name: string;
  subcategory_slug: string;
  subcategory_logo: string;
  subcategory_logo_key: string;
  subcategory_banner?: string[];
  subcategory_banner_key?: string[];
  subcategory_status: "active" | "in-active";
  subcategory_serial: number;
  subcategory_publisher_id?: Types.ObjectId | IAdminInterface;
  subcategory_updated_by?: Types.ObjectId | IAdminInterface;
  category_id: Types.ObjectId;
}

export const subcategorySearchableField = [
  "subcategory_name",
  "subcategory_slug",
  "subcategory_status",
];
