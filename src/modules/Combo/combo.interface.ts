import { ObjectId, Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface IComboProducts {
    product_id: Types.ObjectId | IProductInterface;
    discount_amount: number;
    product_quantity: number;
    combo_price: number;
}

export interface ICombo {
    _id?: string | ObjectId;
    combo_title: string;
    combo_description?: string;
    combo_slug?: string;
    combo_status: string;
    combo_image?: string;
    combo_image_key?: string;
    combo_products: IComboProducts[];
    combo_publisher_id: Types.ObjectId | IAdminInterface;
    combo_updated_by: Types.ObjectId | IAdminInterface;
    is_delivery_dhaka_only?: boolean;
}

export const comboSearchableField = [
    'combo_title'
]
