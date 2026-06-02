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
exports.BannerModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BannerSchema = new mongoose_1.default.Schema({
    banner_image: {
        type: String,
        required: true,
    },
    banner_image_key: {
        type: String,
        required: true,
    },
    banner_status: {
        required: true,
        type: String,
        enum: ["active", "in-active"],
        default: "active",
    },
    banner_path: {
        type: String,
        // required: true,
    },
    banner_serial: {
        required: true,
        type: Number,
    },
    banner_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
        // required: true,
    },
    banner_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
    banner_position: {
        type: String,
        required: true,
        //enum: ["home-top", "home-center", "popular-products", "combo", "hot-deal", "weekday"],
        //banner_position field will be treated as common category names (e.g. --> electronics, toys etc.)
    },
}, {
    timestamps: true,
});
exports.BannerModel = mongoose_1.default.model('banners', BannerSchema);
