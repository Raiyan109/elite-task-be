import mongoose, { Schema, Document } from "mongoose";


export interface IUserDocument extends Document {
    user_name: string;
    user_email: string;
    user_password: string;
    confirm_password?: string;

    roleId: string;
    user_status?: "active" | "in-active";
}

const UserSchema: Schema = new Schema<IUserDocument>(
    {
        user_name: { type: String },
        user_email: { type: String },
        user_password: { type: String },
        confirm_password: { type: String },

        roleId: { type: String, ref: "roles" },
        user_status: { type: String, enum: ["active", "in-active"], default: "active" },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUserDocument>("users", UserSchema);
