import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.interface';

const DeliverySlotSchema = new Schema(
    {
        delivery_date: { type: String },
        delivery_start_time: { type: String },
        delivery_end_time: { type: String },
    },
    { _id: false }
);

const OrderDetailsSchema = new Schema(
    {
        product_price: { type: Number, required: true },
        previous_product_price: { type: Number },
        discount: { type: Number },
        coupon: { type: String },
        // coupon: { type: Schema.Types.ObjectId, ref: 'coupons' },
        coupon_discount: { type: Number },
        vat: { type: Number },
        delivery_charge: { type: Number },
        demand_charge: { type: Number },
        wallet_used: { type: Number },
    },
    { _id: false }
);

const OrderItemSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, /*ref: 'products',*/ refPath: 'order_items.refCollection', required: true },
    refCollection: {
        type: String,
        required: true,
        enum: ['products', 'combos'],
    },
    quantity: { type: Number, required: true },
    previous_quantity: { type: Number },
    quantity_decreased: { type: Number },
    price: { type: Number, required: true },
    type: { type: String },
    update_action: {
        type: String,
        enum: ["decrease", "remove"],
    },
}, { _id: false });


const OrderSchema = new Schema<IOrder>(
    {
        order_id: { type: String, required: true, unique: true },
        order_user_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        order_product_id: { type: Schema.Types.ObjectId, ref: 'products' },
        order_publisher_note: { type: String },
        order_tip: { type: Number },
        order_delivery_slot: { type: DeliverySlotSchema },
        order_delivery_location: {
            type: Schema.Types.ObjectId,
            ref: 'addresses',
            required: true,
        },
        order_status: {
            type: String,
            enum: ["pending", "processing", "on-the-way", "delivered", "canceled"],
            default: 'pending',
            required: true
        },
        order_payment_method: {
            type: String,
            // enum: ["cash-on-delivery", "ssl"],
            required: true
        },
        dont_disturb: {
            type: Boolean,
            default: false
        },
        order_items: [{
            type: OrderItemSchema,
            required: true,
        },
        ],
        order_details: { type: OrderDetailsSchema, required: true },
        note: { type: String },

        // Payment related fields
        order_payment_status: { type: String },
        order_payment_transactionId: { type: String },
        order_payable_amount: { type: Number },
        previous_order_payable_amount: { type: Number },

        order_publisher_id: { type: Schema.Types.ObjectId, ref: 'admins' },
    },
    {
        timestamps: true,
    }
);

// ✅ Compound index for checking if a user has used a coupon
OrderSchema.index({ order_user_id: 1, "order_details.coupon": 1 });

export const OrderModel = mongoose.model<IOrder>('orders', OrderSchema);
