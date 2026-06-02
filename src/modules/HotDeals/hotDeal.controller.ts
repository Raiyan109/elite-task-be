import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { HotDealServices } from "./hotDeal.service";
import sendResponse from "../../utils/sendResponse";
import { IHotDeal } from "./hotDeal.interface";
import httpStatus from 'http-status'
import AppError from "../../errors/AppError";
import { generateUniqueSlug } from "../Product/product.constant";
import { HotDealModel } from "./hotDeal.model";
import { Types } from "mongoose";


const createHotDeal = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.files && "hotDeal_image" in req.files && req.body) {
            const requestData = req.body;

            const hotDeal_slug = await generateUniqueSlug(requestData?.hotDeal_title);
            requestData.hotDeal_slug = hotDeal_slug;

            // Parse hotDeal_products (it's sent as stringified JSON)
            let parsedHotDealProducts;
            try {
                parsedHotDealProducts = JSON.parse(requestData.hotDeal_products);
            } catch (err) {
                throw new AppError(httpStatus.BAD_REQUEST, "Invalid hotDeal_products format. Must be a valid JSON array.");
            }

            // Upload hotDeal image
            let hotDeal_image;
            let hotDeal_image_key;

            const hotDealImage = req.files["hotDeal_image"]?.[0];
            if (hotDealImage) {
                const uploadResult = await FileUploadHelper.uploadToSpaces(hotDealImage);
                hotDeal_image = uploadResult?.Location;
                hotDeal_image_key = uploadResult?.Key;
            } else {
                throw new AppError(httpStatus.BAD_REQUEST, "HotDeal image file is missing.");
            }

            // Construct hotDeal data object
            const hotDealData: IHotDeal = {
                ...requestData,
                hotDeal_products: parsedHotDealProducts,
                hotDeal_image,
                hotDeal_image_key,
                hotDeal_slug: hotDeal_slug,
                // hotDeal_publisher_id: req.user?._id, // Assuming req.user is populated via middleware
                // hotDeal_updated_by: req.user?._id,   // Same as above
            };

            const result = await HotDealServices.createHotDealServices(hotDealData);

            if (result) {
                return sendResponse<IHotDeal>(res, {
                    success: true,
                    statusCode: httpStatus.OK,
                    message: "HotDeal Added Successfully!",
                    data: result,
                });
            } else {
                throw new AppError(httpStatus.BAD_REQUEST, "HotDeal creation failed.");
            }
        } else {
            throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed or request body is incomplete.");
        }
    } catch (error: any) {
        next(error);
    }
});

const findAllHotDeal = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters


    // Step 1: Fetch products using the service
    const hotDeals = await HotDealServices.findHotDealServices();
    // console.log(hotDeals);


    //console.log(products.length);


    // Step 2: Check if no data is found
    // if (!hotDeals || hotDeals.length === 0) {
    //     return sendResponse(res, {
    //         success: true,
    //         statusCode: httpStatus.NO_CONTENT,
    //         message: 'No data found.',
    //         data: [],
    //     });
    // }

    // Step 3: Send the response
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'HotDeals retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: hotDeals,
    });
});

const findDashboardHotDeal = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters


    // Step 1: Fetch products using the service
    const hotDeals = await HotDealServices.findDashboardHotDealServices();

    //console.log(products.length);


    // Step 2: Check if no data is found
    if (!hotDeals || hotDeals.length === 0) {
        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.NO_CONTENT,
            message: 'No data found.',
            data: [],
        });
    }

    // Step 3: Send the response
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Dashboard hotDeals retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: hotDeals,
    });
});

// get single product
const findSingleHotDeal = catchAsync(async (req, res, next: NextFunction) => {
    const { id } = req.params; // Get all query parameters

    // Step 1: Fetch product using the service
    const hotDeal = await HotDealServices.findSingleHotDealServices(id);

    // Step 2: Check if no data is found
    if (!hotDeal) {
        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.NO_CONTENT,
            message: 'No data found.',
            data: [],
        });
    }



    // Step 4: Send the response
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Single hotDeal retrieved successfully',
        data: hotDeal,
    });
});

