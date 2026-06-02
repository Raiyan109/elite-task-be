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
exports.HotDealController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const hotDeal_service_1 = require("./hotDeal.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_constant_1 = require("../Product/product.constant");
const hotDeal_model_1 = require("./hotDeal.model");
const mongoose_1 = require("mongoose");
const createHotDeal = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && "hotDeal_image" in req.files && req.body) {
            const requestData = req.body;
            const hotDeal_slug = yield (0, product_constant_1.generateUniqueSlug)(requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_title);
            requestData.hotDeal_slug = hotDeal_slug;
            // Parse hotDeal_products (it's sent as stringified JSON)
            let parsedHotDealProducts;
            try {
                parsedHotDealProducts = JSON.parse(requestData.hotDeal_products);
            }
            catch (err) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid hotDeal_products format. Must be a valid JSON array.");
            }
            // Upload hotDeal image
            let hotDeal_image;
            let hotDeal_image_key;
            const hotDealImage = (_a = req.files["hotDeal_image"]) === null || _a === void 0 ? void 0 : _a[0];
            if (hotDealImage) {
                const uploadResult = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(hotDealImage);
                hotDeal_image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Location;
                hotDeal_image_key = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Key;
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "HotDeal image file is missing.");
            }
            // Construct hotDeal data object
            const hotDealData = Object.assign(Object.assign({}, requestData), { hotDeal_products: parsedHotDealProducts, hotDeal_image,
                hotDeal_image_key, hotDeal_slug: hotDeal_slug });
            const result = yield hotDeal_service_1.HotDealServices.createHotDealServices(hotDealData);
            if (result) {
                return (0, sendResponse_1.default)(res, {
                    success: true,
                    statusCode: http_status_1.default.OK,
                    message: "HotDeal Added Successfully!",
                    data: result,
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "HotDeal creation failed.");
            }
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Image upload failed or request body is incomplete.");
        }
    }
    catch (error) {
        next(error);
    }
}));
const findAllHotDeal = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const hotDeals = yield hotDeal_service_1.HotDealServices.findHotDealServices();
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
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'HotDeals retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: hotDeals,
    });
}));
const findDashboardHotDeal = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const hotDeals = yield hotDeal_service_1.HotDealServices.findDashboardHotDealServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!hotDeals || hotDeals.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: 'No data found.',
            data: [],
        });
    }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard hotDeals retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: hotDeals,
    });
}));
// get single product
const findSingleHotDeal = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get all query parameters
    // Step 1: Fetch product using the service
    const hotDeal = yield hotDeal_service_1.HotDealServices.findSingleHotDealServices(id);
    // Step 2: Check if no data is found
    if (!hotDeal) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: 'No data found.',
            data: [],
        });
    }
    // Step 4: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Single hotDeal retrieved successfully',
        data: hotDeal,
    });
}));
// get hotDeals by IDs
const findHotDealsByIds = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body; // Get all query parameters
    // Step 1: Fetch product using the service
    const hotDeal = yield hotDeal_service_1.HotDealServices.findHotDealsByIdsServices(ids);
    // Step 2: Check if no data is found
    if (!hotDeal) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }
    // Step 4: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'HotDeals by IDs retrieved successfully',
        data: hotDeal,
    });
}));
const updateHotDeal = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const requestData = req.body;
        const updateData = {};
        // Handle title update and generate new slug if title changes
        if (requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_title) {
            updateData.hotDeal_title = requestData.hotDeal_title;
            const hotDeal_slug = yield (0, product_constant_1.generateUniqueSlug)(requestData.hotDeal_title);
            updateData.hotDeal_slug = hotDeal_slug;
        }
        // Handle description update
        if ((requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_description) !== undefined) {
            updateData.hotDeal_description = requestData.hotDeal_description;
        }
        // Handle status update
        if (requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_status) {
            updateData.hotDeal_status = requestData.hotDeal_status;
        }
        // Handle dates update
        if (requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_start_date) {
            updateData.hotDeal_start_date = requestData.hotDeal_start_date;
        }
        if (requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_end_date) {
            updateData.hotDeal_end_date = requestData.hotDeal_end_date;
        }
        // Handle delivery option update
        if ((requestData === null || requestData === void 0 ? void 0 : requestData.is_delivery_dhaka_only) !== undefined) {
            updateData.is_delivery_dhaka_only = requestData.is_delivery_dhaka_only;
        }
        // Handle products update
        if (requestData === null || requestData === void 0 ? void 0 : requestData.hotDeal_products) {
            try {
                // updateData.hotDeal_products = JSON.parse(requestData.hotDeal_products);
                const parsedProducts = JSON.parse(requestData.hotDeal_products);
                // console.log(parsedProducts);
                if (!Array.isArray(parsedProducts)) {
                    throw new Error();
                }
                updateData.hotDeal_products = parsedProducts.map((product) => ({
                    product_id: new mongoose_1.Types.ObjectId(String(product.product_id)),
                    discount_amount: product.discount_amount,
                }));
            }
            catch (err) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid hotDeal_products format. Must be a valid JSON array.");
            }
        }
        // Handle image update if new image is provided
        if (req.files && "hotDeal_image" in req.files) {
            const hotDealImage = (_a = req.files["hotDeal_image"]) === null || _a === void 0 ? void 0 : _a[0];
            if (hotDealImage) {
                // First delete the old image if it exists
                const existingHotDeal = yield hotDeal_model_1.HotDealModel.findOne();
                if (existingHotDeal === null || existingHotDeal === void 0 ? void 0 : existingHotDeal.hotDeal_image_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(existingHotDeal.hotDeal_image_key);
                }
                // Upload new image
                const uploadResult = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(hotDealImage);
                updateData.hotDeal_image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Location;
                updateData.hotDeal_image_key = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Key;
            }
        }
        // Update the updated_by field
        updateData.hotDeal_updated_by = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        const result = yield hotDeal_service_1.HotDealServices.updateHotDealServices(updateData);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: "Hot Deal Updated Successfully!",
                data: result,
            });
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Hot Deal update failed.");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.HotDealController = {
    createHotDeal,
    findAllHotDeal,
    findDashboardHotDeal,
    findSingleHotDeal,
    findHotDealsByIds,
    updateHotDeal
};
