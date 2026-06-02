import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

import { IRefund } from './refund.interface';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import catchAsync from '../../utils/catchAsync';
import { RefundServices } from './refund.service';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';


// const createRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         if (req.files && 'refund_images' in req.files && req.body) {
//             const userId = req.user?._id
//             const refundImage = req.files['refund_images'][0];
//             const refund_images_upload = await FileUploadHelper.uploadToSpaces(refundImage);

//             const refundData: IRefund = {
//                 refund_images: refund_images_upload?.Location,
//                 refund_images_key: refund_images_upload?.Key,
//                 user_id: userId,
//                 ...req.body,
//             } as IRefund;

//             const result = await RefundServices.createRefundService(refundData);

//             return sendResponse<IRefund>(res, {
//                 success: true,
//                 statusCode: httpStatus.OK,
//                 message: 'Refund request submitted successfully!',
//                 data: result,
//             });
//         } else {
//             throw new AppError(400, 'Image upload failed');
//         }
//     } catch (error) {
//         next(error);
//     }
// });

const createRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.files && 'refund_images' in req.files && req.body) {
            const userId = req.user?._id;
            const refundImages = req.files['refund_images'];

            // Upload all images and get their URLs and keys
            const uploadPromises = refundImages.map(async (image: Express.Multer.File) => {
                return await FileUploadHelper.uploadToSpaces(image);
            });

            const uploadedImages = await Promise.all(uploadPromises);

            // Extract locations and keys
            const imageLocations = uploadedImages.map(img => img?.Location);
            const imageKeys = uploadedImages.map(img => img?.Key);

            const refundData: IRefund = {
                refund_images: imageLocations,
                refund_images_key: imageKeys,
                user_id: userId,
                ...req.body,
            } as IRefund;

            const result = await RefundServices.createRefundService(refundData);

            return sendResponse<IRefund>(res, {
                success: true,
                statusCode: httpStatus.OK,
                message: 'Refund request submitted successfully!',
                data: result,
            });
        } else {
            throw new AppError(400, 'Image upload failed');
        }
    } catch (error) {
        next(error);
    }
});

const findAllDashboardRefunds = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, searchTerm = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result = await RefundServices.findAllDashboardRefundsService(limitNumber, skip, searchTerm as '');
    sendResponse<IRefund[]>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Dashboard Refunds fetched successfully!',
        data: result,
    });
});

const findRefundById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await RefundServices.findRefundByIdService(userId, limitNumber, skip);
    sendResponse<IRefund[]>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Refunds by user id fetched successfully!',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
});

const findRefundByOrderId = catchAsync(async (req: Request, res: Response) => {
    const result = await RefundServices.findRefundByOrderIdService(req.params.order_id);
    sendResponse<IRefund>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Refund by order id fetched successfully!',
        data: result,
    });
});

const updateRefund = catchAsync(async (req: Request, res: Response) => {
    const result = await RefundServices.updateRefundService(req.params.id, req.body);
    sendResponse<IRefund>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Refund updated successfully!',
        data: result,
    });
});

const deleteRefund = catchAsync(async (req: Request, res: Response) => {
    const result = await RefundServices.deleteRefundService(req.params.id);
    sendResponse<IRefund>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Refund deleted successfully!',
        data: result,
    });
});

export const RefundController = {
    createRefund,
    findAllDashboardRefunds,
    findRefundById,
    updateRefund,
    deleteRefund,
    findRefundByOrderId,
};
