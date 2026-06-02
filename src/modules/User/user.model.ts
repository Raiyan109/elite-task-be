import mongoose, { Schema, Document } from "mongoose";
import { IAdminInterface } from "../Admin/admin.interface";


export interface IUserDocument extends Document {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    user_password?: string;
    confirm_password?: string;
    user_phone_is_verified: boolean;
    otp_code?: number;
    otp_expires_at?: Date;
    user_address?: string;
    user_gender?: string;
    user_date_of_birth?: string;
    device_id?: string; // ✅ optional, for tracking user devices

    user_profile?: string;
    user_profile_key?: string;
    user_status: "active" | "in-active";

    // ✅ Social login support
    login_type?: "phone" | "email" | "social";
    social_id?: string; // ✅ the ID received from social platform
    social_email?: string; // ✅ optional, often provided by social login
    google_id?: string;

    role?: "user" | "admin";

    scheduledForDeletionAt: Date | null; // ✅ for soft delete

    user_wallet_amount?: number;

    notification_id?: string;
}

const UserSchema: Schema = new Schema<IUserDocument>(
    {
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
        notification_id: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUserDocument>("users", UserSchema);
