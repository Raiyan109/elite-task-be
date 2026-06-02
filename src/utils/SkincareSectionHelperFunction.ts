import { BrandModel } from "../modules/Brand/brand.model";
import ProductModel from "../modules/Product/product.model";

export const getSkincareSectionProducts = async (sectionField: string, categoryName: string, limit = 10) => {
    const pipeline: any[] = [
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

    return await ProductModel.aggregate(pipeline);
};



// checking directly from brand since BrandModel has field category_id
export const getSkincareBrands = async (categoryName: string) => {
    return await BrandModel.aggregate([
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
};
