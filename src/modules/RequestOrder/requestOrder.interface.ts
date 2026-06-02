import { Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface IRequestOrderDetail {
  product_id?: IProductInterface | Types.ObjectId;
  requested_quantity?: number;
}

export interface IRequestOrder {
    _id?: string;
    product_id: (IProductInterface | Types.ObjectId)[];
    user_id: Types.ObjectId;
    requestOrder_status?: string;
    requestOrder_details?: IRequestOrderDetail[];
    requestOrder_updatedBy?: IAdminInterface;
}