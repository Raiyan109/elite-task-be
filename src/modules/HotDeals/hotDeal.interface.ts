import { Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface IHotDealProducts {
    product_id: Types.ObjectId | IProductInterface;
    discount_amount: number;
}

export interface IHotDeal {
    hotDeal_title: string;
    hotDeal_description?: string;
    hotDeal_slug?: string;
    hotDeal_start_date?: string;
    hotDeal_end_date?: string;
    hotDeal_status: string;
    hotDeal_image?: string;
    hotDeal_image_key?: string;
    hotDeal_products: IHotDealProducts[];
    hotDeal_publisher_id: Types.ObjectId | IAdminInterface;
    hotDeal_updated_by: Types.ObjectId | IAdminInterface;
    is_delivery_dhaka_only?: boolean;
}

