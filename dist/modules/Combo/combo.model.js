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
exports.ComboModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the sub-schema for combo_products
const ComboProductsSchema = new mongoose_1.Schema({
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    discount_amount: {
        type: Number,
        required: true,
    },
    product_quantity: {
        type: Number,
        required: true,
    },
    combo_price: {
        type: Number,
        required: true,
    },
});
// Define the main combo schema
const ComboSchema = new mongoose_1.Schema({
    combo_title: {
        type: String,
        required: true,
    },
    combo_description: {
        type: String,
    },
    combo_slug: {
        type: String,
    },
    combo_status: {
        type: String,
        default: 'active'
    },
    combo_image: {
        type: String,
    },
    combo_image_key: {
        type: String,
    },
    combo_products: {
        type: [ComboProductsSchema],
        required: true,
    },
    combo_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'admins',
    },
    combo_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'admins',
    },
    is_delivery_dhaka_only: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // creates createdAt and updatedAt fields
});
// Export the model
exports.ComboModel = mongoose_1.default.model('combos', ComboSchema);
