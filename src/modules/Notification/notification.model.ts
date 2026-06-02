import { Schema, model, Document, Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";

export interface INotification extends Document {
  user_id?: (Types.ObjectId | IUserInterface)[];
  type: "All" | "Specific";
  notification_title: string;
  notification_description: string;
  notification_big_picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "users", // reference to users collection
        required: function () {
          return this.type === "Specific";
        },
      },
    ],
    type: {
      type: String,
      enum: ["All", "Specific"],
      required: true,
    },
    notification_title: {
      type: String,
      required: true,
    },
    notification_description: {
      type: String,
      required: true,
    },
    notification_big_picture: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const NotificationModel = model<INotification>(
  "notifications",
  NotificationSchema
);
