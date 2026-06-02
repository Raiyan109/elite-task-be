"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ComboServices = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const combo_interface_1 = require("./combo.interface");
const combo_model_1 = require("./combo.model");
const http_status_1 = __importDefault(require("http-status"));
const createComboServices = (combo) => __awaiter(void 0, void 0, void 0, function* () {
    const isComboExists = yield combo_model_1.ComboModel.findOne({ name: combo.combo_title });
    if (isComboExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This combo is already exists!');
    }
    const result = yield combo_model_1.ComboModel.create(combo);
    return result;
});
// const findComboServices = async () => {
//     // const result = await ComboModel.find({}).populate('combo_products.product_id')
//     // return result
//     const combos = await ComboModel.find({ combo_status: 'active' }).populate('combo_products.product_id')
//     const filteredCombos = [];
//     for (const combo of combos) {
//         const quantities: number[] = [];
//         for (const item of combo.combo_products) {
//             const product = item.product_id as IProductInterface;
//             const productQty = product?.product_quantity;
//             if (typeof productQty === 'number') {
//                 quantities.push(productQty);
//             }
//         }
//         // Determine minimum_stock_quantity
//         const minimum_stock_quantity =
//             quantities.length > 0 ? Math.min(...quantities) : null;
//         // Filter based on rules
//         if (minimum_stock_quantity === null || minimum_stock_quantity > 0) {
//             filteredCombos.push({
//                 ...combo.toObject(),
//                 minimum_stock_quantity,
//             });
//         }
//     }
//     return filteredCombos;
// }
// alternative (if product in-active or temporary in-active, then then show accordingly and return empty if only 1 product left in the combo)
const findComboServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"
    const result = yield combo_model_1.ComboModel.aggregate([
        // Step 1: Only active combos
        { $match: { combo_status: "active" } },
        // Step 2: Unwind combo products
        { $unwind: "$combo_products" },
        // Step 3: Lookup products
        {
            $lookup: {
                from: "products",
                localField: "combo_products.product_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        // Step 4: Compute isActive with midnight logic
        {
            $addFields: {
                "product.isActive": {
                    $or: [
                        { $eq: ["$product.product_status", "active"] }, // always active
                        {
                            $and: [
                                { $eq: ["$product.product_status", "temporary-in-active"] },
                                {
                                    $cond: {
                                        if: { $lte: ["$product.product_inactivity_start", "$product.product_inactivity_end"] },
                                        then: {
                                            // Same-day inactivity
                                            $or: [
                                                { $lt: [currentTime, "$product.product_inactivity_start"] },
                                                { $gt: [currentTime, "$product.product_inactivity_end"] }
                                            ]
                                        },
                                        else: {
                                            // Midnight-crossing inactivity
                                            $and: [
                                                { $lt: [currentTime, "$product.product_inactivity_start"] },
                                                { $gt: [currentTime, "$product.product_inactivity_end"] }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // Step 5: Keep only active products
        { $match: { "product.isActive": true } },
        // Step 6: Group back combo products per combo
        {
            $group: {
                _id: "$_id",
                combo_title: { $first: "$combo_title" },
                combo_slug: { $first: "$combo_slug" },
                combo_status: { $first: "$combo_status" },
                combo_image: { $first: "$combo_image" },
                createdAt: { $first: "$createdAt" }, // 👈 keep this field!
                combo_products: {
                    $push: {
                        product_id: "$product", // instead of separate "product" key
                        discount_amount: "$combo_products.discount_amount",
                        product_quantity: "$combo_products.product_quantity",
                        combo_price: "$combo_products.combo_price"
                    }
                },
                stock_quantities: { $push: "$product.product_quantity" }
            }
        },
        // Step 7: Compute minimum stock quantity
        {
            $addFields: {
                minimum_stock_quantity: {
                    $cond: [
                        { $gt: [{ $size: "$stock_quantities" }, 0] },
                        { $min: "$stock_quantities" },
                        null
                    ]
                }
            }
        },
        // Step 8: Exclude combos with only 1 product left
        {
            $match: {
                $expr: { $gt: [{ $size: "$combo_products" }, 1] }
            }
        },
        // Step 9: Keep only combos where min stock > 0 or null
        {
            $match: {
                $or: [
                    { minimum_stock_quantity: null },
                    { minimum_stock_quantity: { $gt: 0 } }
                ]
            }
        },
        // Step 10: Sort combos
        {
            $sort: { createdAt: -1 } // or combo_title, or _id, whichever you need
        }
    ]);
    return result;
});
// find related combos
const findRelatedComboServices = (excludeId) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"
    const result = yield combo_model_1.ComboModel.aggregate([
        // Step 1: Exclude the given comboId
        {
            $match: {
                combo_status: "active",
                _id: { $ne: new mongoose_1.default.Types.ObjectId(excludeId) }
            }
        },
        // Step 2: Unwind combo products
        { $unwind: "$combo_products" },
        // Step 3: Lookup products
        {
            $lookup: {
                from: "products",
                localField: "combo_products.product_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        // Step 4: Compute isActive with midnight logic
        {
            $addFields: {
                "product.isActive": {
                    $or: [
                        { $eq: ["$product.product_status", "active"] },
                        {
                            $and: [
                                { $eq: ["$product.product_status", "temporary-in-active"] },
                                {
                                    $cond: {
                                        if: { $lte: ["$product.product_inactivity_start", "$product.product_inactivity_end"] },
                                        then: {
                                            $or: [
                                                { $lt: [currentTime, "$product.product_inactivity_start"] },
                                                { $gt: [currentTime, "$product.product_inactivity_end"] }
                                            ]
                                        },
                                        else: {
                                            $and: [
                                                { $lt: [currentTime, "$product.product_inactivity_start"] },
                                                { $gt: [currentTime, "$product.product_inactivity_end"] }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // Step 5: Keep only active products
        { $match: { "product.isActive": true } },
        // Step 6: Group back combo products per combo
        {
            $group: {
                _id: "$_id",
                combo_title: { $first: "$combo_title" },
                combo_slug: { $first: "$combo_slug" },
                combo_status: { $first: "$combo_status" },
                combo_image: { $first: "$combo_image" },
                combo_products: {
                    $push: {
                        product_id: "$product",
                        discount_amount: "$combo_products.discount_amount",
                        product_quantity: "$combo_products.product_quantity",
                        combo_price: "$combo_products.combo_price"
                    }
                },
                stock_quantities: { $push: "$product.product_quantity" }
            }
        },
        // Step 7: Compute minimum stock quantity
        {
            $addFields: {
                minimum_stock_quantity: {
                    $cond: [
                        { $gt: [{ $size: "$stock_quantities" }, 0] },
                        { $min: "$stock_quantities" },
                        null
                    ]
                }
            }
        },
        // Step 8: Exclude combos with only 1 product left
        {
            $match: {
                $expr: { $gt: [{ $size: "$combo_products" }, 1] }
            }
        },
        // Step 9: Keep only combos where min stock > 0 or null
        {
            $match: {
                $or: [
                    { minimum_stock_quantity: null },
                    { minimum_stock_quantity: { $gt: 0 } }
                ]
            }
        }
    ]);
    return result;
});
const findDashboardComboServices = (limit, skip, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: combo_interface_1.comboSearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const result = yield combo_model_1.ComboModel.find(whereCondition)
        .populate({
        path: 'combo_products.product_id',
        select: 'product_name thumbnail_image product_price product_discount_price product_quantity'
    })
        .skip(skip)
        .limit(limit);
    return result;
});
// get single products
// const findSingleComboServices = async (id: string) => {
//     const combo = await ComboModel.findOne({
//         combo_slug: id,
//         combo_status: { $in: ['active'] }
//     }).populate('combo_products.product_id')
//         .select("-__v")
//         .lean(); // Use .lean() to return a plain JavaScript object
//     if (!combo) {
//         throw new AppError(404, "Combo Not Found !");
//     }
//     return { ...combo };
// }
// get single combo products (alternative if product is temporary in-active or in-active, don't get those combo products)
const findSingleComboServices = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Get current time as HH:mm
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"
    const result = yield combo_model_1.ComboModel.aggregate([
        { $match: { combo_slug: slug, combo_status: "active" } },
        { $unwind: "$combo_products" },
        {
            $lookup: {
                from: "products",
                localField: "combo_products.product_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        //{ $match: { "product.product_status": "active" } },
        // Step 2: Add computed field for isActive
        {
            $addFields: {
                "product.isActive": {
                    $or: [
                        // Normal active status
                        { $eq: ["$product.product_status", "active"] },
                        // Temporary-in-active handling
                        {
                            $and: [
                                { $eq: ["$product.product_status", "temporary-in-active"] },
                                {
                                    $cond: {
                                        if: { $lte: ["$product.product_inactivity_start", "$product.product_inactivity_end"] },
                                        then: {
                                            // Case 1: start <= end (same-day range)
                                            $or: [
                                                { $lt: [currentTime, "$product.product_inactivity_start"] },
                                                { $gt: [currentTime, "$product.product_inactivity_end"] }
                                            ]
                                        },
                                        else: {
                                            // Case 2: start > end (midnight-crossing range)
                                            $and: [
                                                { $lt: [currentTime, "$product.product_inactivity_start"] },
                                                { $gt: [currentTime, "$product.product_inactivity_end"] }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        },
        // Step 3: Filter only active products
        { $match: { "product.isActive": true } },
        {
            $group: {
                _id: "$_id",
                combo_title: { $first: "$combo_title" },
                combo_slug: { $first: "$combo_slug" },
                combo_status: { $first: "$combo_status" },
                combo_image: { $first: "$combo_image" }, // <-- include combo image
                combo_products: {
                    $push: {
                        product_id: "$product",
                        discount_amount: "$combo_products.discount_amount",
                        product_quantity: "$combo_products.product_quantity",
                        combo_price: "$combo_products.combo_price"
                    }
                },
                stock_quantities: { $push: "$product.product_quantity" }
            }
        },
        // Step 4: Compute minimum stock quantity
        {
            $addFields: {
                minimum_stock_quantity: {
                    $cond: [
                        { $gt: [{ $size: "$stock_quantities" }, 0] },
                        { $min: "$stock_quantities" },
                        null
                    ]
                }
            }
        },
        // Step 5: Exclude combos with only 1 product left
        {
            $match: {
                $expr: { $gt: [{ $size: "$combo_products" }, 1] }
            }
        },
        // Step 6: Keep only combos where min stock > 0 or null
        {
            $match: {
                $or: [
                    { minimum_stock_quantity: null },
                    { minimum_stock_quantity: { $gt: 0 } }
                ]
            }
        }
    ]);
    if (!result || result.length === 0) {
        throw new AppError_1.default(404, "Combo Not Found!");
    }
    return result[0];
});
// get combos by IDs (cart)
// const findCombosByIdsServices = async (ids: Array<string>) => {
//     const combos = await ComboModel.find({ _id: { $in: ids } }).populate('combo_products.product_id')
//     return combos
// }
// get combos by IDs (cart) (alternative, similar logic as find single combo or all combo in the above codes)
const findCombosByIdsServices = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const objectIds = ids.map((id) => new mongoose_1.Types.ObjectId(id));
    const combos = yield combo_model_1.ComboModel.aggregate([
        // Step 1: Match by IDs
        { $match: { _id: { $in: objectIds }, combo_status: "active" } },
        // Step 2: Unwind combo products
        { $unwind: "$combo_products" },
        // Step 3: Lookup product details
        {
            $lookup: {
                from: "products",
                localField: "combo_products.product_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        // Step 4: Group back combos with products
        {
            $group: {
                _id: "$_id",
                combo_title: { $first: "$combo_title" },
                combo_slug: { $first: "$combo_slug" },
                combo_status: { $first: "$combo_status" },
                combo_image: { $first: "$combo_image" },
                combo_products: {
                    $push: {
                        product_id: "$product", // instead of separate "product" key
                        discount_amount: "$combo_products.discount_amount",
                        product_quantity: "$combo_products.product_quantity",
                        combo_price: "$combo_products.combo_price",
                    },
                },
                stock_quantities: { $push: "$product.product_quantity" },
            },
        },
        // Step 5: Compute minimum stock quantity
        {
            $addFields: {
                minimum_stock_quantity: {
                    $cond: [
                        { $gt: [{ $size: "$stock_quantities" }, 0] },
                        { $min: "$stock_quantities" },
                        null,
                    ],
                },
            },
        },
        // Step 6: Exclude combos with only 1 product left
        {
            $match: {
                $expr: { $gt: [{ $size: "$combo_products" }, 1] },
            },
        },
        // Step 7: Exclude combos where min stock <= 0
        {
            $match: {
                $or: [
                    { minimum_stock_quantity: null },
                    { minimum_stock_quantity: { $gt: 0 } },
                ],
            },
        },
    ]);
    return combos;
});
const updateComboServices = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const isComboExists = yield combo_model_1.ComboModel.findById(id);
    if (!isComboExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Combo not found!");
    }
    const result = yield combo_model_1.ComboModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteComboServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isComboExists = yield combo_model_1.ComboModel.findById(id);
    if (!isComboExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Combo not found!");
    }
    // Delete image from spaces (optional)
    if (isComboExists.combo_image_key) {
        yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(isComboExists.combo_image_key);
    }
    const result = yield combo_model_1.ComboModel.findByIdAndDelete(id);
    return result;
});
exports.ComboServices = {
    createComboServices,
    findComboServices,
    findRelatedComboServices,
    findDashboardComboServices,
    findSingleComboServices,
    findCombosByIdsServices,
    updateComboServices,
    deleteComboServices,
};
