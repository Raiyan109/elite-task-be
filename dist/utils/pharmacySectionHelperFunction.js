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
exports.getPharmacyBrands = exports.getPharmacySectionProducts = void 0;
const brand_model_1 = require("../modules/Brand/brand.model");
const product_model_1 = __importDefault(require("../modules/Product/product.model"));
const getPharmacySectionProducts = (sectionField_1, categoryName_1, ...args_1) => __awaiter(void 0, [sectionField_1, categoryName_1, ...args_1], void 0, function* (sectionField, categoryName, limit = 10) {
    const pipeline = [
        {
            $match: {
                product_status: { $in: ["active", "temporary-in-active"] },
                [sectionField]: true
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: "$category" },
        { $match: { "category.category_name": categoryName } },
        {
            $project: {
                product_name: 1,
                product_price: 1,
                product_discount_price: 1,
                thumbnail_image: 1,
                product_slug: 1,
                product_inactivity_start: 1,
                product_inactivity_end: 1,
                product_status: 1,
                discount_show: 1,
                product_quantity: 1,
                category_id: {
                    _id: "$category._id",
                    category_name: "$category.category_name"
                }
            }
        },
        { $limit: limit }
    ];
    return yield product_model_1.default.aggregate(pipeline);
});
exports.getPharmacySectionProducts = getPharmacySectionProducts;
// checking directly from brand since BrandModel has field category_id
const getPharmacyBrands = (categoryName) => __awaiter(void 0, void 0, void 0, function* () {
    return yield brand_model_1.BrandModel.aggregate([
        // Match the category first
        {
            $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: "$category" },
        {
            $match: {
                "category.category_name": categoryName,
                brand_status: "active" // optional filter for only active brands
            }
        },
        {
            $project: {
                _id: 1,
                brand_name: 1,
            }
        },
        { $sort: { brand_serial: 1 } } // Keep your custom brand ordering
    ]);
});
exports.getPharmacyBrands = getPharmacyBrands;
// it was checking from product category_id and brand_id
// export const getPharmacyBrands = async (categoryName: string) => {
//     const brands = await ProductModel.aggregate([
//         {
//             $lookup: {
//                 from: "categories",
//                 localField: "category_id",
//                 foreignField: "_id",
//                 as: "category"
//             }
//         },
//         { $unwind: "$category" },
//         { $match: { "category.category_name": categoryName } },
//         {
//             $lookup: {
//                 from: "brands",
//                 localField: "brand_id",
//                 foreignField: "_id",
//                 as: "brand"
//             }
//         },
//         { $unwind: { path: "$brand", preserveNullAndEmptyArrays: false } },
//         {
//             $group: {
//                 _id: "$brand._id",
//                 brand_name: { $first: "$brand.brand_name" }
//             }
//         }
//     ]);
//     return brands;
// };
