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
exports.deleteChildcategoryServices = exports.updateChildcategoryServices = exports.findAllDashboardChildcategoryServices = exports.findAllChildcategoryServices = exports.postChildcategoryServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const childcategory_interface_1 = require("./childcategory.interface");
const childcategory_model_1 = __importDefault(require("./childcategory.model"));
// Create A Category
const postChildcategoryServices = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const createChildcategory = yield childcategory_model_1.default.create(data);
    return createChildcategory;
});
exports.postChildcategoryServices = postChildcategoryServices;
// Find Category
const findAllChildcategoryServices = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: childcategory_interface_1.childcategorySearchableField.map((field) => ({
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
            $match: Object.assign({ childcategory_status: "active" }, whereCondition), // Match active categories with search filters
        },
        {
            $lookup: {
                from: "products", // The collection to join (products collection)
                localField: "_id", // The field in the categories collection
                foreignField: "childcategory_id", // The field in the products collection that references childcategory
                as: "products", // The array where matching products will be stored
                pipeline: [
                    { $match: { product_status: "active" } }, // Only fetch active products
                ],
            },
        },
        {
            $lookup: {
                from: "categories", // Name of the category collection
                localField: "category_id", // Field in childcategory collection
                foreignField: "_id", // Field in category collection
                as: "category", // Result field
            },
        },
        {
            $unwind: {
                path: "$category", // Convert category array to object
                preserveNullAndEmptyArrays: true // Optional: keep subcategories even if category is missing
            }
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
        //   $sort: { childcategory_serial: 1 }, // Sort by childcategory_serial in ascending order (use 1 for ascending) (not working in this pipeline)
        // },
    ];
    const findChildcategory = yield childcategory_model_1.default.aggregate(pipeline)
        .sort({ childcategory_serial: 1 });
    // .select("-__v");
    return findChildcategory;
});
exports.findAllChildcategoryServices = findAllChildcategoryServices;
// Find all dashboard Category
const findAllDashboardChildcategoryServices = (limit, skip, searchTerm, subcategory_id) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: childcategory_interface_1.childcategorySearchableField.map((field) => ({
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
    // subcategory ID condition (only if provided)
    if (subcategory_id) {
        andCondition.push({
            subcategory_id: subcategory_id,
        });
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const findChildcategory = yield childcategory_model_1.default.find(whereCondition)
        .sort({ childcategory_serial: 1 })
        .skip(skip)
        .limit(limit)
        .populate({
        path: 'subcategory_id',
        populate: {
            path: 'category_id'
        }
    })
        .select("-__v");
    return findChildcategory;
});
exports.findAllDashboardChildcategoryServices = findAllDashboardChildcategoryServices;
// Update a Category
const updateChildcategoryServices = (data, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateChildcategoryInfo = yield childcategory_model_1.default.findOne({ _id: _id });
    if (!updateChildcategoryInfo) {
        throw new AppError_1.default(404, "Sub category not found");
    }
    const Childcategory = yield childcategory_model_1.default.updateOne({ _id: _id }, data, {
        runValidators: true,
    });
    return Childcategory;
});
exports.updateChildcategoryServices = updateChildcategoryServices;
// Delete a Category
const deleteChildcategoryServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateChildcategoryInfo = yield childcategory_model_1.default.findOne({ _id: _id });
    if (!updateChildcategoryInfo) {
        throw new AppError_1.default(404, "Childcategory not found");
    }
    const Childcategory = yield childcategory_model_1.default.deleteOne({ _id: _id }, {
        runValidators: true,
    });
    return Childcategory;
});
exports.deleteChildcategoryServices = deleteChildcategoryServices;
