import { Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";

export interface ICartItem {
    _id: Types.ObjectId | IProductInterface;
    // item_id: Types.ObjectId | IProductInterface;
    quantity: number;
    type: 'product' | 'combo';
}

export interface ICart {
    cart_items: ICartItem[];
    user_id: Types.ObjectId;
}