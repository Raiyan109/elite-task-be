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
exports.HotDealModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const HotDealProductsSchema = new mongoose_1.default.Schema({
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    discount_amount: {
        type: Number,
        required: true,
    },
}, { _id: false });
const HotDealSchema = new mongoose_1.default.Schema({
    hotDeal_title: {
        type: String,
        required: true,
    },
    hotDeal_description: {
        type: String,
    },
    hotDeal_slug: {
        type: String,
        unique: true,
    },
    hotDeal_start_date: {
        type: Date,
    },
    hotDeal_end_date: {
        type: Date,
    },
    hotDeal_status: {
        type: String,
        enum: ['active', 'in-active'],
        required: true,
        default: 'active',
    },
    hotDeal_image: {
        type: String,
    },
    hotDeal_image_key: {
        type: String,
    },
    hotDeal_products: {
        type: [HotDealProductsSchema],
        required: true,
    },
    hotDeal_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'admins',
    },
    hotDeal_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'admins',
    },
    is_delivery_dhaka_only: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// speeds up filtering by active + date range.
HotDealSchema.index({ hotDeal_status: 1, hotDeal_start_date: 1, hotDeal_end_date: 1 });
// speeds up lookup by product IDs inside the array.
HotDealSchema.index({ "hotDeal_products.product_id": 1 });
exports.HotDealModel = mongoose_1.default.model('hotDeals', HotDealSchema);
