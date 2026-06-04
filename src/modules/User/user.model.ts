import mongoose, { Schema, Document } from "mongoose";


export interface IUserDocument extends Document {
    user_name: string;
    user_email: string;
    user_password: string;
    confirm_password?: string;

    role?: "user" | "admin";
    user_status?: "active" | "in-active";
}

const UserSchema: Schema = new Schema<IUserDocument>(
    {
        user_name: { type: String },
        user_email: { type: String },
        user_password: { type: String },
        confirm_password: { type: String },
        
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUserDocument>("users", UserSchema);
