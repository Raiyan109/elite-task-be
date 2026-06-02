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
exports.ComboController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const combo_service_1 = require("./combo.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_constant_1 = require("../Product/product.constant");
const createCombo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && "combo_image" in req.files && req.body) {
            const requestData = req.body;
            const combo_slug = yield (0, product_constant_1.generateUniqueSlug)(requestData === null || requestData === void 0 ? void 0 : requestData.combo_title);
            requestData.combo_slug = combo_slug;
            // Parse combo_products (it's sent as stringified JSON)
            let parsedComboProducts;
            try {
                parsedComboProducts = JSON.parse(requestData.combo_products);
            }
            catch (err) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid combo_products format. Must be a valid JSON array.");
            }
            // Upload combo image
            let combo_image;
            let combo_image_key;
            const comboImage = (_a = req.files["combo_image"]) === null || _a === void 0 ? void 0 : _a[0];
            if (comboImage) {
                const uploadResult = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(comboImage);
                combo_image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Location;
                combo_image_key = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Key;
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Combo image file is missing.");
            }
            // Construct combo data object
            const comboData = Object.assign(Object.assign({}, requestData), { combo_products: parsedComboProducts, combo_image,
                combo_image_key, combo_slug: combo_slug });
            const result = yield combo_service_1.ComboServices.createComboServices(comboData);
            if (result) {
                return (0, sendResponse_1.default)(res, {
                    success: true,
                    statusCode: http_status_1.default.OK,
                    message: "Combo Added Successfully!",
                    data: result,
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Combo creation failed.");
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
const findAllCombo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const combos = yield combo_service_1.ComboServices.findComboServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!combos || combos.length === 0) {
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
        message: 'Combos retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: combos,
    });
}));
const findRelatedCombos = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // comboId you want to exclude
    const combos = yield combo_service_1.ComboServices.findRelatedComboServices(id);
    if (!combos || combos.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: "No Related combos found.",
            data: [],
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Related combos retrieved successfully",
        data: combos,
    });
}));
const findDashboardCombo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, searchTerm = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    // Step 1: Fetch products using the service
    const combos = yield combo_service_1.ComboServices.findDashboardComboServices(limitNumber, skip, searchTerm);
    // Step 2: Check if no data is found
    if (!combos || combos.length === 0) {
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
        message: 'Dashboard combos retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: combos,
    });
}));
// get single product
const findSingleCombo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get all query parameters
    // Step 1: Fetch product using the service
    const combo = yield combo_service_1.ComboServices.findSingleComboServices(id);
    // Step 2: Check if no data is found
    if (!combo) {
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
        message: 'Single combo retrieved successfully',
        data: combo,
    });
}));
// get combos by IDs
const findCombosByIds = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body; // Get all query parameters
    // Step 1: Fetch product using the service
    const combo = yield combo_service_1.ComboServices.findCombosByIdsServices(ids);
    // Step 2: Check if no data is found
    if (!combo) {
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
        message: 'Combos by IDs retrieved successfully',
        data: combo,
    });
}));
const updateCombo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const comboId = req.params.id;
        const requestData = req.body;
        // Handle optional combo image update
        if (req.files && "combo_image" in req.files) {
            const comboImage = (_a = req.files["combo_image"]) === null || _a === void 0 ? void 0 : _a[0];
            if (comboImage) {
                const uploadResult = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(comboImage);
                requestData.combo_image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Location;
                requestData.combo_image_key = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Key;
            }
        }
        // Handle combo_products parsing
        if (requestData.combo_products && typeof requestData.combo_products === "string") {
            try {
                requestData.combo_products = JSON.parse(requestData.combo_products);
            }
            catch (err) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid combo_products format. Must be a valid JSON array.");
            }
        }
        // Optional slug regeneration
        if (requestData.combo_title) {
            requestData.combo_slug = yield (0, product_constant_1.generateUniqueSlug)(requestData.combo_title);
        }
        const result = yield combo_service_1.ComboServices.updateComboServices(comboId, requestData);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Combo updated successfully!",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
const deleteCombo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comboId = req.params.id;
        const result = yield combo_service_1.ComboServices.deleteComboServices(comboId);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Combo deleted successfully!",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.ComboController = {
    createCombo,
    findAllCombo,
    findRelatedCombos,
    findDashboardCombo,
    findSingleCombo,
    findCombosByIds,
    updateCombo,
    deleteCombo,
};
