import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";
import { IAdminInterface } from "../Admin/admin.interface";

export interface IRefund {
    refund_images: string[];
    refund_images_key: string[];
    order_id: string;
    refund_reason: string;
    user_id: Types.ObjectId | IUserInterface;
    refund_status: 'pending' | 'approved' | 'rejected';
    refund_amount?: number;
    refund_message?: string;
    refund_updated_by?: Types.ObjectId | IAdminInterface;
}

export const refundSearchableField = [
    'order_id'
]