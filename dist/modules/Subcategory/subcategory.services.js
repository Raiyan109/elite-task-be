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
exports.deleteSubcategoryServices = exports.updateSubcategoryServices = exports.findAllFashionSubcategoryServices = exports.findAllSkincareSubcategoryServices = exports.findAllPharmacySubcategoryServices = exports.findAllGrocerySubcategoryServices = exports.findAllDashboardSubcategoryServices = exports.findAllSubcategoryServices = exports.postSubcategoryServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const category_model_1 = __importDefault(require("../Category/category.model"));
const subcategory_interface_1 = require("./subcategory.interface");
const subcategory_model_1 = __importDefault(require("./subcategory.model"));
// Create A Sub Category
const postSubcategoryServices = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const createSubcategory = yield subcategory_model_1.default.create(data);
    return createSubcategory;
});
exports.postSubcategoryServices = postSubcategoryServices;
// Find Sub Category
const findAllSubcategoryServices = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: subcategory_interface_1.subcategorySearchableField.map((field) => ({
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
            $match: Object.assign({ subcategory_status: "active" }, whereCondition), // Match active categories with search filters
        },
        {
            $lookup: {
                from: "products", // The collection to join (products collection)
                localField: "_id", // The field in the categories collection
                foreignField: "subcategory_id", // The field in the products collection that references subcategory
                as: "products", // The array where matching products will be stored
                pipeline: [
                    { $match: { product_status: "active" } }, // Only fetch active products
                ],
            },
        },
        {
            $lookup: {
                from: "categories", // Name of the category collection
                localField: "category_id", // Field in subcategory collection
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
        //   $sort: { subcategory_serial: 1 }, // Sort by subcategory_serial in ascending order (use 1 for ascending) (not working in this pipeline)
        // },
    ];
    const findSubcategory = yield subcategory_model_1.default.aggregate(pipeline)
        .sort({ subcategory_serial: 1 });
    // .select("-__v");
    return findSubcategory;
});
exports.findAllSubcategoryServices = findAllSubcategoryServices;
// Find all dashboard Sub Category
const findAllDashboardSubcategoryServices = (limit, skip, searchTerm, category_id) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: subcategory_interface_1.subcategorySearchableField.map((field) => ({
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
    // Category ID condition (only if provided)
    if (category_id) {
        andCondition.push({
            category_id: category_id,
        });
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const findSubcategory = yield subcategory_model_1.default.find(whereCondition)
        .sort({ subcategory_serial: 1 })
        .skip(skip)
        .limit(limit)
        .populate('category_id')
        .select("-__v");
    return findSubcategory;
});
exports.findAllDashboardSubcategoryServices = findAllDashboardSubcategoryServices;
// Find Sub Category
const findAllGrocerySubcategoryServices = ( /*searchTerm: any*/) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Find the category ID for 'Grocery'
    const groceryCategory = yield category_model_1.default.findOne({ category_name: "Grocery" });
    if (!groceryCategory)
        return [];
    // Step 2: Fetch subcategories under this category
    const findSubcategory = yield subcategory_model_1.default.find({
        category_id: groceryCategory._id,
    }).sort({ subcategory_serial: 1 });
    return findSubcategory;
});
exports.findAllGrocerySubcategoryServices = findAllGrocerySubcategoryServices;
// Find Pharmacy Sub Category
const findAllPharmacySubcategoryServices = ( /*searchTerm: any*/) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Find the category ID for 'Pharmacy'
    const pharmacyCategory = yield category_model_1.default.findOne({ category_name: "Pharmacy" });
    if (!pharmacyCategory)
        return [];
    // Step 2: Fetch subcategories under this category
    const findSubcategory = yield subcategory_model_1.default.find({
        category_id: pharmacyCategory._id,
    }).sort({ subcategory_serial: 1 });
    return findSubcategory;
});
exports.findAllPharmacySubcategoryServices = findAllPharmacySubcategoryServices;
// Find Skincare/cosmetics/beauty related Sub Category
const findAllSkincareSubcategoryServices = ( /*searchTerm: any*/) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Find the category ID for 'Skincare'
    const skincareCategory = yield category_model_1.default.findOne({ category_name: "Beauty & Skincare" });
    if (!skincareCategory)
        return [];
    // Step 2: Fetch subcategories under this category
    const findSubcategory = yield subcategory_model_1.default.find({
        category_id: skincareCategory._id,
    }).sort({ subcategory_serial: 1 });
    return findSubcategory;
});
exports.findAllSkincareSubcategoryServices = findAllSkincareSubcategoryServices;
// Find fashion related Sub Category
const findAllFashionSubcategoryServices = ( /*searchTerm: any*/) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Find the category ID for 'fashion'
    const fashionCategory = yield category_model_1.default.findOne({ category_name: "Fashion" });
    if (!fashionCategory)
        return [];
    // Step 2: Fetch subcategories under this category
    const findSubcategory = yield subcategory_model_1.default.find({
        category_id: fashionCategory._id,
    }).sort({ subcategory_serial: 1 });
    return findSubcategory;
});
exports.findAllFashionSubcategoryServices = findAllFashionSubcategoryServices;
// Update a Sub Category
const updateSubcategoryServices = (data, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateSubcategoryInfo = yield subcategory_model_1.default.findOne({ _id: _id });
    if (!updateSubcategoryInfo) {
        throw new AppError_1.default(404, "Sub category not found");
    }
    const Subcategory = yield subcategory_model_1.default.updateOne({ _id: _id }, data, {
        runValidators: true,
    });
    return Subcategory;
});
exports.updateSubcategoryServices = updateSubcategoryServices;
// Delete a Sub Category
const deleteSubcategoryServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateSubcategoryInfo = yield subcategory_model_1.default.findOne({ _id: _id });
    if (!updateSubcategoryInfo) {
        throw new AppError_1.default(404, "Subcategory not found");
    }
    const Subcategory = yield subcategory_model_1.default.deleteOne({ _id: _id }, {
        runValidators: true,
    });
    return Subcategory;
});
exports.deleteSubcategoryServices = deleteSubcategoryServices;
