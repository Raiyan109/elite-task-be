import mongoose, { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { IProductInterface } from "../Product/product.interface";
import { comboSearchableField, ICombo } from "./combo.interface";
import { ComboModel } from "./combo.model";
import httpStatus from "http-status";

const createComboServices = async (combo: ICombo) => {
    const isComboExists = await ComboModel.findOne({ name: combo.combo_title })
    if (isComboExists) {
        throw new AppError(httpStatus.CONFLICT, 'This combo is already exists!');
    }
    const result = await ComboModel.create(combo)
    return result
};

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
const findComboServices = async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

    const result = await ComboModel.aggregate([
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
            $sort: { createdAt: -1 }   // or combo_title, or _id, whichever you need
        }
    ]);

    return result;
};


// find related combos
const findRelatedComboServices = async (excludeId: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

    const result = await ComboModel.aggregate([
        // Step 1: Exclude the given comboId
        {
            $match: {
                combo_status: "active",
                _id: { $ne: new mongoose.Types.ObjectId(excludeId) }
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
};


const findDashboardComboServices = async (limit: number, skip: number, searchTerm: string) => {
    const andCondition = [];

    if (searchTerm) {
        andCondition.push({
            $or: comboSearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const result = await ComboModel.find(whereCondition)
        .populate({
            path: 'combo_products.product_id',
            select: 'product_name thumbnail_image product_price product_discount_price product_quantity'
        })
        .skip(skip)
        .limit(limit)
    return result
}

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
const findSingleComboServices = async (slug: string): Promise<ICombo> => {
    // Step 1: Get current time as HH:mm
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

    const result = await ComboModel.aggregate([
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
        throw new AppError(404, "Combo Not Found!");
    }

    return result[0] as ICombo;
};

// get combos by IDs (cart)
// const findCombosByIdsServices = async (ids: Array<string>) => {
//     const combos = await ComboModel.find({ _id: { $in: ids } }).populate('combo_products.product_id')
//     return combos
// }


// get combos by IDs (cart) (alternative, similar logic as find single combo or all combo in the above codes)
const findCombosByIdsServices = async (ids: Array<string>) => {
  const objectIds = ids.map((id) => new Types.ObjectId(id));

  const combos = await ComboModel.aggregate([
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
};

const updateComboServices = async (id: string, updateData: Partial<ICombo>) => {
    const isComboExists = await ComboModel.findById(id);
    if (!isComboExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Combo not found!");
    }

    const result = await ComboModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    return result;
};

const deleteComboServices = async (id: string) => {
    const isComboExists = await ComboModel.findById(id);
    if (!isComboExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Combo not found!");
    }

    // Delete image from spaces (optional)
    if (isComboExists.combo_image_key) {
        await FileUploadHelper.deleteFromSpaces(isComboExists.combo_image_key);
    }

    const result = await ComboModel.findByIdAndDelete(id);
    return result;
};



export const ComboServices = {
    createComboServices,
    findComboServices,
    findRelatedComboServices,
    findDashboardComboServices,
    findSingleComboServices,
    findCombosByIdsServices,
    updateComboServices,
    deleteComboServices,
}