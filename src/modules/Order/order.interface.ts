import { Types } from "mongoose";
import { IAddress } from "../Address/address.interface";
import { ICart } from "../Cart/cart.interface";
import { IUserInterface } from "../User/user.interface";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface IDeliverySlot {
    delivery_date: string;
    delivery_start_time: string;
    delivery_end_time: string;
}

export interface IOrderDetails {
    product_price: number;
    previous_product_price?: number;
    discount?: number;
    coupon: string;
    // coupon: Types.ObjectId | ICoupon;
    coupon_discount: number;
    vat: number;
    delivery_charge: number;
    demand_charge?: number;
    wallet_used?: number;
}

export interface IOrderItems {
    _id: Types.ObjectId | IProductInterface;
    quantity: number;
    previous_quantity?: number;
    quantity_decreased?: number;
    price?: number;
    type: string;
    update_action?: "decrease" | "remove";
}

export interface IOrder {
    order_id: string;
    order_user_id: Types.ObjectId | IUserInterface;
    order_product_id?: Types.ObjectId | IProductInterface; // Redundant field, can be removed if not needed
    order_publisher_note: string;
    order_tip: number;
    order_delivery_slot: IDeliverySlot;
    order_delivery_location: Types.ObjectId | IAddress;
    order_status: "pending" | "processing" | "on-the-way" | "delivered" | "canceled";
    order_payment_method: string; //"cash-on-delivery" | "ssl";
    dont_disturb?: boolean;
    order_items: [IOrderItems];
    order_details: IOrderDetails;
    note?: string;

    order_payment_status: string;
    order_payment_transactionId: string;
    order_payable_amount: number;
    previous_order_payable_amount?: number;

    order_publisher_id?: Types.ObjectId | IAdminInterface;
}


export const orderSearchableField = [
    'order_id'
]