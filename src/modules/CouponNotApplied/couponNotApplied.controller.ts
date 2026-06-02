import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
import AppError from "../../errors/AppError";
import { CouponNotAppliedServices } from "./couponNotApplied.service";
import { ICouponNotApplied } from "./couponNotApplied.interface";
import mongoose, { Types } from "mongoose";
import { CouponNotAppliedModel } from "./couponNotApplied.model";


const createCouponNotApplied = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestData = req.body;

        // Parse coupon_not_applied_products (it's sent as stringified JSON)
        // let parsedCouponNotAppliedProducts;
        // try {
        //     parsedCouponNotAppliedProducts = JSON.parse(requestData.coupon_not_applied_products);
        // } catch (err) {
        //     throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon_not_applied_products format. Must be a valid JSON array.");
        // }


        // Inline check for existing products
        const productIds = requestData.coupon_not_applied_products.map((p: any) =>
            mongoose.Types.ObjectId.createFromHexString(p.product_id)
        );

        const existingEntries = await CouponNotAppliedModel.find({
            "coupon_not_applied_products.product_id": { $in: productIds }
        });

        if (existingEntries.length > 0) {
            const existingIds: string[] = [];
            existingEntries.forEach((entry: any) => {
                entry.coupon_not_applied_products.forEach((p: any) => {
                    if (productIds.some((id: any) => id.equals(p.product_id))) {
                        existingIds.push(p.product_id.toString());
                    }
                });
            });

            throw new AppError(httpStatus.CONFLICT, `Products already exist: ${[...new Set(existingIds)].join(", ")}`);
        }

        // Construct coupon not applied data object
        const couponNotAppliedData: ICouponNotApplied = {
            ...requestData,
            coupon_not_applied_products: requestData.coupon_not_applied_products, //parsedCouponNotAppliedProducts,
            // coupon_not_applied_publisher_id: req.user?._id, // Assuming req.user is populated via middleware
            // coupon_not_applied_updated_by: req.user?._id,   // Same as above
        };

        const result = await CouponNotAppliedServices.createCouponNotAppliedServices(couponNotAppliedData);

        if (result) {
            return sendResponse<ICouponNotApplied>(res, {
                success: true,
                statusCode: httpStatus.OK,
                message: "Coupon not applied list Added Successfully!",
                data: result,
            });
        } else {
            throw new AppError(httpStatus.BAD_REQUEST, "Coupon not applied list creation failed.");
        }
    } catch (error: any) {
        next(error);
    }
});

// const findAllCombo = catchAsync(async (req, res, next: NextFunction) => {
//     const query = req.query; // Get all query parameters


//     // Step 1: Fetch products using the service
//     const combos = await CouponNotAppliedServices.findCouponNotAppliedServices();

//     //console.log(products.length);


//     // Step 2: Check if no data is found
//     if (!combos || combos.length === 0) {
//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.NO_CONTENT,
//             message: 'No data found.',
//             data: [],
//         });
//     }

//     // Step 3: Send the response
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'Combos retrieved successfully',
//         // totalData: totalCount,  // Include the total count here
//         data: combos,
//     });
// });

const findDashboardCouponNotApplied = catchAsync(async (req, res, next: NextFunction) => {
    const { page = 1, limit = 10, searchTerm = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Step 1: Fetch products using the service
    const couponNotApplied = await CouponNotAppliedServices.findDashboardCouponNotAppliedServices(limitNumber, skip, searchTerm as '');

    // Step 2: Check if no data is found
    // if (!couponNotApplied || couponNotApplied.length === 0) {
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
        message: 'Dashboard Coupon Not Applied data list retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: couponNotApplied,
    });
});

// get single product
// const findSingleCombo = catchAsync(async (req, res, next: NextFunction) => {
//     const { id } = req.params; // Get all query parameters

//     // Step 1: Fetch product using the service
//     const combo = await CouponNotAppliedServices.findSingleCouponNotAppliedServices(id);

//     // Step 2: Check if no data is found
//     if (!combo) {
//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.NO_CONTENT,
//             message: 'No data found.',
//             data: [],
//         });
//     }



//     // Step 4: Send the response
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'Single combo retrieved successfully',
//         data: combo,
//     });
// });

// get combos by IDs
// const findCombosByIds = catchAsync(async (req, res, next: NextFunction) => {
//     const { ids } = req.body; // Get all query parameters

//     // Step 1: Fetch product using the service
//     const combo = await CouponNotAppliedServices.findCombosByIdsServices(ids);

//     // Step 2: Check if no data is found
//     if (!combo) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: 'No data found.',
//             data: [],
//         });
//     }

//     // Step 4: Send the response
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'Combos by IDs retrieved successfully',
//         data: combo,
//     });
// });

const updateCouponNotApplied = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const couponNotAppliedId = req.params.id;
        const requestData = req.body;

        // Handle coupon_not_applied_products parsing
        // if (requestData.coupon_not_applied_products && typeof requestData.coupon_not_applied_products === "string") {
        //     try {
        //         requestData.coupon_not_applied_products = JSON.parse(requestData.coupon_not_applied_products);
        //     } catch (err) {
        //         throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon_not_applied_products format. Must be a valid JSON array.");
        //     }
        // }

        // Inline check for existing products
        const productIds = requestData.coupon_not_applied_products
            .filter((p: any) => Types.ObjectId.isValid(p.product_id))
            .map((p: any) => Types.ObjectId.createFromHexString(p.product_id));

        const existingEntries = await CouponNotAppliedModel.find({
            "coupon_not_applied_products.product_id": { $in: productIds }
        });

        if (existingEntries.length > 0) {
            const existingIds: string[] = [];
            existingEntries.forEach((entry: any) => {
                entry.coupon_not_applied_products.forEach((p: any) => {
                    if (productIds.some((id: any) => id.equals(p.product_id))) {
                        existingIds.push(p.product_id.toString());
                    }
                });
            });

            throw new AppError(httpStatus.CONFLICT, `Products already exist: ${[...new Set(existingIds)].join(", ")}`);
        }

        // Construct coupon not applied data object
        const couponNotAppliedData: ICouponNotApplied = {
            ...requestData,
            coupon_not_applied_products: requestData.coupon_not_applied_products, //parsedCouponNotAppliedProducts,
            // coupon_not_applied_publisher_id: req.user?._id, // Assuming req.user is populated via middleware
            // coupon_not_applied_updated_by: req.user?._id,   // Same as above
        };

        const result = await CouponNotAppliedServices.updateCouponNotAppliedServices(couponNotAppliedData);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Info updated successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
});

const deleteCouponNotApplied = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const couponNotAppliedId = req.params.id;
        const result = await CouponNotAppliedServices.deleteCouponNotAppliedServices(couponNotAppliedId);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Coupon not applied list data deleted successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
});


export const CouponNotAppliedController = {
    createCouponNotApplied,
    //findAllCombo,
    findDashboardCouponNotApplied,
    //findSingleCombo,
    // findCombosByIds,
    updateCouponNotApplied,
    deleteCouponNotApplied,
}