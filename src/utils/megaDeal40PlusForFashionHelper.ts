import ProductModel from "../modules/Product/product.model";

export const megaDeal40PlusProducts = async (categoryName: string, limit = 10) => {
  const pipeline: any[] = [
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

  return await ProductModel.aggregate(pipeline);
};



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
