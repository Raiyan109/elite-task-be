import { Request, Response } from "express";
import { createNotificationService, getAllNotificationsService, getUserNotificationsService, /*getNotificationsService*/ } from "./notification.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

// Create Notification
export const createNotification = async (req: Request, res: Response) => {
    try {
        const notification = await createNotificationService(req.body);
        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: notification,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to create notification",
            error: error.message,
        });
    }
};

export const getAllNotifications = catchAsync(
    async (req: Request, res: Response) => {
        const result = await getAllNotificationsService();

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "All notifications fetched successfully",
            data: result,
        });
    }
);

export const getUserNotifications = catchAsync(
    async (req: Request, res: Response) => {
        // user_id will come from req.user (after auth middleware)
        const userId = req.user._id;

        // console.log(req);
        

        const result = await getUserNotificationsService(userId);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User notifications fetched successfully",
            data: result,
        });
    }
);

// Get Notifications
// export const getNotifications = async (req: Request, res: Response) => {
//     try {
//         const { _id } = req.user; // optional filter
//         const notifications = await getNotificationsService(_id as string);
//         res.status(200).json({
//             success: true,
//             message: "Notifications fetched successfully",
//             data: notifications,
//         });
//     } catch (error: any) {
//         res.status(400).json({
//             success: false,
//             message: "Failed to fetch notifications",
//             error: error.message,
//         });
//     }
// };