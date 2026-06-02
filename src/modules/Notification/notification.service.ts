import { Types } from "mongoose";
import { INotification } from "./notification.interface";
import { NotificationModel } from "./notification.model";

// Create notification
export const createNotificationService = async (
    payload: INotification
): Promise<INotification> => {
    const notification = await NotificationModel.create(payload);
    return notification;
};

//get notifications for type: all
export const getAllNotificationsService = async (): Promise<INotification[]> => {
    return await NotificationModel.find({ type: "All" }).sort({ createdAt: -1 });
};

//get notifications for type: all and specific (user specific)
export const getUserNotificationsService = async (
    userId: Types.ObjectId
): Promise<INotification[]> => {
    return await NotificationModel.find({
        $or: [
            { type: "All" },
            { type: "Specific", user_id: userId }
        ],
    }).sort({ createdAt: -1 });
};

// Get all notifications (optionally filter by user_id)
// export const getNotificationsService = async (
//     userId?: string
// ): Promise<INotification[]> => {
//     const filter = userId ? { user_id: userId } : {};
//     const notifications = await NotificationModel.find(filter)
//         .populate("user_id", "user_name user_email") // populate limited fields
//         .sort({ createdAt: -1 }); // latest first
//     return notifications;
// };