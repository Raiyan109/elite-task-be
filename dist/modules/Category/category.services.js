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
exports.deleteCategoryServices = exports.updateCategoryServices = exports.findGroceryCategoryBannerAndReelsServices = exports.findAllDashboardCategoryServices = exports.findAllCategoryServices = exports.postCategoryServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ytLink_model_1 = require("../YTLink/ytLink.model");
const category_interface_1 = require("./category.interface");
const category_model_1 = __importDefault(require("./category.model"));
// Create A Category
const postCategoryServices = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const createCategory = yield category_model_1.default.create(data);
    return createCategory;
});
exports.postCategoryServices = postCategoryServices;
// Find Category
const findAllCategoryServices = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: category_interface_1.categorySearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    // Define the aggregation pipeline in a variable
    const pipeline = [
        {
            $match: Object.assign({ category_status: "active" }, whereCondition), // Match active categories with search filters
        },
        {
            $lookup: {
                from: "products", // The collection to join (products collection)
                localField: "_id", // The field in the categories collection
                foreignField: "category_id", // The field in the products collection that references category
                as: "products", // The array where matching products will be stored
                pipeline: [
                    { $match: { product_status: "active" } }, // Only fetch active products
                ],
            },
        },
        {
            $addFields: {
                total_product: { $size: "$products" }, // Add a new field `total_product` that counts products
            },
        },
        {
            $project: {
                products: 0, // Optional: Remove the products array if you don't want to include product details in the result
            },
        },
        // {
        //   $sort: { category_serial: 1 }, // Sort by category_serial in ascending order (use 1 for ascending) (not working in this pipeline)
        // },
    ];
    const findCategory = yield category_model_1.default.aggregate(pipeline)
        .sort({ category_serial: 1 });
    // .select("-__v");
    return findCategory;
});
exports.findAllCategoryServices = findAllCategoryServices;
// Find all dashboard Category
const findAllDashboardCategoryServices = (limit, skip, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: category_interface_1.categorySearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
        const page = 1;
        limit = 10;
        skip = (page - 1) * limit;
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const findCategory = yield category_model_1.default.find(whereCondition)
        .sort({ category_serial: 1 })
        .skip(skip)
        .limit(limit)
        .select("-__v");
    return findCategory;
});
exports.findAllDashboardCategoryServices = findAllDashboardCategoryServices;
const findGroceryCategoryBannerAndReelsServices = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Find Grocery category
    const groceryCategory = yield category_model_1.default.findOne({
        category_name: "Grocery",
        category_status: "active",
    })
        .select("_id category_banner")
        .lean();
    if (!groceryCategory) {
        throw new Error("Grocery category not found");
    }
    // 2️⃣ Find YouTube reels for Grocery category
    const youtubeReels = yield ytLink_model_1.YTLinkModel.find({
        category_type: "Grocery",
        ytLink_status: "active",
    })
        .select("_id ytLink_link")
        .sort({ ytLink_serial: 1 }) // ✅ ordered by serial
        .lean();
    // 3️⃣ Return in required structure
    return {
        category_banner: groceryCategory.category_banner || [],
        youtube_reels: youtubeReels || [],
    };
});
exports.findGroceryCategoryBannerAndReelsServices = findGroceryCategoryBannerAndReelsServices;
// Update a Category
const updateCategoryServices = (data, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateCategoryInfo = yield category_model_1.default.findOne({ _id: _id });
    if (!updateCategoryInfo) {
        throw new AppError_1.default(404, "Category not found");
    }
    const Category = yield category_model_1.default.updateOne({ _id: _id }, data, {
        runValidators: true,
    });
    return Category;
});
exports.updateCategoryServices = updateCategoryServices;
// Delete a Category
const deleteCategoryServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateCategoryInfo = yield category_model_1.default.findOne({ _id: _id });
    if (!updateCategoryInfo) {
        throw new AppError_1.default(404, "Category not found");
    }
    const Category = yield category_model_1.default.deleteOne({ _id: _id }, {
        runValidators: true,
    });
    return Category;
});
exports.deleteCategoryServices = deleteCategoryServices;
