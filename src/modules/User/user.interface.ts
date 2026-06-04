
export interface IUserInterface {
    user_name: string;
    user_email: string;
    user_password: string;
    confirm_password?: string;

    role?: "user" | "admin";
    user_status?: "active" | "in-active";
}

export type TUserRole = "user" | "admin";
export type TUserStatus = "active" | "in-active";

