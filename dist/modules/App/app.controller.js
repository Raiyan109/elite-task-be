"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppControllers = exports.findFilteredCategoriesApp = exports.getCommonCategoryDataApp = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const app_service_1 = require("./app.service");
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const findBannerAndReels = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield app_service_1.AppServices.findBannerAndReelsServices(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Banner and Reels for app home page retrieved successfully',
        data: result,
    });
}));
const findCategoryWiseProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.params;
    const { user_id } = req.query;
    console.log(user_id, 'user_id from categoryWiseProducts');
    const result = yield app_service_1.AppServices.findCategoryWiseProductsServices(query, user_id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category wise products for app home page retrieved successfully',
        data: result,
    });
}));
const findCategoryWiseSubcategories = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.params;
    console.log(query);
    const result = yield app_service_1.AppServices.findCategoryWiseSubcategoriesServices(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Category wise sub categories with child categories for app home page retrieved successfully',
        data: result,
    });
}));
const findCategoryWiseOnlySubcategories = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const query = req.params
    // console.log(query);
    const { category, subcategory_id } = req.params;
    const result = yield app_service_1.AppServices.findCategoryWiseOnlySubcategoriesServices({ category, subcategory_id, });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: subcategory_id
            ? "Childcategories retrieved successfully"
            : "Category wise subcategories retrieved successfully",
        data: result,
    });
}));
const findCategorySectionWiseAllProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.params;
    const result = yield app_service_1.AppServices.findCategorySectionWiseAllProductsServices(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: `${query === null || query === void 0 ? void 0 : query.section} products for category ${query === null || query === void 0 ? void 0 : query.category} retrieved successfully`,
        data: result,
    });
}));
const findAllPopularProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = yield app_service_1.AppServices.findAllPopularProductsServices(page, limit);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All popular products for app retrieved successfully',
        data: result,
    });
}));
const findAllOfferedProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = yield app_service_1.AppServices.findAllOfferedProductsServices(page, limit);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All offered products for app retrieved successfully',
        data: result,
    });
}));
const findAllHotDealsProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = yield app_service_1.AppServices.findAllHotDealProductsServices(page, limit);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All hot deal products for app retrieved successfully',
        data: result,
    });
}));
const findAllComboProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = yield app_service_1.AppServices.findAllComboProductsServices(page, limit);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All combo products for app retrieved successfully',
        data: result,
    });
}));
const findAllNestleBrandProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const query = req.params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = yield app_service_1.AppServices.findAllNestleBrandProductsServices(/*query*/ page, limit);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All Nestle products for app retrieved successfully',
        data: result,
    });
}));
const findAllUnileverBrandProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const query = req.params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = yield app_service_1.AppServices.findAllUnileverBrandProductsServices(/*query*/ page, limit);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'All Unilever products for app retrieved successfully',
        data: result,
    });
}));
const findSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield app_service_1.AppServices.findSingleProductServices(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Single product for app retrieved successfully',
        data: result,
    });
}));
const findSingleCombo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield app_service_1.AppServices.findSingleComboServices(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Single combo for app retrieved successfully',
        data: result,
    });
}));
exports.getCommonCategoryDataApp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_slug } = req.params;
    // console.log(category_slug);
    const result = yield (0, app_service_1.getCommonCategoryDataAppService)(category_slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Common category data retrieved successfully",
        data: result
    });
}));
exports.findFilteredCategoriesApp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield (0, app_service_1.findFilteredCategoriesAppService)();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Common Categories fetched successfully",
        data: categories,
    });
}));
// get all active product
const findAllProductApp = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield app_service_1.AppServices.findAllProductServicesApp(query);
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
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Active Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
const findUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // console.log(req.user);
    const result = yield app_service_1.AppServices.findUserByIdServices((user === null || user === void 0 ? void 0 : user.user_phone) ? user === null || user === void 0 ? void 0 : user.user_phone : user === null || user === void 0 ? void 0 : user.user_email);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Logged-In User retrieved successfully',
        data: result,
    });
}));
const updateUserProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    console.log("Update User Controller", req.body, user_id);
    // user profile image upload
    let user_profile;
    let user_profile_key;
    if (req.files && 'user_profile' in req.files) {
        const userImage = req.files['user_profile'][0];
        const user_profile_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(userImage);
        user_profile = user_profile_upload.Location;
        user_profile_key = user_profile_upload.Key;
    }
    const userData = Object.assign(Object.assign({}, req.body), { user_profile,
        user_profile_key });
    const result = yield app_service_1.AppServices.updateUserProfileServices(user_id, userData);
    if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.user_profile_key) {
        yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(req.body.user_profile_key);
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User updated successfully',
        data: result,
    });
}));
const findRecentOrdersByUserId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield app_service_1.AppServices.findRecentOrdersByUserIdServices(user_id, limitNumber, skip);
    (0, sendResponse_1.default)(res, {
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
}));
const findMyOrdersByUserId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield app_service_1.AppServices.findMyOrdersByUserIdServices(user_id, limitNumber, skip);
    (0, sendResponse_1.default)(res, {
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
}));
const findRefundByUserId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield app_service_1.AppServices.findRefundByUserIdService(userId, limitNumber, skip);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Refunds by user id fetched successfully!',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
}));
exports.AppControllers = {
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
    findRecentOrdersByUserId,
    findMyOrdersByUserId,
    findRefundByUserId
};
