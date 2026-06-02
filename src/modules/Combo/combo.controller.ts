import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { ComboServices } from "./combo.service";
import sendResponse from "../../utils/sendResponse";
import { ICombo } from "./combo.interface";
import httpStatus from 'http-status'
import AppError from "../../errors/AppError";
import { generateUniqueSlug } from "../Product/product.constant";


const createCombo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.files && "combo_image" in req.files && req.body) {
            const requestData = req.body;

            const combo_slug = await generateUniqueSlug(requestData?.combo_title);
            requestData.combo_slug = combo_slug;

            // Parse combo_products (it's sent as stringified JSON)
            let parsedComboProducts;
            try {
                parsedComboProducts = JSON.parse(requestData.combo_products);
            } catch (err) {
                throw new AppError(httpStatus.BAD_REQUEST, "Invalid combo_products format. Must be a valid JSON array.");
            }

            // Upload combo image
            let combo_image;
            let combo_image_key;

            const comboImage = req.files["combo_image"]?.[0];
            if (comboImage) {
                const uploadResult = await FileUploadHelper.uploadToSpaces(comboImage);
                combo_image = uploadResult?.Location;
                combo_image_key = uploadResult?.Key;
            } else {
                throw new AppError(httpStatus.BAD_REQUEST, "Combo image file is missing.");
            }

            // Construct combo data object
            const comboData: ICombo = {
                ...requestData,
                combo_products: parsedComboProducts,
                combo_image,
                combo_image_key,
                combo_slug: combo_slug,
                // combo_publisher_id: req.user?._id, // Assuming req.user is populated via middleware
                // combo_updated_by: req.user?._id,   // Same as above
            };

            const result = await ComboServices.createComboServices(comboData);

            if (result) {
                return sendResponse<ICombo>(res, {
                    success: true,
                    statusCode: httpStatus.OK,
                    message: "Combo Added Successfully!",
                    data: result,
                });
            } else {
                throw new AppError(httpStatus.BAD_REQUEST, "Combo creation failed.");
            }
        } else {
            throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed or request body is incomplete.");
        }
    } catch (error: any) {
        next(error);
    }
});

const findAllCombo = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters


    // Step 1: Fetch products using the service
    const combos = await ComboServices.findComboServices();

    //console.log(products.length);


    // Step 2: Check if no data is found
    if (!combos || combos.length === 0) {
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
        message: 'Combos retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: combos,
    });
});


const findRelatedCombos = catchAsync(async (req, res, next: NextFunction) => {
    const { id } = req.params; // comboId you want to exclude

    const combos = await ComboServices.findRelatedComboServices(id);

    if (!combos || combos.length === 0) {
        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.NO_CONTENT,
            message: "No Related combos found.",
            data: [],
        });
    }

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Related combos retrieved successfully",
        data: combos,
    });
});

const findDashboardCombo = catchAsync(async (req, res, next: NextFunction) => {
    const { page = 1, limit = 10, searchTerm = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Step 1: Fetch products using the service
    const combos = await ComboServices.findDashboardComboServices(limitNumber, skip, searchTerm as '');

    // Step 2: Check if no data is found
    if (!combos || combos.length === 0) {
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
        message: 'Dashboard combos retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: combos,
    });
});

// get single product
const findSingleCombo = catchAsync(async (req, res, next: NextFunction) => {
    const { id } = req.params; // Get all query parameters

    // Step 1: Fetch product using the service
    const combo = await ComboServices.findSingleComboServices(id);

    // Step 2: Check if no data is found
    if (!combo) {
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
        message: 'Single combo retrieved successfully',
        data: combo,
    });
});

// get combos by IDs
const findCombosByIds = catchAsync(async (req, res, next: NextFunction) => {
    const { ids } = req.body; // Get all query parameters

    // Step 1: Fetch product using the service
    const combo = await ComboServices.findCombosByIdsServices(ids);

    // Step 2: Check if no data is found
    if (!combo) {
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
        message: 'Combos by IDs retrieved successfully',
        data: combo,
    });
});

const updateCombo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const comboId = req.params.id;
        const requestData = req.body;

        // Handle optional combo image update
        if (req.files && "combo_image" in req.files) {
            const comboImage = req.files["combo_image"]?.[0];
            if (comboImage) {
                const uploadResult = await FileUploadHelper.uploadToSpaces(comboImage);
                requestData.combo_image = uploadResult?.Location;
                requestData.combo_image_key = uploadResult?.Key;
            }
        }

        // Handle combo_products parsing
        if (requestData.combo_products && typeof requestData.combo_products === "string") {
            try {
                requestData.combo_products = JSON.parse(requestData.combo_products);
            } catch (err) {
                throw new AppError(httpStatus.BAD_REQUEST, "Invalid combo_products format. Must be a valid JSON array.");
            }
        }

        // Optional slug regeneration
        if (requestData.combo_title) {
            requestData.combo_slug = await generateUniqueSlug(requestData.combo_title);
        }

        const result = await ComboServices.updateComboServices(comboId, requestData);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Combo updated successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
});

const deleteCombo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const comboId = req.params.id;
        const result = await ComboServices.deleteComboServices(comboId);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Combo deleted successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
});


export const ComboController = {
    createCombo,
    findAllCombo,
    findRelatedCombos,
    findDashboardCombo,
    findSingleCombo,
    findCombosByIds,
    updateCombo,
    deleteCombo,
}