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
exports.megaDeal40PlusProducts = void 0;
const product_model_1 = __importDefault(require("../modules/Product/product.model"));
const megaDeal40PlusProducts = (categoryName_1, ...args_1) => __awaiter(void 0, [categoryName_1, ...args_1], void 0, function* (categoryName, limit = 10) {
    const pipeline = [
        {
            $match: {
                product_status: { $in: ["active", "temporary-in-active"] },
                product_discount_price: { $ne: null }, // only discounted products
                product_price: { $gt: 0 } // prevent division by zero
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
        // Calculate discount percentage
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
        // Keep only products with 40% or more discount
        {
            $match: {
                discountPercent: { $gte: 40 }
            }
        },
        {
            $project: {
                product_name: 1,
                product_price: 1,
                product_discount_price: 1,
                discountPercent: 1,
                thumbnail_image: 1,
                product_slug: 1,
                product_inactivity_start: 1,
                product_inactivity_end: 1,
                product_status: 1,
                product_quantity: 1,
                category_id: {
                    _id: "$category._id",
                    category_name: "$category.category_name"
                }
            }
        },
        //{ $sort: { discountPercent: -1 } }, // optional: best deals first
        { $limit: limit }
    ];
    return yield product_model_1.default.aggregate(pipeline);
});
exports.megaDeal40PlusProducts = megaDeal40PlusProducts;
// export const megaDeal40PlusProducts = async (categoryName: string, limit = 10) => {
//   const pipeline: any[] = [
//     {
//       $match: {
//         product_status: { $in: ["active", "temporary-in-active"] },
//         product_discount_price: { $ne: null } // only discounted products
//       }
//     },
//     {
//       $lookup: {
//         from: "categories",
//         localField: "category_id",
//         foreignField: "_id",
//         as: "category"
//       }
//     },
//     { $unwind: "$category" },
//     { $match: { "category.category_name": categoryName } },
//     // Calculate discount percent
//     {
//       $addFields: {
//         discountPercent: {
//           $cond: [
//             { $eq: ["$discount_show", "percent"] },
//             "$product_discount_price", // already percent
//             {
//               $multiply: [
//                 { $divide: ["$product_discount_price", "$product_price"] },
//                 100
//               ]
//             }
//           ]
//         }
//       }
//     },
//     // Keep only products with 40% or more discount
//     {
//       $match: {
//         discountPercent: { $gte: 40 }
//       }
//     },
//     {
//       $project: {
//         product_name: 1,
//         product_price: 1,
//         product_discount_price: 1,
//         discountPercent: 1,
//         discount_show: 1,
//         thumbnail_image: 1,
//         product_slug: 1,
//         product_inactivity_start: 1,
//         product_inactivity_end: 1,
//         product_status: 1,
//         product_quantity: 1,
//         category_id: {
//           _id: "$category._id",
//           category_name: "$category.category_name"
//         }
//       }
//     },
//     { $limit: limit }
//   ];
//   return await ProductModel.aggregate(pipeline);
// };