// get hotDeals by IDs
const findHotDealsByIds = catchAsync(async (req, res, next: NextFunction) => {
    const { ids } = req.body; // Get all query parameters

    // Step 1: Fetch product using the service
    const hotDeal = await HotDealServices.findHotDealsByIdsServices(ids);

    // Step 2: Check if no data is found
    if (!hotDeal) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }

    // Step 4: Send the response
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'HotDeals by IDs retrieved successfully',
        data: hotDeal,
    });
});

const updateHotDeal = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestData = req.body;
        const updateData: Partial<IHotDeal> = {};

        // Handle title update and generate new slug if title changes
        if (requestData?.hotDeal_title) {
            updateData.hotDeal_title = requestData.hotDeal_title;
            const hotDeal_slug = await generateUniqueSlug(requestData.hotDeal_title);
            updateData.hotDeal_slug = hotDeal_slug;
        }

        // Handle description update
        if (requestData?.hotDeal_description !== undefined) {
            updateData.hotDeal_description = requestData.hotDeal_description;
        }

        // Handle status update
        if (requestData?.hotDeal_status) {
            updateData.hotDeal_status = requestData.hotDeal_status;
        }

        // Handle dates update
        if (requestData?.hotDeal_start_date) {
            updateData.hotDeal_start_date = requestData.hotDeal_start_date;
        }
        if (requestData?.hotDeal_end_date) {
            updateData.hotDeal_end_date = requestData.hotDeal_end_date;
        }

        // Handle delivery option update
        if (requestData?.is_delivery_dhaka_only !== undefined) {
            updateData.is_delivery_dhaka_only = requestData.is_delivery_dhaka_only;
        }

        // Handle products update
        if (requestData?.hotDeal_products) {
            try {
                // updateData.hotDeal_products = JSON.parse(requestData.hotDeal_products);
                const parsedProducts = JSON.parse(requestData.hotDeal_products);

                // console.log(parsedProducts);
                

                if (!Array.isArray(parsedProducts)) {
                    throw new Error();
                }

                updateData.hotDeal_products = parsedProducts.map((product: any) => ({
                    product_id: new Types.ObjectId(String(product.product_id)),
                    discount_amount: product.discount_amount,
                }));

            } catch (err) {
                throw new AppError(httpStatus.BAD_REQUEST, "Invalid hotDeal_products format. Must be a valid JSON array.");
            }
        }

        // Handle image update if new image is provided
        if (req.files && "hotDeal_image" in req.files) {
            const hotDealImage = req.files["hotDeal_image"]?.[0];
            if (hotDealImage) {
                // First delete the old image if it exists
                const existingHotDeal = await HotDealModel.findOne();
                if (existingHotDeal?.hotDeal_image_key) {
                    await FileUploadHelper.deleteFromSpaces(existingHotDeal.hotDeal_image_key);
                }

                // Upload new image
                const uploadResult = await FileUploadHelper.uploadToSpaces(hotDealImage);
                updateData.hotDeal_image = uploadResult?.Location;
                updateData.hotDeal_image_key = uploadResult?.Key;
            }
        }

        // Update the updated_by field
        updateData.hotDeal_updated_by = req.user?._id;

        const result = await HotDealServices.updateHotDealServices(updateData);

        if (result) {
            return sendResponse<IHotDeal>(res, {
                success: true,
                statusCode: httpStatus.OK,
                message: "Hot Deal Updated Successfully!",
                data: result,
            });
        } else {
            throw new AppError(httpStatus.BAD_REQUEST, "Hot Deal update failed.");
        }
    } catch (error: any) {
        next(error);
    }
});

export const HotDealController = {
    createHotDeal,
    findAllHotDeal,
    findDashboardHotDeal,
    findSingleHotDeal,
    findHotDealsByIds,
    updateHotDeal
}