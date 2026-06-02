import { Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface IOfferProduct {
    product_id: Types.ObjectId | IProductInterface;
    discount_amount: number;
    // product_quantity: number;
}

export interface IOffer {
    offer_label: string; // weekday | monthly
    offer_title: string;
    offer_description?: string;
    offer_start_date?: string;
    offer_end_date?: string;
    offer_slug?: string;
    offer_status: string;
    offer_image?: string;
    offer_image_key?: string;
    offer_product: IOfferProduct;
    // offer_products: [IOfferProducts];
    offer_publisher_id: Types.ObjectId | IAdminInterface;
    offer_updated_by: Types.ObjectId | IAdminInterface;
    is_delivery_dhaka_only?: boolean;
}

