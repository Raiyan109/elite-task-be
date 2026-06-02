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
exports.OfferController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const offer_service_1 = require("./offer.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_constant_1 = require("../Product/product.constant");
const createOffer = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && "offer_image" in req.files && req.body) {
            const requestData = req.body;
            const offer_slug = yield (0, product_constant_1.generateUniqueSlug)(requestData === null || requestData === void 0 ? void 0 : requestData.offer_title);
            requestData.offer_slug = offer_slug;
            // Parse offer_product (it's sent as stringified JSON)
            let parsedOfferProducts;
            try {
                parsedOfferProducts = JSON.parse(requestData.offer_product);
            }
            catch (err) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid offer_product format. Must be a valid JSON array.");
            }
            // Upload offer image
            let offer_image;
            let offer_image_key;
            const offerImage = (_a = req.files["offer_image"]) === null || _a === void 0 ? void 0 : _a[0];
            if (offerImage) {
                const uploadResult = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(offerImage);
                offer_image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Location;
                offer_image_key = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.Key;
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Offer image file is missing.");
            }
            // Construct offer data object
            const offerData = Object.assign(Object.assign({}, requestData), { offer_product: parsedOfferProducts, offer_image,
                offer_image_key, offer_slug: offer_slug });
            const result = yield offer_service_1.OfferServices.createOfferServices(offerData);
            if (result) {
                return (0, sendResponse_1.default)(res, {
                    success: true,
                    statusCode: http_status_1.default.OK,
                    message: "Offer Added Successfully!",
                    data: result,
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Offer creation failed.");
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
const findAllOffer = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const offers = yield offer_service_1.OfferServices.findAllOfferServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!offers || offers.length === 0) {
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
        message: 'Offers retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: offers,
    });
}));
const findAllWeekdayOffer = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const offers = yield offer_service_1.OfferServices.findWeekdayOfferServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!offers || offers.length === 0) {
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
        message: 'Weekday Offers retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: offers,
    });
}));
const findDashboardOffer = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { offers, totalCount } = yield offer_service_1.OfferServices.findDashboardOfferServices(query);
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
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard offers retrieved successfully',
        totalData: totalCount, // Include the total count here
        data: offers,
    });
}));
// get single offer
const findSingleOffer = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get all query parameters
    // Step 1: Fetch product using the service
    const offer = yield offer_service_1.OfferServices.findSingleOfferServices(id);
    // Step 2: Check if no data is found
    if (!offer) {
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
        message: 'Single offer retrieved successfully',
        data: offer,
    });
}));
// get offers by IDs
const findOffersByIds = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body; // Get all query parameters
    // Step 1: Fetch product using the service
    const offer = yield offer_service_1.OfferServices.findOffersByIdsServices(ids);
    // Step 2: Check if no data is found
    if (!offer) {
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
        message: 'Offers by IDs retrieved successfully',
        data: offer,
    });
}));
exports.OfferController = {
    createOffer,
    findAllWeekdayOffer,
    findDashboardOffer,
    findSingleOffer,
    findOffersByIds,
    findAllOffer,
};
