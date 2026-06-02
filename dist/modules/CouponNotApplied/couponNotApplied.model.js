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
exports.CouponNotAppliedModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the sub-schema for coupon not applied products
const CouponNotAppliedProducts = new mongoose_1.Schema({
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
}, { _id: false } // Disable _id for each subdocument
);
// Define the main coupon_not_applied schema
const CouponNotAppliedSchema = new mongoose_1.Schema({
    coupon_not_applied_products: {
        type: [CouponNotAppliedProducts],
        required: true,
    },
    coupon_not_applied_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'admins',
    },
    coupon_not_applied_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'admins',
    },
    // is_delivery_dhaka_only: {
    //     type: Boolean,
    //     default: false,
    // },
}, {
    timestamps: true, // creates createdAt and updatedAt fields
});
// ✅ Index on array field (exactly the index you need for your coupon eligibility check.)
CouponNotAppliedSchema.index({ "coupon_not_applied_products.product_id": 1 });
// Export the model
exports.CouponNotAppliedModel = mongoose_1.default.model('couponnotapplieds', CouponNotAppliedSchema);
