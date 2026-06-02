import { Types } from "mongoose";

export interface ICustomOrder {
  user_id?: Types.ObjectId;
  product_image?: string;
  product_image_key?: string;
  product_description: string;
  customOrder_status: string;
  customer_phone?: string;
  customer_address?: string;
}

export const customOrderSearchableField = [
  "user_id",
  "customOrder_status",
  "product_description",
];