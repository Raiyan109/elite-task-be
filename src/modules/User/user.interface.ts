
export interface IUserInterface {
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

export type TUserRole = "user" | "admin";
export type TUserStatus = "active" | "in-active";

