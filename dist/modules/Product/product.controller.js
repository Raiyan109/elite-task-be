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
exports.ProductControllers = exports.getCommonCategoryData = exports.skincareSectionsShowBulkUpdate = exports.fashionSectionsShowBulkUpdate = exports.getFashionSectionsForWebsiteShow = exports.getSkincareSectionsForWebsiteShow = exports.getPharmacySectionsForWebsiteShow = exports.pharmacySectionsShowBulkUpdate = exports.findProductsByBrandId = void 0;
const product_model_1 = __importDefault(require("./product.model"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const product_constant_1 = require("./product.constant");
const product_services_1 = require("./product.services");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
// Path to the upload folder
const uploadDir = path_1.default.join(__dirname, "../../../uploads");
// Post/create multiple images with product data
const postProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        if (req.files || req.body) {
            const requestData = req.body;
            // Check existing barcode if showProductVariation == "false"
            //     if (requestData?.showProductVariation == "false") {
            //  if (requestData?.barcode) {
            //       const barCodeCheck = await ProductModel.findOne({
            //         barcode: requestData?.barcode,
            //       }).session(session);
            //       if (barCodeCheck) {
            //         deleteAllFilesInDirectory(uploadDir);
            //         throw new AppError(
            //           httpStatus.BAD_REQUEST,
            //           "Barcode already exists"
            //         );
            //       }
            //     }
            //     }
            if (requestData === null || requestData === void 0 ? void 0 : requestData.barcode) {
                const barCodeCheck = yield product_model_1.default.findOne({
                    barcode: requestData === null || requestData === void 0 ? void 0 : requestData.barcode,
                });
                if (barCodeCheck) {
                    (0, product_constant_1.deleteAllFilesInDirectory)(uploadDir);
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Barcode already exists");
                }
            }
            // Check existing barcode if showProductVariation == "true"
            // if (
            //   requestData?.showProductVariation == "true" &&
            //   requestData?.variation_details
            // ) {
            //   // const variationDetails = JSON.parse(requestData?.variation_details);
            //   for (const variation of requestData?.variation_details) {
            //     const { variation_barcode } = variation;
            //     const barCodeCheck = await VariationModel.findOne({
            //       variation_barcode: variation_barcode,
            //     }).session(session);
            //     if (barCodeCheck) {
            //       deleteAllFilesInDirectory(uploadDir);
            //       throw new AppError(
            //         httpStatus.BAD_REQUEST,
            //         `Barcode "${variation_barcode}" already exists`
            //       );
            //     }
            //   }
            // }
            const files = req.files;
            // Array to store thumbnail_image data
            let thumbnail_image;
            let thumbnail_image_key;
            // Handle thumbnail image
            const thumbnailImage = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === "thumbnail_image");
            if (thumbnailImage) {
                const thumbnail_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(thumbnailImage);
                thumbnail_image = thumbnail_image_upload === null || thumbnail_image_upload === void 0 ? void 0 : thumbnail_image_upload.Location;
                thumbnail_image_key = thumbnail_image_upload === null || thumbnail_image_upload === void 0 ? void 0 : thumbnail_image_upload.Key;
            }
            else {
                thumbnail_image = requestData === null || requestData === void 0 ? void 0 : requestData.thumbnail_image;
                thumbnail_image_key = requestData === null || requestData === void 0 ? void 0 : requestData.thumbnail_image_key;
            }
            // Array to store additional_images URLs and keys
            const additional_images = [];
            // Handle additional_images
            const additionalImageFiles = files === null || files === void 0 ? void 0 : files.filter((file) => file.fieldname.startsWith("additional_images"));
            for (const file of additionalImageFiles) {
                const imageUpload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                additional_images.push({
                    additional_image: imageUpload.Location,
                    additional_image_key: imageUpload.Key,
                });
            }
            if (requestData === null || requestData === void 0 ? void 0 : requestData.additional_default_images) {
                // Assuming requestData?.additional_default_images is defined as shown
                const additionalImages = requestData === null || requestData === void 0 ? void 0 : requestData.additional_default_images;
                // Combine `additional_image` and `additional_image_key` into objects, filtering out `undefined` values
                const formattedImages = additionalImages.additional_image
                    .map((image, index) => {
                    const key = additionalImages.additional_image_key[index];
                    // Skip if either `image` or `key` is `undefined`
                    if (image === "undefined" || key === "undefined")
                        return null;
                    return { additional_image: image, additional_image_key: key };
                })
                    .filter(Boolean); // Remove any null values from the array
                additional_images.push(...formattedImages);
            }
            // Generate a unique slug for the product
            const product_slug = yield (0, product_constant_1.generateUniqueSlug)(requestData === null || requestData === void 0 ? void 0 : requestData.product_name);
            requestData.product_slug = product_slug;
            // let barcode: any;
            // barcode = await generateQRCode();
            // //console.log(barcode);
            // requestData.barcode = requestData?.barcode
            //   ? requestData?.barcode
            //   : barcode;
            // requestData.product_barcode_image = await QRCode.toDataURL(
            //   requestData?.product_barcode
            // );
            // if (requestData?.showProductVariation == "false") {
            // }
            // Create product object
            const productData = {
                product_name: requestData === null || requestData === void 0 ? void 0 : requestData.product_name,
                // product_article_number: requestData?.product_article_number,
                product_slug: requestData === null || requestData === void 0 ? void 0 : requestData.product_slug,
                product_sku: requestData === null || requestData === void 0 ? void 0 : requestData.product_sku,
                // product_barcode: requestData?.product_barcode,
                product_status: requestData === null || requestData === void 0 ? void 0 : requestData.product_status,
                product_inactivity_start: requestData === null || requestData === void 0 ? void 0 : requestData.product_inactivity_start,
                product_inactivity_end: requestData === null || requestData === void 0 ? void 0 : requestData.product_inactivity_end,
                category_id: requestData === null || requestData === void 0 ? void 0 : requestData.category_id,
                subcategory_id: (requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_id)
                    ? requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_id
                    : undefined,
                childcategory_id: (requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_id)
                    ? requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_id
                    : undefined,
                // attributes_details: Object.values(requestData?.attributes_details ?? {})
                //   .filter(
                //     (att: any) =>
                //       att?.attribute_name !== undefined &&
                //       att?.attribute_values?.length > 0
                //   )
                //   .map((att: any) => ({
                //     attribute_name: att?.attribute_name,
                //     attribute_values:
                //       att?.attribute_values?.map(
                //         (value: { attribute_value_name: any }) => ({
                //           attribute_value_name:
                //             value?.attribute_value_name ?? undefined,
                //         })
                //       ) ?? [],
                //   })),
                product_barcode: (_a = requestData === null || requestData === void 0 ? void 0 : requestData.product_barcode) !== null && _a !== void 0 ? _a : "",
                product_barcode_image: (_b = requestData === null || requestData === void 0 ? void 0 : requestData.product_barcode_image) !== null && _b !== void 0 ? _b : "",
                description: (_c = requestData === null || requestData === void 0 ? void 0 : requestData.description) !== null && _c !== void 0 ? _c : "",
                thumbnail_image: thumbnail_image,
                thumbnail_image_key: thumbnail_image_key,
                additional_images: additional_images !== null && additional_images !== void 0 ? additional_images : [],
                product_price: (requestData === null || requestData === void 0 ? void 0 : requestData.product_price) && parseFloat(requestData === null || requestData === void 0 ? void 0 : requestData.product_price),
                product_buying_price: (requestData === null || requestData === void 0 ? void 0 : requestData.product_buying_price) &&
                    parseFloat(requestData === null || requestData === void 0 ? void 0 : requestData.product_buying_price),
                product_discount_price: (requestData === null || requestData === void 0 ? void 0 : requestData.product_discount_price) &&
                    parseFloat(requestData === null || requestData === void 0 ? void 0 : requestData.product_discount_price),
                product_quantity: (requestData === null || requestData === void 0 ? void 0 : requestData.product_quantity) &&
                    parseInt(requestData === null || requestData === void 0 ? void 0 : requestData.product_quantity),
                product_alert_quantity: (requestData === null || requestData === void 0 ? void 0 : requestData.product_alert_quantity) &&
                    parseInt(requestData === null || requestData === void 0 ? void 0 : requestData.product_alert_quantity),
                // is_variation: requestData?.is_variation === "true",
                product_warrenty: (_d = requestData === null || requestData === void 0 ? void 0 : requestData.product_warrenty) !== null && _d !== void 0 ? _d : "",
                product_return: (_e = requestData === null || requestData === void 0 ? void 0 : requestData.product_return) !== null && _e !== void 0 ? _e : "",
                unit: (_f = requestData === null || requestData === void 0 ? void 0 : requestData.unit) !== null && _f !== void 0 ? _f : "",
                unit_quantity: (requestData === null || requestData === void 0 ? void 0 : requestData.unit_quantity) && parseInt(requestData === null || requestData === void 0 ? void 0 : requestData.unit_quantity),
                meta_title: (_g = requestData === null || requestData === void 0 ? void 0 : requestData.meta_title) !== null && _g !== void 0 ? _g : "",
                meta_description: (_h = requestData === null || requestData === void 0 ? void 0 : requestData.meta_description) !== null && _h !== void 0 ? _h : "",
                meta_keywords: typeof (requestData === null || requestData === void 0 ? void 0 : requestData.meta_keywords) === "string"
                    ? JSON.parse(requestData === null || requestData === void 0 ? void 0 : requestData.meta_keywords)
                    : (requestData === null || requestData === void 0 ? void 0 : requestData.meta_keywords) || [],
                // product_publisher_id: requestData?.product_publisher_id,
                // product_supplier_id: requestData?.product_supplier_id || null,
                product_is_delivery_dhaka_only: (_j = requestData === null || requestData === void 0 ? void 0 : requestData.product_is_delivery_dhaka_only) !== null && _j !== void 0 ? _j : false,
                // popular_product_show: requestData?.popular_product_show ?? false,
                // bestselling_product_show: requestData?.bestselling_product_show ?? false,
                offered_product_show: (_k = requestData === null || requestData === void 0 ? void 0 : requestData.offered_product_show) !== null && _k !== void 0 ? _k : false,
                video_url: (requestData === null || requestData === void 0 ? void 0 : requestData.video_url) ? requestData === null || requestData === void 0 ? void 0 : requestData.video_url : "",
                // is_flat_discount_show: requestData?.is_flat_discount_show ? requestData?.is_flat_discount_show : false,
                // is_percent_discount_show: requestData?.is_percent_discount_show ? requestData?.is_percent_discount_show : false,
                discount_show: (requestData === null || requestData === void 0 ? void 0 : requestData.discount_show)
                    ? requestData === null || requestData === void 0 ? void 0 : requestData.discount_show
                    : "",
                brand_id: (requestData === null || requestData === void 0 ? void 0 : requestData.brand_id) ? requestData === null || requestData === void 0 ? void 0 : requestData.brand_id : null,
            };
            // Save product in the database
            const newProduct = yield product_services_1.ProductServices.postProductServices(productData);
            // const newProduct: any = await ProductServices.postProductServices(productData, session);
            // if (requestData?.showProductVariation == "true") {
            //   const variation_details = req?.body?.variation_details; //have to remove JSON Parse when working with frontend
            //   // Process variation_details images
            //   const updatedVariation_details: any = [];
            //   for (let index = 0; index < variation_details?.length; index++) {
            //     let product = variation_details[index];
            //     console.log(product);
            //     product.product_id = newProduct?._id?.toString();
            //     const matchingFiles = files.filter(
            //       (file) =>
            //         file.fieldname === `variation_details[${index}][variation_image]`
            //     );
            //     let v_barcode: any;
            //     v_barcode = await generateQRCode();
            //     product.variation_barcode = product.variation_barcode
            //       ? product.variation_barcode
            //       : v_barcode;
            //     product.variation_barcode_image = await QRCode.toDataURL(
            //       product.variation_barcode
            //     );
            //     for (const file of matchingFiles) {
            //       const imageUpload = await FileUploadHelper.uploadToSpaces(file);
            //       product.variation_image = imageUpload.Location;
            //       product.variation_image_key = imageUpload.Key;
            //     }
            //     updatedVariation_details.push(product);
            //   }
            //   console.log(updatedVariation_details);
            //   const successVariationUpload: any = [];
            //   // Loop through each state in the array
            //   for (const variationDetails of updatedVariation_details) {
            //     // Call the service to save the state with merged data
            //     const result: IVariationInterface | {} = await VariationModel.create(
            //       [variationDetails],
            //       { session }
            //     );
            //     if (result) {
            //       successVariationUpload.push(result);
            //     }
            //   }
            //   if (successVariationUpload.length > 0) {
            //     // Commit transaction
            //     await session.commitTransaction();
            //     session.endSession();
            //     return sendResponse(res, {
            //       statusCode: 200,
            //       success: true,
            //       message: "Product created successfully!",
            //       data: newProduct
            //     });
            //   }
            // }
            // Commit transaction
            // await session.commitTransaction();
            // session.endSession();
            return (0, sendResponse_1.default)(res, {
                statusCode: 200,
                success: true,
                message: "Product created successfully!",
                data: newProduct,
            });
        }
        else {
            throw new AppError_1.default(400, "Image Upload Failed");
        }
    }
    catch (error) {
        // await session.abortTransaction();
        // session.endSession();
        next(error);
    }
});
// get all dashboard product
// const findAllDashboardProduct = catchAsync(async (req, res, next: NextFunction) => {
//   const query = req.query; // Get all query parameters
//   // Step 1: Fetch products using the service
//   const { products, totalCount } = await ProductServices.findAllDashboardProductServices(query);
//   // Step 2: Check if no data is found
//   // if (!products || products.length === 0) {
//   //   return sendResponse(res, {
//   //     success: false,
//   //     statusCode: httpStatus.NOT_FOUND,
//   //     message: 'No data found.',
//   //     data: [],
//   //   });
//   // }
//   // Step 3: Calculate total count for pagination
//   // const andCondition = [];
//   // if (query.searchTerm) {
//   //   andCondition.push({
//   //     $or: productSearchableField.map((field) => ({
//   //       [field]: {
//   //         $regex: query.searchTerm,
//   //         $options: "i",
//   //       },
//   //     })),
//   //   });
//   // }
//   // const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
//   // const total = await ProductModel.countDocuments(whereCondition);
//   // Step 4: Send the response
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: 'Dashboard products retrieved successfully',
//     totalData: totalCount,  // Include the total count here
//     data: products,
//   });
// });
const findAllDashboardProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_services_1.ProductServices.findAllDashboardProductServices(query);
    // Check if the database collection is empty or no matching data is found
    // if (!result || result?.data?.length === 0) {
    //   return sendResponse(res, {
    //     success: false,
    //     statusCode: 404,
    //     message: 'No data found.',
    //     data: [],
    //   });
    // }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Dashboard Products retrieved successfully",
        data: result === null || result === void 0 ? void 0 : result.data,
        pagination: result === null || result === void 0 ? void 0 : result.pagination,
        totalData: result === null || result === void 0 ? void 0 : result.total,
    });
}));
const findDashboardAvailableProductsForHotDeals = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_services_1.ProductServices.findDashboardAvailableProductsForHotDealsServices(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Available Products for Dashboard Hot Deals retrieved successfully",
        data: result === null || result === void 0 ? void 0 : result.data,
        pagination: result === null || result === void 0 ? void 0 : result.pagination,
        totalData: result === null || result === void 0 ? void 0 : result.total,
    });
}));
const findDashboardAvailableProductsForCouponNotApplied = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_services_1.ProductServices.findDashboardAvailableProductsForCouponNotAppliedServices(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Available Products for Dashboard coupon Not Applied retrieved successfully",
        data: result === null || result === void 0 ? void 0 : result.data,
        pagination: result === null || result === void 0 ? void 0 : result.pagination,
        totalData: result === null || result === void 0 ? void 0 : result.total,
    });
}));
// get all active product
const findAllProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield product_services_1.ProductServices.findAllProductServices(query);
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
const findSearchProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield product_services_1.ProductServices.findSearchProductServices(query);
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!products || products.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: "No data found.",
            data: [],
        });
    }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Search Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
