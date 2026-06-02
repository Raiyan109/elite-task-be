import { NextFunction, Request, RequestHandler, Response } from "express";
import {
    customOrderSearchableField,
    ICustomOrder,
} from "./customOrder.interface";
import {
    deleteCustomOrderServices,
    findAllCustomOrderServices,
    findAllDashboardCustomOrderServices,
    findCustomOrderByUserIdServices,
    postCustomOrderServices,
    updateCustomOrderServices,
} from "./customOrder.service";
import * as fs from "fs";

import httpStatus from 'http-status'
import slugify from "slugify";
import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import sendResponse from "../../utils/sendResponse";
import { CustomOrderModel } from "./customOrder.model";


// Add A CustomOrder
export const postCustomOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<ICustomOrder | any> => {
    try {
        // if (req.files && "product_image" in req.files && req.body) {

        // } else {
        //     throw new AppError(400, "Image Upload Failed");
        // }
        // const userId = req.user._id

        const requestData = req.body;

        // get the customOrder image and upload
        let product_image;
        let product_image_key;
        if (req.files && "product_image" in req.files) {
            const customOrderImage = req.files["product_image"][0];
            const product_image_upload = await FileUploadHelper.uploadToSpaces(
                customOrderImage
            );
            product_image = product_image_upload?.Location;
            product_image_key = product_image_upload?.Key;
        }
        const data = { ...requestData, product_image, product_image_key};
        const result: ICustomOrder | {} = await postCustomOrderServices(data);

        if (result) {
            return sendResponse<ICustomOrder>(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: "Custom Order Added Successfully !",
            });
        } else {
            throw new AppError(400, "Custom Order Added Failed !");
        }
    } catch (error: any) {
        next(error);
    }
};

// Find All CustomOrder
export const findAllCustomOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<ICustomOrder | any> => {
    try {
        const { searchTerm, ...filterData } = req.query;
        const result: ICustomOrder[] | any = await findAllCustomOrderServices(searchTerm);
        return sendResponse<ICustomOrder>(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Custom Order Found Successfully !",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

// Find CustomOrder by user id
export const findCustomOrderByUserId: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<ICustomOrder | any> => {
    try {
        const { page, limit, searchTerm } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const userId = req.user._id

        const result: ICustomOrder[] | any =
            await findCustomOrderByUserIdServices(limitNumber, skip, searchTerm, userId);

        const andCondition = [];

        if (searchTerm) {
            andCondition.push({
                $or: customOrderSearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }

        andCondition.push({
            user_id: userId, // again, use the correct field name
        });

        const whereCondition =
            andCondition.length > 0 ? { $and: andCondition } : {};

        const total = await CustomOrderModel.countDocuments(whereCondition);

        return sendResponse<ICustomOrder>(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Custom Order Found Successfully !",
            data: result,
            totalData: total,
        });
    } catch (error: any) {
        next(error);
    }
};

// Find All dashboard CustomOrder
export const findAllDashboardCustomOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<ICustomOrder | any> => {
    try {
        const { page, limit, searchTerm } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const result: ICustomOrder[] | any =
            await findAllDashboardCustomOrderServices(limitNumber, skip, searchTerm);
        const andCondition = [];
        if (searchTerm) {
            andCondition.push({
                $or: customOrderSearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }
        const whereCondition =
            andCondition.length > 0 ? { $and: andCondition } : {};
        const total = await CustomOrderModel.countDocuments(whereCondition);
        return sendResponse<ICustomOrder>(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Custom Order Found Successfully !",
            data: result,
            totalData: total,
        });
    } catch (error: any) {
        next(error);
    }
};

// Update A CustomOrder
export const updateCustomOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<ICustomOrder | any> => {
    try {
        if (req.files && "product_image" in req.files && req.body) {
            const requestData = req.body;


            // Find the customOrder that is being updated
            const customOrderToUpdate = await CustomOrderModel.findById(requestData?._id);

            //console.log(customOrderToUpdate);


            if (!customOrderToUpdate) {
                throw new Error("CustomOrder to update not found.");
            }

            // get the customOrder image and upload
            let product_image;
            let product_image_key;
            if (req.files && "product_image" in req.files) {
                const customOrderImage = req.files["product_image"][0];
                const product_image_upload = await FileUploadHelper.uploadToSpaces(
                    customOrderImage
                );
                product_image = product_image_upload?.Location;
                product_image_key = product_image_upload?.Key;
            }
            const data = { ...requestData, product_image, product_image_key };
            const result: ICustomOrder | any = await updateCustomOrderServices(
                data,
                requestData?._id
            );
            if (result?.modifiedCount > 0) {
                if (requestData?.product_image_key) {
                    await FileUploadHelper.deleteFromSpaces(
                        requestData?.product_image_key
                    );
                }
                return sendResponse<ICustomOrder>(res, {
                    statusCode: httpStatus.OK,
                    success: true,
                    message: "Custom Order Update Successfully !",
                });
            } else {
                throw new AppError(400, "CustomOrder Update Failed !");
            }
        } else {
            const requestData = req.body;

            // Find the customOrder that is being updated
            const customOrderToUpdate = await CustomOrderModel.findById(requestData?._id);


            if (!customOrderToUpdate) {
                throw new Error("CustomOrder to update not found.");
            }


            const data = { ...requestData };
            const result: ICustomOrder | any = await updateCustomOrderServices(
                data,
                requestData?._id
            );
            if (result?.modifiedCount > 0) {
                return sendResponse<ICustomOrder>(res, {
                    statusCode: httpStatus.OK,
                    success: true,
                    message: "Custom Order Update Successfully !",
                });
            } else {
                throw new AppError(400, "Custom Order Update Failed !");
            }
        }
    } catch (error: any) {
        next(error);
    }
};

// delete A CustomOrder item
export const deleteACustomOrderInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const customOrder_id = req.body._id;

        const result = await deleteCustomOrderServices(customOrder_id);
        if (result?.deletedCount > 0) {
            if (req.body?.product_image_key) {
                await FileUploadHelper.deleteFromSpaces(req.body?.product_image_key);
            }
            return sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: "Custom Order Delete successfully !",
            });
        } else {
            throw new AppError(400, "Custom Order delete failed !");
        }
    } catch (error) {
        next(error);
    }
};


