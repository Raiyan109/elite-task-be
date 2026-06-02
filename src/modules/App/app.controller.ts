import { NextFunction } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AppServices, findFilteredCategoriesAppService, getCommonCategoryDataAppService } from "./app.service";
import httpStatus from 'http-status';
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { IRefund } from "../Refund/refund.interface";
import AppError from "../../errors/AppError";

const findBannerAndReels = catchAsync(async (req, res) => {
    const query = req.query
    const result = await AppServices.findBannerAndReelsServices(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Banner and Reels for app home page retrieved successfully',
        data: result,
    });
});

const findCategoryWiseProducts = catchAsync(async (req, res) => {
    const query = req.params
    const { user_id } = req.query
    console.log(user_id, 'user_id from categoryWiseProducts');

    const result = await AppServices.findCategoryWiseProductsServices(query, user_id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Category wise products for app home page retrieved successfully',
        data: result,
    });
});

const findCategoryWiseSubcategories = catchAsync(async (req, res) => {
    const query = req.params
    console.log(query);

    const result = await AppServices.findCategoryWiseSubcategoriesServices(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Category wise sub categories with child categories for app home page retrieved successfully',
        data: result,
    });
});

const findCategoryWiseOnlySubcategories = catchAsync(async (req, res) => {
    // const query = req.params
    // console.log(query);

    const { category, subcategory_id } = req.params;

    const result = await AppServices.findCategoryWiseOnlySubcategoriesServices({ category, subcategory_id, });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: subcategory_id
            ? "Childcategories retrieved successfully"
            : "Category wise subcategories retrieved successfully",
        data: result,
    });
});

const findCategorySectionWiseAllProducts = catchAsync(async (req, res) => {
    const query = req.params

    const result = await AppServices.findCategorySectionWiseAllProductsServices(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `${query?.section} products for category ${query?.category} retrieved successfully`,
        data: result,
    });
});

const findAllPopularProducts = catchAsync(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AppServices.findAllPopularProductsServices(page, limit);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All popular products for app retrieved successfully',
        data: result,
    });
});

const findAllOfferedProducts = catchAsync(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AppServices.findAllOfferedProductsServices(page, limit);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All offered products for app retrieved successfully',
        data: result,
    });
});

const findAllHotDealsProducts = catchAsync(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AppServices.findAllHotDealProductsServices(page, limit);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All hot deal products for app retrieved successfully',
        data: result,
    });
});

const findAllComboProducts = catchAsync(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AppServices.findAllComboProductsServices(page, limit);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All combo products for app retrieved successfully',
        data: result,
    });
});

const findAllNestleBrandProducts = catchAsync(async (req, res) => {
    // const query = req.params

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AppServices.findAllNestleBrandProductsServices(/*query*/page, limit);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All Nestle products for app retrieved successfully',
        data: result,
    });
});

const findAllUnileverBrandProducts = catchAsync(async (req, res) => {
    // const query = req.params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await AppServices.findAllUnileverBrandProductsServices(/*query*/page, limit);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'All Unilever products for app retrieved successfully',
        data: result,
    });
});

const findSingleProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await AppServices.findSingleProductServices(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Single product for app retrieved successfully',
        data: result,
    });
});

const findSingleCombo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await AppServices.findSingleComboServices(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Single combo for app retrieved successfully',
        data: result,
    });
});

export const getCommonCategoryDataApp = catchAsync(async (req, res) => {
    const { category_slug } = req.params;

    // console.log(category_slug);


    const result = await getCommonCategoryDataAppService(category_slug as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Common category data retrieved successfully",
        data: result
    });
});

export const findFilteredCategoriesApp = catchAsync(async (req, res) => {
    const categories = await findFilteredCategoriesAppService();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Common Categories fetched successfully",
        data: categories,
    });
});

// get all active product
const findAllProductApp = catchAsync(async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters

    // Step 1: Fetch products using the service
    const { products, totalCount } = await AppServices.findAllProductServicesApp(
        query
    );

    //console.log(products.length);

    // // Step 2: Check if no data is found
    // if (!products || products.length === 0) {
    //   return sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.NO_CONTENT,
    //     message: "No data found.",
    //     data: [],
    //   });
    // }

    // Step 3: Send the response
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Active Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
});

const findUserById = catchAsync(async (req, res) => {
    const user = req.user;
    // console.log(req.user);

    const result = await AppServices.findUserByIdServices(user?.user_phone ? user?.user_phone : user?.user_email);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Logged-In User retrieved successfully',
        data: result,
    });

});

const updateUserProfile = catchAsync(async (req, res) => {
    const user_id = req.user?._id;
    console.log("Update User Controller", req.body, user_id);

    // user profile image upload
    let user_profile;
    let user_profile_key;

    if (req.files && 'user_profile' in req.files) {
        const userImage = req.files['user_profile'][0];
        const user_profile_upload = await FileUploadHelper.uploadToSpaces(userImage)

        user_profile = user_profile_upload.Location;
        user_profile_key = user_profile_upload.Key;
    }

    const userData = {
        ...req.body,
        user_profile,
        user_profile_key,
    };
    const result = await AppServices.updateUserProfileServices(user_id, userData);

    if (req.body?.user_profile_key) {
        await FileUploadHelper.deleteFromSpaces(req.body.user_profile_key)
    }

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User updated successfully',
        data: result,
    });
});


const findRecentTransactionsByUserId = catchAsync(async (req, res) => {
    // const { user_id } = req.params;
    const user_id = req?.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await AppServices.findRecentTransactionsByUserIdServices(user_id, limitNumber, skip)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transactions by user id retrieved successfully',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
});


const findMyOrdersByUserId = catchAsync(async (req, res) => {
    // const { user_id } = req.params;
    const user_id = req?.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await AppServices.findMyOrdersByUserIdServices(user_id, limitNumber, skip)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Orders by user id retrieved successfully',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
});


const findRefundByUserId = catchAsync(async (req, res) => {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await AppServices.findRefundByUserIdService(userId, limitNumber, skip);
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

const getAddressApp = catchAsync(async (req, res) => {
    const id = req?.user?._id;

    const result = await AppServices.getAddressServiceApp(id);

    if (result.length === 0) {
        throw new AppError(404, "No data found");
    }



    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Address info retrieved successfully',
        data: result,
    });

});

const getUserNameWalletAmount = catchAsync(
    async (req, res) => {

        const user_id = req?.user?._id;

        const users = await AppServices.getUserNameWalletAmountService(user_id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "user wallet info fetched successfully",
            data: users,
        });
    }
);

export const AppControllers = {
    findBannerAndReels,
    findCategoryWiseProducts,
    findCategoryWiseSubcategories,
    findCategoryWiseOnlySubcategories,
    findCategorySectionWiseAllProducts,
    findAllPopularProducts,
    findAllOfferedProducts,
    findAllHotDealsProducts,
    findAllComboProducts,
    findAllNestleBrandProducts,
    findAllUnileverBrandProducts,
    findSingleProduct,
    findSingleCombo,
    findAllProductApp,
    findUserById,
    updateUserProfile,
    findRecentTransactionsByUserId,
    findMyOrdersByUserId,
    findRefundByUserId,
    getAddressApp,
    getUserNameWalletAmount
}