import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { OfferServices } from "./offer.service";
import sendResponse from "../../utils/sendResponse";
import { IOffer } from "./offer.interface";
import httpStatus from 'http-status'
import AppError from "../../errors/AppError";
import { generateUniqueSlug } from "../Product/product.constant";


const createOffer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.files && "offer_image" in req.files && req.body) {
            const requestData = req.body;

            const offer_slug = await generateUniqueSlug(requestData?.offer_title);
            requestData.offer_slug = offer_slug;

            // Parse offer_product (it's sent as stringified JSON)
            let parsedOfferProducts;
            try {
                parsedOfferProducts = JSON.parse(requestData.offer_product);
            } catch (err) {
                throw new AppError(httpStatus.BAD_REQUEST, "Invalid offer_product format. Must be a valid JSON array.");
            }

            // Upload offer image
            let offer_image;
            let offer_image_key;

            const offerImage = req.files["offer_image"]?.[0];
            if (offerImage) {
                const uploadResult = await FileUploadHelper.uploadToSpaces(offerImage);
                offer_image = uploadResult?.Location;
                offer_image_key = uploadResult?.Key;
            } else {
                throw new AppError(httpStatus.BAD_REQUEST, "Offer image file is missing.");
            }

            // Construct offer data object
            const offerData: IOffer = {
                ...requestData,
                offer_product: parsedOfferProducts,
                offer_image,
                offer_image_key,
                offer_slug: offer_slug,
                // offer_publisher_id: req.user?._id, // Assuming req.user is populated via middleware
                // offer_updated_by: req.user?._id,   // Same as above
            };

            const result = await OfferServices.createOfferServices(offerData);

            if (result) {
                return sendResponse<IOffer>(res, {
                    success: true,
                    statusCode: httpStatus.OK,
                    message: "Offer Added Successfully!",
                    data: result,
                });
            } else {
                throw new AppError(httpStatus.BAD_REQUEST, "Offer creation failed.");
            }
        } else {
            throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed or request body is incomplete.");
        }
    } catch (error: any) {
        next(error);
    }
});

const findAllOffer = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters


    // Step 1: Fetch products using the service
    const offers = await OfferServices.findAllOfferServices();

    //console.log(products.length);


    // Step 2: Check if no data is found
    if (!offers || offers.length === 0) {
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
        message: 'Offers retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: offers,
    });
});

const findAllWeekdayOffer = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters


    // Step 1: Fetch products using the service
    const offers = await OfferServices.findWeekdayOfferServices();

    //console.log(products.length);


    // Step 2: Check if no data is found
    if (!offers || offers.length === 0) {
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
        message: 'Weekday Offers retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: offers,
    });
});

const findDashboardOffer = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters


    // Step 1: Fetch products using the service
    const {offers, totalCount} = await OfferServices.findDashboardOfferServices(query);

    //console.log(products.length);


    // Step 2: Check if no data is found
    // if (!offers || offers.length === 0) {
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
        message: 'Dashboard offers retrieved successfully',
        totalData: totalCount,  // Include the total count here
        data: offers,
    });
});

// get single offer
const findSingleOffer = catchAsync(async (req, res, next: NextFunction) => {
    const { id } = req.params; // Get all query parameters

    // Step 1: Fetch product using the service
    const offer = await OfferServices.findSingleOfferServices(id);

    // Step 2: Check if no data is found
    if (!offer) {
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
        message: 'Single offer retrieved successfully',
        data: offer,
    });
});

// get offers by IDs
const findOffersByIds = catchAsync(async (req, res, next: NextFunction) => {
    const { ids } = req.body; // Get all query parameters

    // Step 1: Fetch product using the service
    const offer = await OfferServices.findOffersByIdsServices(ids);

    // Step 2: Check if no data is found
    if (!offer) {
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
        message: 'Offers by IDs retrieved successfully',
        data: offer,
    });
});

export const OfferController = {
    createOffer,
    findAllWeekdayOffer,
    findDashboardOffer,
    findSingleOffer,
    findOffersByIds,
    findAllOffer,
}