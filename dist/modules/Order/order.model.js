"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DeliverySlotSchema = new mongoose_1.Schema({
    delivery_date: { type: String },
    delivery_start_time: { type: String },
    delivery_end_time: { type: String },
}, { _id: false });
const OrderDetailsSchema = new mongoose_1.Schema({
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
}, { _id: false });
const OrderItemSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, /*ref: 'products',*/ refPath: 'order_items.refCollection', required: true },
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
const OrderSchema = new mongoose_1.Schema({
    order_id: { type: String, required: true, unique: true },
    order_user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users', required: true },
    order_product_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'products' },
    order_publisher_note: { type: String },
    order_tip: { type: Number },
    order_delivery_slot: { type: DeliverySlotSchema },
    order_delivery_location: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    order_publisher_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'admins' },
}, {
    timestamps: true,
});
// ✅ Compound index for checking if a user has used a coupon
OrderSchema.index({ order_user_id: 1, "order_details.coupon": 1 });
exports.OrderModel = mongoose_1.default.model('orders', OrderSchema);
