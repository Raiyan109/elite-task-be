import { ObjectId, Types } from "mongoose";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface ICouponNotAppliedProducts {
    product_id: Types.ObjectId | IProductInterface;
}

export interface ICouponNotApplied {
    _id?: string | ObjectId;
    coupon_not_applied_products: [ICouponNotAppliedProducts];
    coupon_not_applied_publisher_id: Types.ObjectId | IAdminInterface;
    coupon_not_applied_updated_by: Types.ObjectId | IAdminInterface;
    // is_delivery_dhaka_only?: boolean;
}

// export const coupon_not_appliedSearchableField = [
//     'coupon_not_applied_title'
// ]
