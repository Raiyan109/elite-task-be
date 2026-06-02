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
exports.ProductServices = exports.getCommonCategoryDataService = exports.deleteProductServices = exports.skincareSectionsShowBulkUpdateService = exports.fashionSectionsShowBulkUpdateService = exports.getFashionSectionsForWebsiteShowService = exports.getSkincareSectionsForWebsiteShowService = exports.getPharmacySectionsForWebsiteShowService = exports.pharmacySectionsShowBulkUpdateService = exports.findDashboardAvailableProductsForCouponNotAppliedServices = exports.findDashboardAvailableProductsForHotDealsServices = exports.findAllDashboardProductServices = void 0;
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const checkAvailability_1 = require("../../utils/checkAvailability");
const brand_model_1 = require("../Brand/brand.model");
const category_model_1 = __importDefault(require("../Category/category.model"));
const ytLink_model_1 = require("../YTLink/ytLink.model");
const product_model_1 = __importDefault(require("./product.model"));
const banner_model_1 = require("../Banner/banner.model");
const subcategory_model_1 = __importDefault(require("../Subcategory/subcategory.model"));
// Create A Product
const postProductServices = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const createProduct = yield product_model_1.default.create([data]);
    return createProduct[0];
});
// get all dashboard products
// const findAllDashboardProductServices = async (queryParams: Record<string, unknown>): Promise<any> => {
//   console.log(' >>>>>>>>>', queryParams);
//   // Step 1: Build the base query with population and sorting
//   const modelQuery = ProductModel.find()
//     .populate([
//       { path: "category_id" },
//       { path: "childcategory_id" },
//       { path: "subcategory_id" },
//       { path: "brand_id" },
//       // { path: "product_publisher_id" },
//       // { path: "product_updated_by" },
//     ])
//     .sort({ createdAt: -1 })
//     .select("-__v")
//     .lean(); // Return plain JavaScript objects for easier processing
//   // Step 2: Use QueryBuilder to handle search, filter, sort, paginate, etc.
//   const query = new QueryBuilder(modelQuery, queryParams)
//     .search(['product_name'])
//     // .search(productSearchableField) // Provide searchable fields
//     // .filter() // Uncomment and implement if needed
//     .sort()
//     .paginate();
//   // .fields(); // Uncomment and implement if needed
//   // Step 3: Execute the query to get the products
//   const products = await query.modelQuery;
//   // Step 4: For each product, conditionally fetch variations if is_variation is true
//   // const productsWithVariations = await Promise.all(
//   //   products.map(async (product) => {
//   //     if (product?.is_variation) {
//   //       const variations = await VariationModel.find({
//   //         product_id: product?._id,
//   //       })
//   //         .select("-__v")
//   //         .lean();
//   //       return { ...product, variations };
//   //     } else {
//   //       return { ...product, variations: [] };
//   //     }
//   //   })
//   // );
//   const totalCount = await ProductModel.countDocuments(query.modelQuery.getFilter());
//   return { products, totalCount };
// }
const findAllDashboardProductServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = queryParams === null || queryParams === void 0 ? void 0 : queryParams.searchTerm;
    const category_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.category_name;
    const subcategory_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.subcategory_name;
    const childcategory_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.childcategory_name;
    const product_status = queryParams === null || queryParams === void 0 ? void 0 : queryParams.product_status;
    // console.log(childcategory_name);
    let page = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.page) || 1;
    let limit = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.limit) || 100;
    let skip = (page - 1) * limit;
    const aggregationPipeline = [
        {
            $lookup: {
                from: 'brands',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand_id',
            },
        },
        { $unwind: { path: '$brand_id', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category_id',
            },
        },
        { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'subcategories',
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory_id',
            },
        },
        { $unwind: { path: '$subcategory_id', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'childcategories',
                localField: 'childcategory_id',
                foreignField: '_id',
                as: 'childcategory_id',
            },
        },
        { $unwind: { path: '$childcategory_id', preserveNullAndEmptyArrays: true } },
    ];
    // 🔹 Add product_status filter only if provided
    if (product_status) {
        aggregationPipeline.push({
            $match: { product_status: product_status },
        });
    }
    // Filter by category/subcategory/childcategory names
    const nameFilterConditions = [];
    if (category_name) {
        nameFilterConditions.push({
            'category_id.category_name': { $regex: category_name, $options: 'i' },
        });
    }
    if (subcategory_name) {
        nameFilterConditions.push({
            'subcategory_id.subcategory_name': { $regex: subcategory_name, $options: 'i' },
        });
    }
    if (childcategory_name) {
        nameFilterConditions.push({
            'childcategory_id.childcategory_name': { $regex: childcategory_name, $options: 'i' },
        });
    }
    if (nameFilterConditions.length > 0) {
        aggregationPipeline.push({
            $match: { $and: nameFilterConditions },
        });
    }
    console.log(searchTerm);
    // Filter by search term
    if (searchTerm) {
        aggregationPipeline.push({
            $match: {
                $or: [
                    { product_name: { $regex: searchTerm, $options: "i" } },
                    { "brand_id.brand_name": { $regex: searchTerm, $options: "i" } },
                    { product_barcode: { $regex: searchTerm, $options: "i" } },
                    //{ 'category_id.category_name': { $regex: searchTerm, $options: 'i' } },
                    // { 'subcategory_id.subcategory_name': { $regex: searchTerm, $options: 'i' } },
                    // { 'childcategory_id.childcategory_name': { $regex: searchTerm, $options: 'i' } },
                ],
            },
        });
        // Optional: reset pagination when searching
        page = 1;
        limit = 100;
        skip = 0;
    }
    // Sort and paginate
    aggregationPipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });
    // Execute main query
    const result = yield product_model_1.default.aggregate(aggregationPipeline);
    // For total count (exclude skip & limit)
    const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: 'total' }];
    const totalResult = yield product_model_1.default.aggregate(totalCountPipeline);
    const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limit);
    return {
        data: result,
        pagination: {
            totalPage: totalPages,
            currentPage: page,
            limit: limit,
        },
        total: totalRecords,
    };
});
exports.findAllDashboardProductServices = findAllDashboardProductServices;
const findDashboardAvailableProductsForHotDealsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = queryParams === null || queryParams === void 0 ? void 0 : queryParams.searchTerm;
    const category_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.category_name;
    const subcategory_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.subcategory_name;
    const childcategory_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.childcategory_name;
    let page = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.page) || 1;
    let limit = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.limit) || 100;
    let skip = (page - 1) * limit;
    const aggregationPipeline = [
        // 🔎 Join brands
        {
            $lookup: {
                from: 'brands',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand_id',
            },
        },
        { $unwind: { path: '$brand_id', preserveNullAndEmptyArrays: true } },
        // 🔎 Join categories
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category_id',
            },
        },
        { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },
        // 🔎 Join subcategories
        {
            $lookup: {
                from: 'subcategories',
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory_id',
            },
        },
        { $unwind: { path: '$subcategory_id', preserveNullAndEmptyArrays: true } },
        // 🔎 Join childcategories
        {
            $lookup: {
                from: 'childcategories',
                localField: 'childcategory_id',
                foreignField: '_id',
                as: 'childcategory_id',
            },
        },
        { $unwind: { path: '$childcategory_id', preserveNullAndEmptyArrays: true } },
        // 🚫 Exclude products that are inside any Hot Deal
        {
            $lookup: {
                from: 'hotdeals',
                let: { productId: '$_id' },
                pipeline: [
                    { $unwind: '$hotDeal_products' },
                    {
                        $match: {
                            $expr: { $eq: ['$hotDeal_products.product_id', '$$productId'] },
                        },
                    },
                ],
                as: 'hot_deal_ref',
            },
        },
        {
            $match: {
                hot_deal_ref: { $size: 0 }, // keep only those NOT in hot deals
            },
        },
        // ✅ Only active products
        {
            $match: { product_status: "active" },
        },
    ];
    // Filter by category/subcategory/childcategory names
    const nameFilterConditions = [];
    if (category_name) {
        nameFilterConditions.push({
            'category_id.category_name': { $regex: category_name, $options: 'i' },
        });
    }
    if (subcategory_name) {
        nameFilterConditions.push({
            'subcategory_id.subcategory_name': { $regex: subcategory_name, $options: 'i' },
        });
    }
    if (childcategory_name) {
        nameFilterConditions.push({
            'childcategory_id.childcategory_name': { $regex: childcategory_name, $options: 'i' },
        });
    }
    if (nameFilterConditions.length > 0) {
        aggregationPipeline.push({
            $match: { $and: nameFilterConditions },
        });
    }
    // Filter by search term
    if (searchTerm) {
        aggregationPipeline.push({
            $match: {
                $or: [
                    { product_name: { $regex: searchTerm, $options: 'i' } },
                    { 'brand_id.brand_name': { $regex: searchTerm, $options: 'i' } },
                    { product_barcode: { $regex: searchTerm, $options: 'i' } },
                ],
            },
        });
        // Reset pagination for search
        page = 1;
        limit = 100;
        skip = 0;
    }
    // Sort + Paginate
    aggregationPipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });
    // Execute main query
    const result = yield product_model_1.default.aggregate(aggregationPipeline);
    // For total count (exclude skip & limit)
    const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: 'total' }];
    const totalResult = yield product_model_1.default.aggregate(totalCountPipeline);
    const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limit);
    return {
        data: result,
        pagination: {
            totalPage: totalPages,
            currentPage: page,
            limit: limit,
        },
        total: totalRecords,
    };
});
exports.findDashboardAvailableProductsForHotDealsServices = findDashboardAvailableProductsForHotDealsServices;
const findDashboardAvailableProductsForCouponNotAppliedServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = queryParams === null || queryParams === void 0 ? void 0 : queryParams.searchTerm;
    const category_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.category_name;
    const subcategory_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.subcategory_name;
    const childcategory_name = queryParams === null || queryParams === void 0 ? void 0 : queryParams.childcategory_name;
    let page = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.page) || 1;
    let limit = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.limit) || 100;
    let skip = (page - 1) * limit;
    const aggregationPipeline = [
        // 🔎 Join brands
        {
            $lookup: {
                from: 'brands',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand_id',
            },
        },
        { $unwind: { path: '$brand_id', preserveNullAndEmptyArrays: true } },
        // 🔎 Join categories
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category_id',
            },
        },
        { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },
        // 🔎 Join subcategories
        {
            $lookup: {
                from: 'subcategories',
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory_id',
            },
        },
        { $unwind: { path: '$subcategory_id', preserveNullAndEmptyArrays: true } },
        // 🔎 Join childcategories
        {
            $lookup: {
                from: 'childcategories',
                localField: 'childcategory_id',
                foreignField: '_id',
                as: 'childcategory_id',
            },
        },
        { $unwind: { path: '$childcategory_id', preserveNullAndEmptyArrays: true } },
        // 🚫 Exclude products that are inside Coupon Not Applied
        {
            $lookup: {
                from: 'couponnotapplieds',
                let: { productId: '$_id' },
                pipeline: [
                    { $unwind: '$coupon_not_applied_products' },
                    {
                        $match: {
                            $expr: { $eq: ['$coupon_not_applied_products.product_id', '$$productId'] },
                        },
                    },
                ],
                as: 'coupon_not_applied_ref',
            },
        },
        {
            $match: {
                coupon_not_applied_ref: { $size: 0 }, // ✅ exclude those already in coupon not applied
            },
        },
    ];
    // 🔎 Filter by category/subcategory/childcategory names
    const nameFilterConditions = [];
    if (category_name) {
        nameFilterConditions.push({
            'category_id.category_name': { $regex: category_name, $options: 'i' },
        });
    }
    if (subcategory_name) {
        nameFilterConditions.push({
            'subcategory_id.subcategory_name': { $regex: subcategory_name, $options: 'i' },
        });
    }
    if (childcategory_name) {
        nameFilterConditions.push({
            'childcategory_id.childcategory_name': { $regex: childcategory_name, $options: 'i' },
        });
    }
    if (nameFilterConditions.length > 0) {
        aggregationPipeline.push({
            $match: { $and: nameFilterConditions },
        });
    }
    // 🔎 Filter by search term
    if (searchTerm) {
        aggregationPipeline.push({
            $match: {
                $or: [
                    { product_name: { $regex: searchTerm, $options: 'i' } },
                    { 'brand_id.brand_name': { $regex: searchTerm, $options: 'i' } },
                    { product_barcode: { $regex: searchTerm, $options: 'i' } },
                ],
            },
        });
        // Reset pagination for search
        page = 1;
        limit = 100;
        skip = 0;
    }
    // ⏳ Sort + Paginate
    aggregationPipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });
    // Execute main query
    const result = yield product_model_1.default.aggregate(aggregationPipeline);
    // 📊 For total count (exclude skip & limit)
    const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: 'total' }];
    const totalResult = yield product_model_1.default.aggregate(totalCountPipeline);
    const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limit);
    return {
        data: result,
        pagination: {
            totalPage: totalPages,
            currentPage: page,
            limit: limit,
        },
        total: totalRecords,
    };
});
exports.findDashboardAvailableProductsForCouponNotAppliedServices = findDashboardAvailableProductsForCouponNotAppliedServices;
//get all active products for customers
const findAllProductServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract category_id from query params if it exists
    const categoryId = queryParams.category_id || queryParams.categoryId; // ✅ handle both cases
    const subcategoryId = queryParams.subcategory_id;
    const childcategoryId = queryParams.childcategory_id;
    const minPrice = Number(queryParams.min_price);
    const maxPrice = Number(queryParams.max_price);
    // Build initial query with category filter if provided
    const initialQuery = {
        product_status: {
            $in: ['active', 'temporary-in-active']
        }
    };
    if (categoryId) {
        initialQuery.category_id = categoryId;
    }
    if (subcategoryId) {
        initialQuery.subcategory_id = subcategoryId;
    }
    if (childcategoryId) {
        initialQuery.childcategory_id = childcategoryId;
    }
    if (!isNaN(minPrice)) {
        initialQuery.product_price = Object.assign(Object.assign({}, (initialQuery.product_price || {})), { $gte: minPrice });
    }
    if (!isNaN(maxPrice)) {
        initialQuery.product_price = Object.assign(Object.assign({}, (initialQuery.product_price || {})), { $lte: maxPrice });
    }
    const initialSort = {};
    const sortBy = queryParams.sort_by || 'bestselling_product_show';
    const sortOrder = queryParams.sort_order || 'asc';
    if (sortBy === 'bestselling_product_show') {
        initialSort.bestselling_product_show = sortOrder === 'asc' ? 1 : -1;
    }
    else if (sortBy === 'product_price') {
        initialSort.product_price = sortOrder === 'asc' ? 1 : -1;
    }
    else if (sortBy === 'product_name') {
        initialSort.product_name = sortOrder === 'asc' ? 1 : -1;
    }
    else {
        initialSort._id = sortOrder === 'asc' ? 1 : -1; // Default sorting by _id
    }
    // Step 1: Build the base query with population and sorting
    const modelQuery = product_model_1.default.find(Object.assign(Object.assign({}, initialQuery), ((!isNaN(minPrice) || !isNaN(maxPrice)) && {
        $expr: {
            $and: [
                !isNaN(minPrice) && { $gte: [{ $ifNull: ["$product_discount_price", "$product_price"] }, minPrice] },
                !isNaN(maxPrice) && { $lte: [{ $ifNull: ["$product_discount_price", "$product_price"] }, maxPrice] }
            ].filter(Boolean)
        }
    }))) // filter max, min price if product_discount_price exists, otherwise fallback to product_price
        .populate([
        { path: "category_id" },
        { path: "childcategory_id" },
        { path: "subcategory_id" },
        { path: "brand_id" },
        // { path: "product_publisher_id" },
        // { path: "product_updated_by" },
    ])
        .sort(initialSort)
        // .select("product_order_count product_name")
        .select("-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty")
        .lean(); // Return plain JavaScript objects for easier processing
    // Step 2: Use QueryBuilder to handle search, filter, sort, paginate, etc.
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['product_name'])
        // .search(productSearchableField) // Provide searchable fields
        // .filter() // Uncomment and implement if needed
        .sort()
        .paginate();
    // .fields(); // Uncomment and implement if needed
    // Step 3: Execute the query to get the products
    const products = yield query.modelQuery;
    // Add availability check to each product
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    // Step 4: For each product, conditionally fetch variations if is_variation is true
    // const productsWithVariations = await Promise.all(
    //   products.map(async (product) => {
    //     if (product?.is_variation) {
    //       const variations = await VariationModel.find({
    //         product_id: product?._id,
    //       })
    //         .select("-__v")
    //         .lean();
    //       return { ...product, variations };
    //     } else {
    //       return { ...product, variations: [] };
    //     }
    //   })
    // );
    const totalCount = yield product_model_1.default.countDocuments(query.modelQuery.getFilter());
    return { products: productsWithAvailability, totalCount };
});
//get all active products for customers
const findSearchProductServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find({ product_status: { $in: ['active', 'temporary-in-active'] } }).lean();
    // Add availability check to each product
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    const totalCount = yield product_model_1.default.countDocuments();
    return { products: productsWithAvailability, totalCount };
});
//get all related products for customers
const findRelatedProductServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = queryParams.id; // product to exclude
    const categoryId = queryParams.category_id || queryParams.categoryId;
    const subcategoryId = queryParams.subcategory_id;
    // Base query (only active products, exclude the given id)
    const initialQuery = {
        product_status: { $in: ["active", "temporary-in-active"] },
        _id: { $ne: productId }, // exclude specific product
    };
    if (categoryId) {
        initialQuery.category_id = categoryId;
    }
    if (subcategoryId) {
        initialQuery.subcategory_id = subcategoryId;
    }
    // Sorting
    // const initialSort: any = {};
    // const sortBy = queryParams.sort_by || "bestselling_product_show";
    // const sortOrder = queryParams.sort_order || "asc";
    // if (sortBy === "bestselling_product_show") {
    //   initialSort.bestselling_product_show = sortOrder === "asc" ? 1 : -1;
    // } else if (sortBy === "product_price") {
    //   initialSort.product_price = sortOrder === "asc" ? 1 : -1;
    // } else if (sortBy === "product_name") {
    //   initialSort.product_name = sortOrder === "asc" ? 1 : -1;
    // } else {
    //   initialSort._id = sortOrder === "asc" ? 1 : -1;
    // }
    // Step 1: Base query with populate + sort
    const modelQuery = product_model_1.default.find(initialQuery)
        .populate([
        { path: "category_id" },
        { path: "subcategory_id" },
        { path: "childcategory_id" },
        { path: "brand_id" },
    ])
        //.sort(initialSort)
        .sort({ createdAt: -1 }) // newest products first
        .select("-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty")
        .lean();
    // Step 2: QueryBuilder (for search, paginate, etc.)
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(["product_name"])
        .sort()
        .paginate();
    // Step 3: Execute query
    const products = yield query.modelQuery;
    // Add availability
    const productsWithAvailability = products.map((product) => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    const totalCount = yield product_model_1.default.countDocuments(query.modelQuery.getFilter());
    return { products: productsWithAvailability, totalCount };
});
//get all popular products for customers
const findPopularProductsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract category_id from query params if it exists
    // const categoryId = queryParams.category_id;
    //Find Grocery category ID
    const groceryCategory = yield category_model_1.default.findOne({ category_name: "Grocery" })
        .select("_id")
        .lean();
    if (!groceryCategory) {
        return { products: [], totalCount: 0 };
    }
    // Build initial query with category filter if provided
    const initialQuery = {
        product_status: { $in: ['active', 'temporary-in-active'] },
        product_order_count: { $gte: 1 },
        category_id: groceryCategory._id,
    };
    // if (categoryId) {
    //   initialQuery.category_id = categoryId;
    // }
    // Step 1: Build the base query with population and sorting
    const modelQuery = product_model_1.default.find(initialQuery)
        .populate([
        { path: "category_id" },
        { path: "childcategory_id" },
        { path: "subcategory_id" },
        { path: "brand_id" },
        //  { path: "category_id", select: "category_name category_slug category_logo category_status category_serial category_banner" },
        // { path: "childcategory_id", select: "subcategory_name subcategory_slug subcategory_logo subcategory_status subcategory_serial subcategory_banner category_id" },
        // { path: "subcategory_id", select: "childcategory_name childcategory_slug childcategory_logo childcategory_status childcategory_serial childcategory_banner subcategory_id" },
        // { path: "brand_id" },
        // { path: "product_publisher_id" },
        // { path: "product_updated_by" },
    ])
        .sort({ product_order_count: -1 })
        .select("-__v")
        .lean()
        .limit(10);
    // Step 2: Use QueryBuilder to handle search, filter, sort, paginate, etc.
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['product_name'])
        // .search(productSearchableField) // Provide searchable fields
        // .filter() // Uncomment and implement if needed
        .sort()
        .paginate();
    // .fields(); // Uncomment and implement if needed
    // Step 3: Execute the query to get the products
    const products = yield query.modelQuery;
    const totalCount = yield product_model_1.default.countDocuments(query.modelQuery.getFilter());
    // Add availability check to each product
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    return { products: productsWithAvailability, totalCount };
});
//find hot deals
const findHotDealsProductsServices = () => __awaiter(void 0, void 0, void 0, function* () {
    //Find Grocery category ID
    const groceryCategory = yield category_model_1.default.findOne({ category_name: "Grocery" })
        .select("_id")
        .lean();
    if (!groceryCategory) {
        return { products: [], totalCount: 0 };
    }
    const filter = {
        product_status: { $in: ['active', 'temporary-in-active'] },
        category_id: groceryCategory._id,
        $expr: {
            $lte: ["$product_discount_price", { $multiply: ["$product_price", 0.6] }] // discount_price <= 0.6 * price
        }
    };
    const products = yield product_model_1.default.find(filter)
        .populate([
        { path: "category_id" },
        { path: "childcategory_id" },
        { path: "subcategory_id" },
        { path: "brand_id" },
    ])
        .sort({ _id: -1 })
        .select("-__v")
        .lean()
        .limit(10);
    const totalCount = yield product_model_1.default.countDocuments(filter);
    return { products, totalCount };
});
//find hot deals
const findNewUploadedProductsServices = () => __awaiter(void 0, void 0, void 0, function* () {
    //Find Grocery category ID
    const groceryCategory = yield category_model_1.default.findOne({ category_name: "Grocery" })
        .select("_id")
        .lean();
    if (!groceryCategory) {
        return { products: [], totalCount: 0 };
    }
    // Build initial query with category filter if provided
    const initialQuery = {
        product_status: { $in: ['active', 'temporary-in-active'] },
        category_id: groceryCategory._id,
    };
    const products = yield product_model_1.default.find(initialQuery)
        .populate([
        { path: "category_id" },
        { path: "childcategory_id" },
        { path: "subcategory_id" },
        { path: "brand_id" },
    ])
        .sort({ createdAt: -1 })
        .select("-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty")
        .lean()
        .limit(10);
    const totalCount = yield product_model_1.default.countDocuments();
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    return { products: productsWithAvailability, totalCount };
});
//find offered products
const findOfferedProductsServices = () => __awaiter(void 0, void 0, void 0, function* () {
    //Find Grocery category ID
    const groceryCategory = yield category_model_1.default.findOne({ category_name: "Grocery" })
        .select("_id")
        .lean();
    if (!groceryCategory) {
        return { products: [], totalCount: 0 };
    }
    // Build initial query with category filter if provided
    const initialQuery = {
        product_status: { $in: ['active', 'temporary-in-active'] },
        category_id: groceryCategory._id,
        offered_product_show: true
    };
    const products = yield product_model_1.default.find(/*{ offered_product_show: true }*/ initialQuery)
        .populate([
        { path: "category_id" },
        { path: "childcategory_id" },
        { path: "subcategory_id" },
        { path: "brand_id" },
    ])
        .sort({ createdAt: -1 })
        .select("-__v")
        .lean();
    // Add availability check to each product
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    const totalCount = products.length ? products.length : 0;
    return { products: productsWithAvailability, totalCount };
});
// get single dashboard products
const findSingleDashboardProductServices = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(productId)
        .populate('category_id')
        .populate('childcategory_id')
        .populate('subcategory_id')
        .populate('brand_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object
    if (!product) {
        throw new AppError_1.default(404, "Product Not Found !");
    }
    // if (product?.is_variation) {
    //   // Step 2: Find variations related to the product and populate attributes
    //   const variations = await VariationModel.find({ product_id: productId })
    //     .select("-__v")
    //     .lean();
    //   // Step 3: Combine product data with variations
    //   return { ...product, variations };
    // }
    return Object.assign({}, product);
});
// get single products
const findSingleProductServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findOne({
        product_slug: id,
        product_status: { $in: ['active', 'temporary-in-active'] } // Ensure the product is active or temporarily inactive
    })
        .populate('category_id')
        .populate('childcategory_id')
        .populate('subcategory_id')
        .populate('brand_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object
    if (!product) {
        throw new AppError_1.default(404, "Product Not Found !");
    }
    return Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) });
});
// get products by IDs (cart)
const findProductsByIdsServices = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.default.find({ _id: { $in: ids } });
    return products;
});
// get products by brand IDs
const findProductsByBrandIdServices = (brandId_1, ...args_1) => __awaiter(void 0, [brandId_1, ...args_1], void 0, function* (brandId, page = 1, limit = 10) {
    if (!mongoose_1.Types.ObjectId.isValid(brandId)) {
        throw new Error("Invalid brand ID");
    }
    const skip = (page - 1) * limit;
    // Fetch products with pagination
    const products = yield product_model_1.default.find({ brand_id: brandId })
        .populate({
        path: "brand_id",
        select: "brand_name",
    })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }) // newest first (optional)
        .lean();
    // Get total count
    const totalRecords = yield product_model_1.default.countDocuments({ brand_id: brandId });
    // Add availability check to each product
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    return {
        products: productsWithAvailability,
        pagination: {
            totalPage: Math.ceil(totalRecords / limit),
            currentPage: page,
            limit,
        },
        total: totalRecords,
    };
});
// Status bulk update after filtering with category, subcategory and childcategory
const statusBulkUpdateService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ productIds, product_status, product_inactivity_start, product_inactivity_end, }) {
    const updatePayload = {};
    if (product_status)
        updatePayload.product_status = product_status;
    if (product_inactivity_start)
        updatePayload.product_inactivity_start = product_inactivity_start;
    if (product_inactivity_end)
        updatePayload.product_inactivity_end = product_inactivity_end;
    const result = yield product_model_1.default.updateMany({ _id: { $in: productIds } }, { $set: updatePayload });
    return result;
});
const pharmacySectionsShowBulkUpdateService = (updates) => __awaiter(void 0, void 0, void 0, function* () {
    const bulkOps = updates.map(({ productId, sections }) => {
        const setPayload = {};
        const unsetPayload = {};
        for (const [key, value] of Object.entries(sections)) {
            if (key.startsWith('pharmacy_section_') && key.endsWith('_show')) {
                if (value)
                    setPayload[key] = true;
                else
                    unsetPayload[key] = '';
            }
        }
        const updateOps = {};
        if (Object.keys(setPayload).length > 0)
            updateOps.$set = setPayload;
        if (Object.keys(unsetPayload).length > 0)
            updateOps.$unset = unsetPayload;
        return {
            updateOne: {
                filter: { _id: productId },
                update: updateOps,
            },
        };
    });
    const result = yield product_model_1.default.bulkWrite(bulkOps);
    return result;
});
exports.pharmacySectionsShowBulkUpdateService = pharmacySectionsShowBulkUpdateService;
const getPharmacySectionsForWebsiteShowService = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Find Pharmacy category ID
    const pharmacyCategory = yield category_model_1.default.findOne({ category_name: "Pharmacy" }).select("_id category_banner").lean();
    if (!pharmacyCategory) {
        throw new Error("Pharmacy category not found");
    }
    const categoryId = pharmacyCategory._id;
    // 2️⃣ Define section keys
    const sectionKeys = [
        "pharmacy_section_1_show",
        "pharmacy_section_2_show",
        "pharmacy_section_3_show",
        "pharmacy_section_4_show",
        "pharmacy_section_5_show",
        "pharmacy_section_6_show"
    ];
    // 2️⃣a Define section names for each key
    const sectionNamesMap = {
        pharmacy_section_1_show: "Health & Nutrients",
        pharmacy_section_2_show: "Covid-19",
        pharmacy_section_3_show: "Adult Products",
        pharmacy_section_4_show: "Supplement",
        pharmacy_section_5_show: "Herbal Products",
        pharmacy_section_6_show: "First Aid",
    };
    // 3️⃣ Get products for each section
    const sections = yield Promise.all(sectionKeys.map((key, index) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield product_model_1.default.find({
            product_status: { $in: ['active', 'temporary-in-active'] },
            category_id: categoryId,
            [key]: true
        })
            .populate("brand_id", "brand_name brand_slug brand_logo")
            .lean();
        // Add availability check to each product
        const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
        return {
            section_name: sectionNamesMap[key] || `Section ${key}`, // use mapping //`Pharmacy Section ${index + 1}`,
            section_key: key,
            products: productsWithAvailability
        };
    })));
    // 4️⃣ Get Brands and their products
    // const brands = await BrandModel.find({
    //   category_id: categoryId,
    //   brand_status: "active"
    // }).lean();
    // const brandData = await Promise.all(
    //   brands.map(async (brand) => {
    //     const products = await ProductModel.find({
    //       category_id: categoryId,
    //       brand_id: brand._id
    //     }).lean();
    //     return {
    //       ...brand,
    //       products
    //     };
    //   })
    // );
    // 4️⃣ Get only brand _id and brand_name
    const brandData = yield brand_model_1.BrandModel.find({ category_id: categoryId, brand_status: "active" }, "_id brand_name brand_logo" // projection
    ).lean();
    // 5️⃣ Get YouTube reels (active + Pharmacy category type)
    const youtubeReels = yield ytLink_model_1.YTLinkModel.find({
        ytLink_status: "active",
        category_type: "Pharmacy",
    }, "_id ytLink_link")
        .sort({ ytLink_serial: 1 }) // optional: sort by serial
        .lean();
    // 6️⃣ Return combined result
    return [
        {
            category_banner: pharmacyCategory.category_banner || [],
        },
        {
            youtube_reels: youtubeReels
        },
        ...sections,
        {
            section_name: "Pharmacy Brands",
            brands: brandData
        }
    ];
});
exports.getPharmacySectionsForWebsiteShowService = getPharmacySectionsForWebsiteShowService;
const getSkincareSectionsForWebsiteShowService = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Find Skincare category ID
    const skincareCategory = yield category_model_1.default.findOne({ category_name: "Beauty & Skincare" }).select("_id category_banner").lean();
    if (!skincareCategory) {
        throw new Error("Skincare category not found");
    }
    const categoryId = skincareCategory._id;
    // 2️⃣ Define section keys
    const sectionKeys = [
        "skincare_section_1_show",
        "skincare_section_2_show",
        "skincare_section_3_show",
        "skincare_section_4_show",
        "skincare_section_5_show",
        "skincare_section_6_show"
    ];
    // 2️⃣a Define section names for each key
    const sectionNamesMap = {
        skincare_section_1_show: "Buy & Get Offer",
        skincare_section_2_show: "Winter Offer",
        skincare_section_3_show: "Summer Offer",
        skincare_section_4_show: "Best Selling Products",
        skincare_section_5_show: "Hair Fall Solutions",
        skincare_section_6_show: "Natural & Organic",
    };
    // 3️⃣ Get products for each section
    const sections = yield Promise.all(sectionKeys.map((key, index) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield product_model_1.default.find({
            product_status: { $in: ['active', 'temporary-in-active'] },
            category_id: categoryId,
            [key]: true
        })
            .populate("brand_id", "brand_name brand_slug brand_logo")
            .lean();
        // Add availability check to each product
        const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
        return {
            section_name: sectionNamesMap[key] || `Section ${key}`, // use mapping //`Skincare Section ${index + 1}`,
            section_key: key,
            products: productsWithAvailability
        };
    })));
    // 4️⃣ Get Brands and their products
    // const brands = await BrandModel.find({
    //   category_id: categoryId,
    //   brand_status: "active"
    // }).lean();
    // const brandData = await Promise.all(
    //   brands.map(async (brand) => {
    //     const products = await ProductModel.find({
    //       category_id: categoryId,
    //       brand_id: brand._id
    //     }).lean();
    //     return {
    //       ...brand,
    //       products
    //     };
    //   })
    // );
    // 4️⃣ Get only brand _id and brand_name
    const brandData = yield brand_model_1.BrandModel.find({ category_id: categoryId, brand_status: "active" }, "_id brand_name brand_logo" // projection
    ).lean();
    // 5️⃣ Get YouTube reels (active + Pharmacy category type)
    const youtubeReels = yield ytLink_model_1.YTLinkModel.find({
        ytLink_status: "active",
        category_type: "Beauty & Skincare",
    }, "_id ytLink_link")
        .sort({ ytLink_serial: 1 }) // optional: sort by serial
        .lean();
    // 6️⃣ Return combined result
    return [
        {
            category_banner: skincareCategory.category_banner || [],
        },
        {
            youtube_reels: youtubeReels
        },
        ...sections,
        {
            section_name: "Beauty & Skincare Brands",
            brands: brandData
        }
    ];
});
exports.getSkincareSectionsForWebsiteShowService = getSkincareSectionsForWebsiteShowService;
const getFashionSectionsForWebsiteShowService = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Find Fashion category ID
    const fashionCategory = yield category_model_1.default.findOne({ category_name: "Fashion" }).select("_id category_banner").lean();
    if (!fashionCategory) {
        throw new Error("Fashion category not found");
    }
    const categoryId = fashionCategory._id;
    // 2️⃣ Define section keys
    const sectionKeys = [
        "fashion_section_1_show",
        "fashion_section_2_show",
        "fashion_section_3_show",
        "fashion_section_4_show",
        "fashion_section_5_show",
        "fashion_section_6_show"
    ];
    // 2️⃣a Define section names for each key
    const sectionNamesMap = {
        fashion_section_1_show: "Popular Products",
        fashion_section_2_show: "Mega Deal 40%",
        fashion_section_3_show: "Winter Essentials",
        fashion_section_4_show: "Women's Collection",
        fashion_section_5_show: "Men's Collection",
        fashion_section_6_show: "Kids' Collection",
    };
    // 3️⃣ Get products for each section
    // const sections = await Promise.all(
    //   sectionKeys.map(async (key, index) => {
    //     const products = await ProductModel.find({
    //       product_status: { $in: ['active', 'temporary-in-active'] },
    //       category_id: categoryId,
    //       [key]: true
    //     })
    //       .populate("brand_id", "brand_name brand_slug brand_logo")
    //       .lean();
    //     // Add availability check to each product
    //     const productsWithAvailability = products.map(product => ({
    //       ...product,
    //       availability: checkProductAvailability(product)
    //     }))
    //     return {
    //       section_name: sectionNamesMap[key] || `Section ${key}`, // use mapping //`Fashion Section ${index + 1}`,
    //       section_key: key,
    //       products: productsWithAvailability
    //     };
    //   })
    // );
    // 3️⃣ Get products for each section (with calculated mega deal)
    const sections = yield Promise.all(sectionKeys.map((key) => __awaiter(void 0, void 0, void 0, function* () {
        let products = [];
        if (key === "fashion_section_2_show") {
            // Mega Deal 40% (discounted products >= 40%)
            products = yield product_model_1.default.find({
                product_status: { $in: ["active", "temporary-in-active"] },
                category_id: categoryId,
                product_discount_price: { $ne: null }, // must have a discount
                product_price: { $gt: 0 }, // prevent division by zero
                $expr: {
                    $gte: [
                        {
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ["$product_price", "$product_discount_price"] },
                                        "$product_price"
                                    ]
                                },
                                100
                            ]
                        },
                        40
                    ]
                }
            })
                .populate("brand_id", "brand_name brand_slug brand_logo")
                .lean();
        }
        else {
            // Normal section logic
            products = yield product_model_1.default.find({
                product_status: { $in: ["active", "temporary-in-active"] },
                category_id: categoryId,
                [key]: true
            })
                .populate("brand_id", "brand_name brand_slug brand_logo")
                .lean();
        }
        // Add availability check
        const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
        return {
            section_name: sectionNamesMap[key] || `Section ${key}`,
            section_key: key,
            products: productsWithAvailability,
        };
    })));
    // 4️⃣ Get Brands and their products
    // const brands = await BrandModel.find({
    //   category_id: categoryId,
    //   brand_status: "active"
    // }).lean();
    // const brandData = await Promise.all(
    //   brands.map(async (brand) => {
    //     const products = await ProductModel.find({
    //       category_id: categoryId,
    //       brand_id: brand._id
    //     }).lean();
    //     return {
    //       ...brand,
    //       products
    //     };
    //   })
    // );
    // 4️⃣ Get only brand _id and brand_name
    const brandData = yield brand_model_1.BrandModel.find({ category_id: categoryId, brand_status: "active" }, "_id brand_name brand_logo" // projection
    ).lean();
    // 5️⃣ Get YouTube reels (active + Pharmacy category type)
    const youtubeReels = yield ytLink_model_1.YTLinkModel.find({
        ytLink_status: "active",
        category_type: "Fashion",
    }, "_id ytLink_link")
        .sort({ ytLink_serial: 1 }) // optional: sort by serial
        .lean();
    // 6️⃣ Return combined result
    return [
        {
            category_banner: fashionCategory.category_banner || [],
        },
        {
            youtube_reels: youtubeReels
        },
        ...sections,
        {
            section_name: "Fashion Brands",
            brands: brandData
        }
    ];
});
exports.getFashionSectionsForWebsiteShowService = getFashionSectionsForWebsiteShowService;
const fashionSectionsShowBulkUpdateService = (updates) => __awaiter(void 0, void 0, void 0, function* () {
    const bulkOps = updates.map(({ productId, sections }) => {
        const setPayload = {};
        const unsetPayload = {};
        for (const [key, value] of Object.entries(sections)) {
            if (key.startsWith('fashion_section_') && key.endsWith('_show')) {
                if (value)
                    setPayload[key] = true;
                else
                    unsetPayload[key] = '';
            }
        }
        const updateOps = {};
        if (Object.keys(setPayload).length > 0)
            updateOps.$set = setPayload;
        if (Object.keys(unsetPayload).length > 0)
            updateOps.$unset = unsetPayload;
        return {
            updateOne: {
                filter: { _id: productId },
                update: updateOps,
            },
        };
    });
    const result = yield product_model_1.default.bulkWrite(bulkOps);
    return result;
});
exports.fashionSectionsShowBulkUpdateService = fashionSectionsShowBulkUpdateService;
const skincareSectionsShowBulkUpdateService = (updates) => __awaiter(void 0, void 0, void 0, function* () {
    const bulkOps = updates.map(({ productId, sections }) => {
        const setPayload = {};
        const unsetPayload = {};
        for (const [key, value] of Object.entries(sections)) {
            if (key.startsWith('skincare_section_') && key.endsWith('_show')) {
                if (value)
                    setPayload[key] = true;
                else
                    unsetPayload[key] = '';
            }
        }
        const updateOps = {};
        if (Object.keys(setPayload).length > 0)
            updateOps.$set = setPayload;
        if (Object.keys(unsetPayload).length > 0)
            updateOps.$unset = unsetPayload;
        return {
            updateOne: {
                filter: { _id: productId },
                update: updateOps,
            },
        };
    });
    const result = yield product_model_1.default.bulkWrite(bulkOps);
    return result;
});
exports.skincareSectionsShowBulkUpdateService = skincareSectionsShowBulkUpdateService;
// update A Product
const updateProductServices = (_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updateFindProduct = yield product_model_1.default.findOne({
        _id,
    });
    if (!updateFindProduct) {
        throw new Error("Product not found");
    }
    // creating data to update
    const updateData = Object.assign({}, data);
    // // যদি `sub_category_id` পাঠানো না হয়, তাহলে সেটি ডিলিট করা হবে
    // const unsetData: any = {};
    // if (!data.hasOwnProperty("sub_category_id")) {
    //   unsetData.sub_category_id = "";
    // }
    // if (!data.hasOwnProperty("child_category_id")) {
    //   unsetData.child_category_id = "";
    // }
    // if (!data.hasOwnProperty("childcategory_id")) {
    //   unsetData.childcategory_id = "";
    // }
    const updateProduct = yield product_model_1.default.updateOne({ _id: _id }, {
        $set: updateData, // updating fields
        //$unset: unsetData, // if don't need to send any field, remove those specific fields
    }, { runValidators: true });
    return updateProduct;
});
// Delete a Product
const deleteProductServices = (_id, thumbnail_image_key, additional_images, variations) => __awaiter(void 0, void 0, void 0, function* () {
    const updateProductInfo = yield product_model_1.default.findOne({ _id: _id });
    if (!updateProductInfo) {
        throw new AppError_1.default(404, "Product not found");
    }
    const Product = yield product_model_1.default.deleteOne({ _id: _id }, {
        runValidators: true,
    });
    return Product;
});
exports.deleteProductServices = deleteProductServices;
const getCommonCategoryDataService = (category_slug) => __awaiter(void 0, void 0, void 0, function* () {
    const excludedSlugs = ["Grocery", "Food", "Beauty-and-Skincare", "Fashion", "Pharmacy"];
    if (excludedSlugs.includes(category_slug.toLowerCase())) {
        return {
            common_banner: [],
            common_reels: [],
            common_popular_products: [],
            common_offer_products: [],
            common_mega_deal: [],
            common_newly_uploaded: [],
            common_subcategory: []
        };
    }
    const category = yield category_model_1.default.findOne({ category_slug }).select("_id");
    if (!category)
        throw new Error("Category not found");
    const [banners, reels, productsGrouped, subcategories] = yield Promise.all([
        banner_model_1.BannerModel.find({ banner_position: category_slug, banner_status: "active" })
            .sort({ banner_serial: 1 })
            .limit(10)
            .lean(),
        ytLink_model_1.YTLinkModel.find({ category_type: category_slug, ytLink_status: "active" })
            .sort({ ytLink_serial: 1 })
            .limit(10)
            .lean(),
        product_model_1.default.aggregate([
            {
                $match: {
                    category_id: category._id,
                    // product_status: "active"
                    product_status: {
                        $in: ['active', 'temporary-in-active']
                    }
                }
            },
            {
                $facet: {
                    common_popular_products: [
                        // { $match: { popular_product_show: true } },
                        // { $sort: { createdAt: -1 } },
                        { $match: { product_order_count: { $gt: 0 } } }, // Popular products → must have product_order_count > 0
                        { $sort: { product_order_count: -1 } },
                        { $limit: 10 }
                    ],
                    common_offer_products: [
                        { $match: { offered_product_show: true } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 }
                    ],
                    common_mega_deal: [
                        { $match: { product_discount_price: { $ne: null }, product_price: { $ne: null } } },
                        {
                            $addFields: {
                                discountPercent: {
                                    $multiply: [
                                        { $divide: [{ $subtract: ["$product_price", "$product_discount_price"] }, "$product_price"] },
                                        100
                                    ]
                                }
                            }
                        },
                        { $match: { discountPercent: { $gte: 50 } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 }
                    ],
                    common_newly_uploaded: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]),
        // ✅ Fetch subcategories for this category
        subcategory_model_1.default.find({ category_id: category._id, subcategory_status: "active" })
            .sort({ subcategory_serial: 1 })
            .lean()
    ]);
    const { common_popular_products, common_offer_products, common_mega_deal, common_newly_uploaded } = productsGrouped[0] || {};
    // ✅ Add availability for all product arrays
    const addAvailability = (products) => products.map((product) => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
    // return {
    //   common_banner: banners,
    //   common_reels: reels,
    //   common_popular_products,
    //   common_offer_products,
    //   common_mega_deal,
    //   common_newly_uploaded
    // };
    return {
        common_banner: banners,
        common_reels: reels,
        common_popular_products: addAvailability(common_popular_products),
        common_offer_products: addAvailability(common_offer_products),
        common_mega_deal: addAvailability(common_mega_deal),
        common_newly_uploaded: addAvailability(common_newly_uploaded),
        common_subcategory: subcategories
    };
});
exports.getCommonCategoryDataService = getCommonCategoryDataService;
exports.ProductServices = {
    postProductServices,
    findAllDashboardProductServices: exports.findAllDashboardProductServices,
    findDashboardAvailableProductsForHotDealsServices: exports.findDashboardAvailableProductsForHotDealsServices,
    findDashboardAvailableProductsForCouponNotAppliedServices: exports.findDashboardAvailableProductsForCouponNotAppliedServices,
    findAllProductServices,
    findRelatedProductServices,
    findPopularProductsServices,
    findHotDealsProductsServices,
    findNewUploadedProductsServices,
    updateProductServices,
    deleteProductServices: exports.deleteProductServices,
    findSingleDashboardProductServices,
    findSingleProductServices,
    findProductsByIdsServices,
    findProductsByBrandIdServices,
    findOfferedProductsServices,
    findSearchProductServices,
    statusBulkUpdateService,
};
