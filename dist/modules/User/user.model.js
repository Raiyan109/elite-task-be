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
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    user_name: { type: String },
    user_email: { type: String },
    user_phone: { type: String, unique: true },
    user_password: { type: String },
    confirm_password: { type: String },
    user_phone_is_verified: { type: Boolean, default: false },
    otp_code: { type: Number }, // optional, hash if stored
    otp_expires_at: { type: Date },
    user_address: { type: String },
    user_gender: { type: String },
    user_date_of_birth: { type: String }, // date of birth
    device_id: { type: String }, // optional, for tracking user devices
    user_profile: { type: String },
    user_profile_key: { type: String },
    user_status: {
        type: String,
        enum: ["active", "in-active"],
        default: "active",
    },
    // login_type: {
    //     type: String,
    //     enum: ["phone", "email", "social"],
    //     default: "phone",
    // },
    social_id: { type: String },
    social_email: { type: String },
    google_id: { type: String },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    scheduledForDeletionAt: {
        type: Date,
        default: null,
    },
    user_wallet_amount: {
        type: Number,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("users", UserSchema);
