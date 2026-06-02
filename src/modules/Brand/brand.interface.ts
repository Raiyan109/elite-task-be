import { Types } from 'mongoose';
import { IAdminInterface } from '../Admin/admin.interface';


export type IBrand = {
  _id?: any;
  brand_name?: string;
  brand_slug?: string;
  brand_logo?: string;
  brand_logo_key?: string;
  brand_status?: "active" | "in-active";
  brand_serial: number;
  category_id: Types.ObjectId;
  brand_publisher_id?: Types.ObjectId | IAdminInterface;
  brand_updated_by?: Types.ObjectId | IAdminInterface;
};