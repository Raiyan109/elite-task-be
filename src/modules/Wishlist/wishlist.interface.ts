import { Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";

export interface IWishlist {
    product_id: (IProductInterface | Types.ObjectId)[];
    user_id: Types.ObjectId;
}