import { Types } from "mongoose";
import { Model } from "mongoose";

export interface IAdminInterface {
    _id?: any;
    admin_password: string;
    admin_name: string;
    admin_phone: string;
    admin_address?: string;
    admin_role_id: Types.ObjectId;
    admin_profile?: string;
    admin_profile_key?: string;
    admin_status: "active" | "in-active";
    admin_publisher_id?: Types.ObjectId | IAdminInterface;
    admin_updated_by?: Types.ObjectId | IAdminInterface;
}

export interface IAdminLoginInterface {
    admin_phone: string;
    admin_password: string;
}

export interface IExtendedAdminInterface extends Model<IAdminInterface> {
    /* eslint-disable no-unused-vars */

    //instance methods for checking if the user exist
    isAdminExistsByPhone(admin_phone: string): Promise<IAdminInterface>;
    //instance methods for checking if passwords are matched
    isPasswordMatched(
        plainTextPassword: string,
        hashedPassword: string,
    ): Promise<boolean>;
}

export const adminSearchableField = [
    "admin_name",
    "admin_phone",
    "admin_status",
    "admin_address",
];