// get all related products
const findRelatedProducts = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    const { products, totalCount } = yield product_services_1.ProductServices.findRelatedProductServices(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Related Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
// get all popular product
const findPopularProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield product_services_1.ProductServices.findPopularProductsServices(query);
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!products || products.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: "No data found.",
            data: [],
        });
    }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Popular Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
// get all hot deals product
const findHotDealsProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield product_services_1.ProductServices.findHotDealsProductsServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!products || products.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: "No data found.",
            data: [],
        });
    }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Hot deals Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
// get all bestselling product
const findNewUploadedProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query; // Get all query parameters
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield product_services_1.ProductServices.findNewUploadedProductsServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!products || products.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: "No data found.",
            data: [],
        });
    }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "New uploaded Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
// get all bestselling product
const findOfferedProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Fetch products using the service
    const { products, totalCount } = yield product_services_1.ProductServices.findOfferedProductsServices();
    //console.log(products.length);
    // Step 2: Check if no data is found
    if (!products || products.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: "No data found.",
            data: [],
        });
    }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Offered Products retrieved successfully",
        totalData: totalCount, // Include the total count here
        data: products,
    });
}));
// get single dashboard product
const findSingleDashboardProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params; // Get all query parameters
    // Step 1: Fetch product using the service
    const product = yield product_services_1.ProductServices.findSingleDashboardProductServices(productId);
    // Step 2: Check if no data is found
    if (!product) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: "No data found.",
            data: [],
        });
    }
    // Step 4: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Dashboard product retrieved successfully",
        data: product,
    });
}));
// get single product
const findSingleProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get all query parameters
    // Step 1: Fetch product using the service
    const product = yield product_services_1.ProductServices.findSingleProductServices(id);
    // Step 2: Check if no data is found
    if (!product) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: "No data found.",
            data: [],
        });
    }
    // Step 4: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Single product retrieved successfully",
        data: product,
    });
}));
// get products by IDs
const findProductsByIds = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body; // Get all query parameters
    // Step 1: Fetch product using the service
    const product = yield product_services_1.ProductServices.findProductsByIdsServices(ids);
    // Step 2: Check if no data is found
    if (!product) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: "No data found.",
            data: [],
        });
    }
    // Step 4: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Products by IDs retrieved successfully",
        data: product,
    });
}));
exports.findProductsByBrandId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const brandId = req.query.brand_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = yield product_services_1.ProductServices.findProductsByBrandIdServices(brandId, page, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Products based on brand id fetched successfully",
        data: result.products,
        totalData: result.total,
        pagination: result.pagination,
    });
}));
const statusBulkUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productIds, product_status, product_inactivity_start, product_inactivity_end, } = req.body;
        const result = yield product_services_1.ProductServices.statusBulkUpdateService({
            productIds,
            product_status,
            product_inactivity_start,
            product_inactivity_end,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product Status bulk updated successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
const pharmacySectionsShowBulkUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updates = req.body; // Expecting [{ productId, sections }]
        const result = yield (0, product_services_1.pharmacySectionsShowBulkUpdateService)(updates);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'pharmacy sections show updated successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.pharmacySectionsShowBulkUpdate = pharmacySectionsShowBulkUpdate;
const getPharmacySectionsForWebsiteShow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, product_services_1.getPharmacySectionsForWebsiteShowService)();
        res.status(200).json({
            success: true,
            message: "Pharmacy sections fetched successfully",
            data
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPharmacySectionsForWebsiteShow = getPharmacySectionsForWebsiteShow;
const getSkincareSectionsForWebsiteShow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, product_services_1.getSkincareSectionsForWebsiteShowService)();
        res.status(200).json({
            success: true,
            message: "Skincare sections fetched successfully",
            data
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSkincareSectionsForWebsiteShow = getSkincareSectionsForWebsiteShow;
const getFashionSectionsForWebsiteShow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, product_services_1.getFashionSectionsForWebsiteShowService)();
        res.status(200).json({
            success: true,
            message: "Fashion sections fetched successfully",
            data
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFashionSectionsForWebsiteShow = getFashionSectionsForWebsiteShow;
const fashionSectionsShowBulkUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updates = req.body; // Expecting [{ productId, sections }]
        const result = yield (0, product_services_1.fashionSectionsShowBulkUpdateService)(updates);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'fashion sections show updated successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.fashionSectionsShowBulkUpdate = fashionSectionsShowBulkUpdate;
const skincareSectionsShowBulkUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updates = req.body; // Expecting [{ productId, sections }]
        const result = yield (0, product_services_1.skincareSectionsShowBulkUpdateService)(updates);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'skincare sections show updated successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.skincareSectionsShowBulkUpdate = skincareSectionsShowBulkUpdate;
// update product data
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        if (req.files || req.body) {
            const requestData = req.body;
            console.log(requestData);
            // let barcode: any;
            // if (requestData.is_variation == "false") {
            //   if (requestData.barcode) {
            //     const varCodeCheck = await ProductModel.findOne({
            //       barcode: requestData.barcode,
            //     });
            //     if (
            //       varCodeCheck &&
            //       varCodeCheck?._id.toString() !== requestData?._id
            //     ) {
            //       deleteAllFilesInDirectory(uploadDir);
            //       throw new AppError(
            //         httpStatus.BAD_REQUEST,
            //         "Barcode already exists"
            //       );
            //     }
            //   }
            // }
            // if (requestData.is_variation == "true" && requestData.variation_details) {
            //   // const variationDetails = JSON.parse(requestData.variation_details);
            //   for (const variation of requestData.variation_details) {
            //     const { variation_barcode } = variation;
            //     if (
            //       variation_barcode != null &&
            //       variation_barcode != "" &&
            //       variation_barcode != undefined &&
            //       variation_barcode != "null" &&
            //       variation_barcode != "undefined"
            //     ) {
            //       const varCodeCheck = await VariationModel.findOne({
            //         variation_barcode: variation_barcode,
            //       });
            //       if (
            //         varCodeCheck &&
            //         variation?._id !== varCodeCheck?._id.toString()
            //       ) {
            //         deleteAllFilesInDirectory(uploadDir);
            //         throw new AppError(
            //           httpStatus.BAD_REQUEST,
            //           `Barcode "${variation_barcode}" already exists`
            //         );
            //       }
            //     }
            //   }
            // }
            const files = req.files;
            // Array to store thumbnail_image data
            let thumbnail_image;
            let thumbnail_image_key;
            // Handle main image
            const thumbnailImage = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === "thumbnail_image");
            if (thumbnailImage) {
                const thumbnail_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(thumbnailImage);
                thumbnail_image = thumbnail_image_upload === null || thumbnail_image_upload === void 0 ? void 0 : thumbnail_image_upload.Location;
                thumbnail_image_key = thumbnail_image_upload === null || thumbnail_image_upload === void 0 ? void 0 : thumbnail_image_upload.Key;
                if (requestData === null || requestData === void 0 ? void 0 : requestData.thumbnail_image_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.thumbnail_image_key);
                }
            }
            else {
                thumbnail_image = requestData === null || requestData === void 0 ? void 0 : requestData.thumbnail_image;
                thumbnail_image_key = requestData === null || requestData === void 0 ? void 0 : requestData.thumbnail_image_key;
            }
            // Array to store additional_images URLs and keys
            const additional_images = [];
            // Handle additional_images
            const additionalImageFiles = files === null || files === void 0 ? void 0 : files.filter((file) => file.fieldname.startsWith("additional_images"));
            for (const file of additionalImageFiles) {
                const imageUpload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                additional_images.push({
                    additional_image: imageUpload.Location,
                    additional_image_key: imageUpload.Key,
                });
            }
            if (requestData === null || requestData === void 0 ? void 0 : requestData.additional_default_images) {
                // Assuming requestData?.additional_default_images is defined as shown
                const additionalImages = requestData === null || requestData === void 0 ? void 0 : requestData.additional_default_images;
                // Combine `additional_image` and `additional_image_key` into objects, filtering out `undefined` values
                const formattedImages = additionalImages.additional_image
                    .map((image, index) => {
                    const key = additionalImages.additional_image_key[index];
                    // Skip if either `image` or `key` is `undefined`
                    if (image === "undefined" || key === "undefined")
                        return null;
                    return { additional_image: image, additional_image_key: key };
                })
                    .filter(Boolean); // Remove any null values from the array
                additional_images.push(...formattedImages);
            }
            // Generate a unique slug for the product
            // const product_slug = await generateUniqueSlug(requestData.product_name);
            // requestData.product_slug = product_slug;
            requestData.is_variation = requestData.is_variation;
            // Create product object
            const productData = {
                // product_article_number: requestData?.product_article_number,
                product_name: requestData.product_name,
                product_slug: requestData.product_slug,
                product_sku: requestData.product_sku,
                product_status: requestData.product_status,
                product_inactivity_start: requestData === null || requestData === void 0 ? void 0 : requestData.product_inactivity_start,
                product_inactivity_end: requestData === null || requestData === void 0 ? void 0 : requestData.product_inactivity_end,
                category_id: requestData.category_id,
                subcategory_id: requestData.subcategory_id
                    ? requestData.subcategory_id
                    : undefined,
                childcategory_id: requestData.childcategory_id
                    ? requestData.childcategory_id
                    : undefined,
                brand_id: requestData.brand_id ? requestData.brand_id : null,
                // specifications:
                //   requestData.specifications?.map(
                //     (spec: { specification_id: any; specification_values: any }) => ({
                //       specification_id: spec.specification_id,
                //       specification_values:
                //         spec.specification_values?.map(
                //           (value: { specification_value_id: any }) => ({
                //             specification_value_id: value.specification_value_id
                //               ? value.specification_value_id
                //               : undefined,
                //           })
                //         ) ?? [],
                //     })
                //   ) ?? [],
                description: (_a = requestData.description) !== null && _a !== void 0 ? _a : "",
                thumbnail_image: thumbnail_image,
                thumbnail_image_key: thumbnail_image_key,
                additional_images: additional_images !== null && additional_images !== void 0 ? additional_images : [],
                product_price: requestData.product_price && parseFloat(requestData.product_price),
                product_buying_price: requestData.product_buying_price &&
                    parseFloat(requestData.product_buying_price),
                // product_discount_price:
                // requestData.product_discount_price ?
                // parseFloat(requestData.product_discount_price) : undefined,
                // product_quantity: requestData.product_quantity
                // ? parseInt(requestData.product_quantity)
                // : undefined,
                product_discount_price: requestData.product_discount_price === "" ||
                    requestData.product_discount_price === undefined
                    ? null
                    : parseFloat(requestData.product_discount_price),
                product_quantity: requestData.product_quantity === "" ||
                    requestData.product_quantity === undefined
                    ? null
                    : parseInt(requestData.product_quantity),
                product_alert_quantity: requestData.product_alert_quantity &&
                    parseInt(requestData.product_alert_quantity),
                is_variation: requestData.is_variation === "true",
                product_warrenty: (_b = requestData.product_warrenty) !== null && _b !== void 0 ? _b : "",
                product_return: (_c = requestData.product_return) !== null && _c !== void 0 ? _c : "",
                unit: (_d = requestData.unit) !== null && _d !== void 0 ? _d : "",
                unit_quantity: (requestData === null || requestData === void 0 ? void 0 : requestData.unit_quantity) && parseInt(requestData === null || requestData === void 0 ? void 0 : requestData.unit_quantity),
                meta_title: (_e = requestData.meta_title) !== null && _e !== void 0 ? _e : "",
                meta_description: (_f = requestData.meta_description) !== null && _f !== void 0 ? _f : "",
                meta_keywords: typeof requestData.meta_keywords === "string"
                    ? JSON.parse(requestData.meta_keywords)
                    : requestData.meta_keywords || [],
                product_updated_by: requestData.product_updated_by,
                product_supplier_id: requestData.product_supplier_id,
                _id: requestData === null || requestData === void 0 ? void 0 : requestData._id,
                product_barcode: (requestData === null || requestData === void 0 ? void 0 : requestData.product_barcode)
                    ? requestData === null || requestData === void 0 ? void 0 : requestData.product_barcode
                    : "",
                offered_product_show: requestData.offered_product_show,
                video_url: (requestData === null || requestData === void 0 ? void 0 : requestData.video_url) ? requestData === null || requestData === void 0 ? void 0 : requestData.video_url : "",
                // is_flat_discount_show: requestData?.is_flat_discount_show ? requestData?.is_flat_discount_show : false,
                // is_percent_discount_show: requestData?.is_percent_discount_show ? requestData?.is_percent_discount_show : false,
                discount_show: (requestData === null || requestData === void 0 ? void 0 : requestData.discount_show)
                    ? requestData === null || requestData === void 0 ? void 0 : requestData.discount_show
                    : "",
            };
            console.log("Product Data >>>", productData);
            // console.log(JSON.stringify(productData, null, 2));
            // console.log(JSON.stringify(requestData, null, 2));
            // Save product in the database
            const newProduct = yield product_services_1.ProductServices.updateProductServices(requestData === null || requestData === void 0 ? void 0 : requestData._id, productData);
            if (newProduct) {
                // if (
                //   requestData.is_variation == "true" &&
                //   requestData?.againAddNewVariation == "false"
                // ) {
                //   const variation_details = req.body.variation_details;
                //   const updatedVariation_details = [];
                //   for (let index = 0; index < variation_details.length; index++) {
                //     let product = variation_details[index];
                //     product.product_id = requestData?._id;
                //     const matchingFiles = files.filter(
                //       (file) =>
                //         file.fieldname ===
                //         `variation_details[${index}][variation_image]`
                //     );
                //     //barcode generation if variations are true (no need during updating product)
                //     // let v_barcode: any;
                //     // v_barcode = await generateQRCode();
                //     // product.variation_barcode =
                //     //   product.variation_barcode != "undefined" &&
                //     //     product.variation_barcode != "null" &&
                //     //     product.variation_barcode != null &&
                //     //     product.variation_barcode != undefined &&
                //     //     product.variation_barcode != ""
                //     //     ? product.variation_barcode
                //     //     : v_barcode;
                //     // product.variation_barcode_image = await QRCode.toDataURL(
                //     //   product.variation_barcode
                //     // );
                //     for (const file of matchingFiles) {
                //       const imageUpload = await FileUploadHelper.uploadToSpaces(file);
                //       product.variation_image = imageUpload.Location;
                //       product.variation_image_key = imageUpload.Key;
                //     }
                //     updatedVariation_details.push(product);
                //   }
                //   const successVariationUpload: any = [];
                //   // Loop through each state in the array
                //   for (const variationDetails of updatedVariation_details) {
                //     // Call the service to save the state with merged data
                //     const result: IVariationInterface | {} | any =
                //       await VariationModel.updateOne(
                //         { _id: variationDetails._id },
                //         variationDetails,
                //         { runValidators: true }
                //       );
                //     if (result) {
                //       successVariationUpload.push(result);
                //     }
                //   }
                //   if (successVariationUpload.length > 0) {
                //     return sendResponse(res, {
                //       statusCode: 200,
                //       success: true,
                //       message: "Product updated successfully!",
                //     });
                //   }
                // }
                return (0, sendResponse_1.default)(res, {
                    statusCode: 200,
                    success: true,
                    message: "Product updated successfully!",
                });
            }
        }
        else {
            throw new AppError_1.default(400, "Image Upload Failed");
        }
    }
    catch (error) {
        next(error);
    }
});
// delete A Product item
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const _id = (_a = req.body) === null || _a === void 0 ? void 0 : _a._id;
        const thumbnail_image_key = (_b = req.body) === null || _b === void 0 ? void 0 : _b.thumbnail_image_key;
        const additional_images = (_c = req.body) === null || _c === void 0 ? void 0 : _c.additional_images;
        const variations = (_d = req.body) === null || _d === void 0 ? void 0 : _d.variations;
        console.log(_id);
        // const findProductInOrderExist: boolean | null | undefined | any =
        //   await OrderProductModel.exists({
        //     product_id: _id,
        //   });
        // if (findProductInOrderExist) {
        //   throw new AppError(400, "Already Added In Order !");
        // }
        // const findProductInOfferOrderExist: boolean | null | undefined | any =
        //   await OfferOrderModel.exists({
        //     "offer_products.offer_product_id": _id,
        //   });
        // if (findProductInOfferOrderExist) {
        //   throw new AppError(400, "Already Added In Offer Order !");
        // }
        // const findProductInOfferExist: boolean | null | undefined | any =
        //   await OfferModel.exists({
        //     "offer_products.offer_product_id": _id,
        //   });
        // if (findProductInOfferExist) {
        //   throw new AppError(400, "Already Added In Offer !");
        // }
        const result = yield product_services_1.ProductServices.deleteProductServices(_id, thumbnail_image_key, additional_images, variations);
        if ((result === null || result === void 0 ? void 0 : result.deletedCount) > 0) {
            //Delete image using the thumbnail_image_key
            if (thumbnail_image_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(thumbnail_image_key);
            }
            // Check if additional_images exists and is an array
            if (additional_images && Array.isArray(additional_images)) {
                for (const image of additional_images) {
                    // Delete image using the additional_image_key
                    if (image.additional_image_key) {
                        yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(image.additional_image_key);
                    }
                }
            }
            //const variations = await VariationModel.find({ product_id: _id });
            // console.log(variations); // View existing variations before deleting
            // if (variations && Array.isArray(variations)) {
            //   for (const image of variations) {
            //     // Delete image using the additional_image_key
            //     if (image.variation_image_key) {
            //       await FileUploadHelper.deleteFromSpaces(image.variation_image_key);
            //     }
            //   }
            //   await VariationModel.deleteMany({ product_id: _id });
            // }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Product Deleted successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Product delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getCommonCategoryData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category_slug } = req.params;
    // console.log(category_slug);
    const result = yield (0, product_services_1.getCommonCategoryDataService)(category_slug);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Common category data retrieved successfully",
        data: result
    });
}));
exports.ProductControllers = {
    postProduct,
    findAllDashboardProduct,
    findDashboardAvailableProductsForHotDeals,
    findDashboardAvailableProductsForCouponNotApplied,
    findAllProduct,
    findRelatedProducts,
    findPopularProduct,
    findHotDealsProduct,
    findNewUploadedProduct,
    updateProduct,
    deleteProduct,
    findSingleDashboardProduct,
    findSingleProduct,
    findProductsByIds,
    findProductsByBrandId: exports.findProductsByBrandId,
    findOfferedProduct,
    findSearchProduct,
    statusBulkUpdate,
};
