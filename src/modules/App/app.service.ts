import { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { CartItem, getCartItems, getComboCartQuantity, getProductCartQuantity } from "../../helpers/cartHelper";
import { checkProductAvailability } from "../../utils/checkAvailability";
import { getPharmacyBrands, getPharmacySectionProducts } from "../../utils/pharmacySectionHelperFunction";
import { BannerModel } from "../Banner/banner.model";
import { BrandModel } from "../Brand/brand.model";
import { CartModel } from "../Cart/cart.model";
import { ICategoryInterface } from "../Category/category.interface";
import CategoryModel from "../Category/category.model";
import ChildcategoryModel from "../Childcategory/childcategory.model";
import { ICombo, IComboProducts } from "../Combo/combo.interface";
import { ComboModel } from "../Combo/combo.model";
import { HotDealModel } from "../HotDeals/hotDeal.model";
import { IProductInterface } from "../Product/product.interface";
import ProductModel from "../Product/product.model";
import SubcategoryModel from "../Subcategory/subcategory.model";
import { YTLinkModel } from "../YTLink/ytLink.model";
import { getSkincareBrands, getSkincareSectionProducts } from "../../utils/SkincareSectionHelperFunction";
import { megaDeal40PlusProducts } from "../../utils/megaDeal40PlusForFashionHelper";
import { getFashionBrands, getFashionSectionProducts } from "../../utils/fashionSectionHelperFunction";
import userModel from "../User/user.model";
import { IUserInterface } from "../User/user.interface";
import { hashPassword } from "../../helpers/hashHelper";
import httpStatus from "http-status";
import { OrderModel } from "../Order/order.model";
import { RefundModel } from "../Refund/refund.model";
import { AddressModel } from "../Address/address.model";

// Home page: Banner and Reels
const findBannerAndReelsServices = async (queryParams: Record<string, unknown>) => {
    const reels = await YTLinkModel.find({ ytLink_status: "active" }, { ytLink_link: 1, _id: 1 }).sort({ ytLink_serial: 1 })

    const banners = await BannerModel.find({ banner_status: 'active', banner_position: 'home-top' }, { banner_image: 1, banner_path: 1, _id: 0 })

    return {
        reels,
        banners
    };
};

// Home page: Grocery (Category wise)
const findCategoryWiseProductsServices = async (queryParams: Record<string, unknown>, user_id: string) => {
    const categoryName = queryParams.category as string;

    // GET category
    const categoryBanner = await CategoryModel.findOne({ category_name: categoryName }, { category_banner: 1, _id: -1 })
    console.log('categoryBanner >>>>>>>>>', categoryBanner);

    //Get Youtube Reels category wise
    const youtubeReels = await YTLinkModel.find({ category_type: categoryName }).select('_id ytLink_link').lean();

    // GET Cart by user_id
    const userCart = await CartModel.find({ user_id: user_id }, { cart_items: 1 });
    const cartItems: CartItem[] = getCartItems(userCart);

    // First get the active hot deal to check for discounts
    const activeHotDeal = await HotDealModel.findOne({}).populate('hotDeal_products.product_id');

    const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);


    // Helper function to apply hot deal discounts to products
    // const applyHotDealDiscounts = (products: any[]) => {
    //     return products.map(product => {
    //         if (!activeHotDeal) return product;

    //         // Find if this product has a hot deal
    //         const hotDealItem = activeHotDeal.hotDeal_products.find(
    //             (item: any) => item.product_id?._id.toString() === product._id.toString()
    //         );

    //         if (hotDealItem) {
    //             const originalPrice = product.product_discount_price || product.product_price;
    //             const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

    //             return {
    //                 ...product,
    //                 product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
    //                 is_hot_deal: true, // Optional: flag to indicate hot deal
    //                 hot_deal_discount: hotDealItem.discount_amount,
    //                 hot_deal_start_date: activeHotDeal.hotDeal_start_date,
    //                 hot_deal_end_date: activeHotDeal.hotDeal_end_date
    //             };
    //         }
    //         return product;
    //     });
    // };

    const applyHotDealDiscounts = (products: any[]) => {
        // If no active hot deal or no hot deal products, return original products
        if (!activeHotDeal || hotDealProductIds?.length === 0) return products;

        return products.map(product => {
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find(
                (item: any) => item.product_id?._id.toString() === product._id.toString()
            );

            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

                return {
                    ...product,
                    product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
                    is_hot_deal: true, // Optional: flag to indicate hot deal
                    hot_deal_discount: hotDealItem.discount_amount,
                    hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                    hot_deal_end_date: activeHotDeal.hotDeal_end_date
                };
            }
            return product;
        });
    };

    // Step 3: Query ProductModel with aggregation
    let hotDealsProducts = [];
    if (hotDealProductIds && hotDealProductIds.length > 0) {
        hotDealsProducts = await ProductModel.aggregate([
            {
                $match: {
                    _id: { $in: hotDealProductIds },
                    product_status: { $in: ['active', 'temporary-in-active'] }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $match: {
                    'category.category_name': categoryName
                }
            },
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
                        _id: '$category._id',
                        category_name: '$category.category_name'
                    },
                }
            }
        ]);
    }

    // Helper function to calculate combo discount prices
    // const calculateComboDiscountedPrice = (combo: any) => {
    //     if (!combo?.combo_products?.length) return 0;

    //     return combo.combo_products.reduce((total: number, item: any) => {
    //         const product = item.product_id;
    //         if (!product) return total;

    //         const quantity = item.product_quantity || 1;
    //         const basePrice = product.product_discount_price || product.product_price || 0;
    //         let productTotal = basePrice * quantity;

    //         productTotal -= item.discount_amount * quantity;
    //         return total + productTotal;
    //     }, 0);
    // };

    // const calculateComboDiscountedPrice = (combo: any, categoryName: string) => {
    //     if (!combo?.combo_products?.length) return 0;

    //     // Filter combo products by category first
    //     const filteredComboProducts = combo.combo_products.filter((item: any) => {
    //         return item.product_id?.category_id?.category_name === categoryName;
    //     });

    //     if (filteredComboProducts.length === 0) return null; // Skip combos with no products in this category

    //     return filteredComboProducts.reduce((total: number, item: any) => {
    //         const product = item.product_id;
    //         if (!product) return total;

    //         const quantity = item.product_quantity || 1;
    //         const basePrice = product.product_discount_price || product.product_price || 0;
    //         let productTotal = basePrice * quantity;

    //         productTotal -= item.discount_amount * quantity;
    //         return total + productTotal;
    //     }, 0);
    // };

    const calculateComboDiscountedPrice = (combo: any) => {
        if (!combo?.combo_products?.length) return 0;

        return combo.combo_products.reduce((total: number, item: any) => {
            const price = typeof item.combo_price === 'number' ? item.combo_price : 0;
            return total + price;
        }, 0);
    };


    const popularProducts = await ProductModel.aggregate([
        { $sort: { product_order_count: -1 } },
        {
            $match: {
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        {
            $match: {
                product_order_count: { $gte: 1 }
            }
        },
        {
            $lookup: {
                from: 'categories', // your Category collection name
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $match: {
                'category.category_name': categoryName
            }
        },
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
            }
        },
        { $limit: 10 }
    ]);

    const offeredProducts = await ProductModel.aggregate([
        {
            $match: {
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        {
            $lookup: {
                from: 'categories', // your Category collection name
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $match: {
                'category.category_name': categoryName
            }
        },
        {
            $match: {
                'offered_product_show': true
            }
        },
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
            }
        },
        { $limit: 10 }
    ]);

    const newUploadedProducts = await ProductModel.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $match: {
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        {
            $lookup: {
                from: 'categories', // your Category collection name
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $match: {
                'category.category_name': categoryName
            }
        },
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
            }
        },
        { $limit: 10 }
    ]);

    // for common categories section (50% up mega deals)
    const megaDealProducts = await ProductModel.aggregate([
        {
            $match: {
                product_status: { $in: ["active", "temporary-in-active"] }
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
        {
            $match: {
                "category.category_name": categoryName
            }
        },
        {
            $addFields: {
                discountPercentage: {
                    $cond: [
                        { $gt: ["$product_discount_price", 0] },
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
                        0
                    ]
                }
            }
        },
        {
            $match: {
                discountPercentage: { $gte: 50 }
            }
        },
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
        { $limit: 10 }
    ]);

    const comboProducts = await ComboModel.find({})
        // .populate('combo_products.product_id');
        .populate({
            path: 'combo_products.product_id',
            select: 'product_name product_price product_discount_price thumbnail_image category_id product_status product_inactivity_start product_inactivity_end product_quantity',
            populate: {
                path: 'category_id',
                select: '_id category_name'
            }
        })

    // const comboWithPrices = comboProducts.map((combo) => ({
    //     ...combo.toObject(),
    //     final_price: calculateComboDiscountedPrice(combo, categoryName),
    // }));

    const comboWithPrices = comboProducts
        .map((combo) => {
            const finalPrice = calculateComboDiscountedPrice(combo, /*categoryName*/);
            if (finalPrice === null) return null; // Skip combos with no products in this category

            return {
                ...combo.toObject(),
                final_price: finalPrice,
            };
        })
        .filter(combo => combo !== null);

    // const simplifiedCombos = comboWithPrices.map((combo) => ({
    //     product_name: combo.combo_title,
    //     thumbnail_image: combo.combo_image,
    //     product_price: combo.final_price,
    //     type: 'combo'

    //     // cart_quantity: getComboCartQuantity(cartItems, combo._id as string)
    // }));
    const simplifiedCombos = comboWithPrices.map((combo) => {
        // Check availability of all products in the combo
        const allProductsAvailable = combo.combo_products.every((item: any) => {
            if (!item.product_id) return false; // if product is missing, consider unavailable
            return checkProductAvailability(item.product_id).isAvailable;
        });


        const quantities: number[] = combo.combo_products
            .map((item) => (item?.product_id as any)?.product_quantity)
            .filter((q): q is number => typeof q === 'number');

        const minStock = quantities.length > 0 ? Math.min(...quantities) : null;

        return {
            _id: combo._id,
            product_name: combo.combo_title,
            product_slug: combo.combo_slug,
            thumbnail_image: combo.combo_image,
            product_price: combo.final_price,
            product_quantity: minStock,
            type: 'combo',
            availability: {
                isAvailable: allProductsAvailable
            }
            // cart_quantity: getComboCartQuantity(cartItems, combo._id as string)
        };
    });


    const getCategoryBrandProducts = async (
        categoryName: string,
        brandName?: string,
        extraMatch: Record<string, unknown> = {},
        limit = 10
    ) => {
        const pipeline: any[] = [
            {
                $match: {
                    product_status: { $in: ['active', 'temporary-in-active'] },
                    ...extraMatch
                }
            },
            // Lookup category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            { $match: { 'category.category_name': categoryName } },
            // Lookup brand
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        ];

        // Apply brand filter if provided
        if (brandName) {
            pipeline.push({
                $match: { 'brand.brand_name': brandName }
            });
        }

        // Project only needed fields
        pipeline.push({
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
                brand_id: {
                    _id: '$brand._id',
                    brand_name: '$brand.brand_name'
                }
            }
        });

        pipeline.push({ $limit: limit });

        return await ProductModel.aggregate(pipeline);
    };



    // Apply hot deal discounts to all product arrays
    const popularWithDiscounts = applyHotDealDiscounts(popularProducts);
    const offeredWithDiscounts = applyHotDealDiscounts(offeredProducts);
    const newWithDiscounts = applyHotDealDiscounts(newUploadedProducts);
    const hotWithDiscounts = applyHotDealDiscounts(hotDealsProducts);
    const megaDealWithDiscounts = applyHotDealDiscounts(megaDealProducts);

    // Nestle
    const nestleProductsRaw = await getCategoryBrandProducts(categoryName, 'Nestle');
    const nestleWithDiscounts = applyHotDealDiscounts(nestleProductsRaw);

    // Unilever
    const unileverProductsRaw = await getCategoryBrandProducts(categoryName, 'Unilever');
    const unileverWithDiscounts = applyHotDealDiscounts(unileverProductsRaw);


    const formatProductResponse = (product: any) => {
        const {
            product_inactivity_start,
            product_inactivity_end,
            product_status,
            ...rest
        } = product;

        return {
            ...rest,
            availability: checkProductAvailability(product),
            type: 'product'
            // cart_quantity: getProductCartQuantity(cartItems, product._id)
        };
    };

    const popularProductsWithAvailability = popularWithDiscounts.map(formatProductResponse)
    const offeredProductsWithAvailability = offeredWithDiscounts.map(formatProductResponse)
    const newProductsWithAvailability = newWithDiscounts.map(formatProductResponse)
    const megaDealProductsWithAvailability = megaDealWithDiscounts.map(formatProductResponse)

    // Nestle
    const nestleProductsWithAvailability = nestleWithDiscounts.map(formatProductResponse);

    // Unilever
    const unileverProductsWithAvailability = unileverWithDiscounts.map(formatProductResponse);

    // Create the hot deals products array with dates first
    let formattedHotDealsProducts;
    if (hotWithDiscounts.length > 0) {
        formattedHotDealsProducts = {
            hotDeal_start_date: activeHotDeal?.hotDeal_start_date,
            hotDeal_end_date: activeHotDeal?.hotDeal_end_date,
            hotWithDiscounts: hotWithDiscounts.map(formatProductResponse)
        };
    } else {
        formattedHotDealsProducts = {
            hotWithDiscounts: []
        };
    }

    if (categoryName === "Pharmacy") {

        const healthAndNutrientsRaw = await getPharmacySectionProducts("pharmacy_section_1_show", categoryName);
        const covid19Raw = await getPharmacySectionProducts("pharmacy_section_2_show", categoryName);
        const adultRaw = await getPharmacySectionProducts("pharmacy_section_3_show", categoryName);
        const supplementRaw = await getPharmacySectionProducts("pharmacy_section_4_show", categoryName);
        const herbalRaw = await getPharmacySectionProducts("pharmacy_section_5_show", categoryName);
        const firstAidRaw = await getPharmacySectionProducts("pharmacy_section_6_show", categoryName);

        const healthAndNutrientsProducts = healthAndNutrientsRaw.map(formatProductResponse);
        const covid19Products = covid19Raw.map(formatProductResponse);
        const adultProducts = adultRaw.map(formatProductResponse);
        const supplementProducts = supplementRaw.map(formatProductResponse);
        const herbalProducts = herbalRaw.map(formatProductResponse);
        const firstAidProducts = firstAidRaw.map(formatProductResponse);

        const pharmacyBrands = await getPharmacyBrands(categoryName);

        return {
            categoryBanner: [{ banners: categoryBanner?.category_banner }],
            youtubeReels,
            healthAndNutrientsProducts,
            covid19Products,
            adultProducts,
            supplementProducts,
            herbalProducts,
            firstAidProducts,
            pharmacyBrands
        };
    }


    if (categoryName === "Beauty & Skincare") {

        const buyAndGetRaw = await getSkincareSectionProducts("skincare_section_1_show", categoryName);
        const winterRaw = await getSkincareSectionProducts("skincare_section_2_show", categoryName);
        const summerRaw = await getSkincareSectionProducts("skincare_section_3_show", categoryName);
        const bestSellingRaw = await getSkincareSectionProducts("skincare_section_4_show", categoryName);
        const hairFallRaw = await getSkincareSectionProducts("skincare_section_5_show", categoryName);

        const buyAndGetProducts = buyAndGetRaw.map(formatProductResponse);
        const winterProducts = winterRaw.map(formatProductResponse);
        const summerProducts = summerRaw.map(formatProductResponse);
        const bestSellingProducts = bestSellingRaw.map(formatProductResponse);
        const hairFallProducts = hairFallRaw.map(formatProductResponse);

        const skincareBrands = await getSkincareBrands(categoryName);

        return {
            categoryBanner: [{ banners: categoryBanner?.category_banner }],
            youtubeReels,
            buyAndGetProducts,
            winterProducts,
            summerProducts,
            bestSellingProducts,
            hairFallProducts,
            skincareBrands
        };
    }


    if (categoryName === "Fashion") {

        const popularRaw = await getFashionSectionProducts("fashion_section_1_show", categoryName);
        const winterRaw = await getFashionSectionProducts("fashion_section_2_show", categoryName);
        const womenRaw = await getFashionSectionProducts("fashion_section_3_show", categoryName);
        const menRaw = await getFashionSectionProducts("fashion_section_4_show", categoryName);
        const kidsRaw = await getFashionSectionProducts("fashion_section_5_show", categoryName);
        const megaDealRaw = await megaDeal40PlusProducts(categoryName);

        const popularProducts = popularRaw.map(formatProductResponse);
        const winterProducts = winterRaw.map(formatProductResponse);
        const womenProducts = womenRaw.map(formatProductResponse);
        const menProducts = menRaw.map(formatProductResponse);
        const kidsProducts = kidsRaw.map(formatProductResponse);
        const megaDealProducts = megaDealRaw.map(formatProductResponse);

        const fashionBrands = await getFashionBrands(categoryName);

        return {
            categoryBanner: [{ banners: categoryBanner?.category_banner }],
            youtubeReels,
            popularProducts,
            winterProducts,
            womenProducts,
            menProducts,
            kidsProducts,
            megaDealProducts,
            fashionBrands
        };
    }


    // for common categories
    const excludedCategories = [
        'Grocery',
        'Pharmacy',
        'Beauty & Skincare',
        'Fashion',
        'Food'
    ];

    if (!excludedCategories.includes(categoryName)) {
        return {
            categoryBanner: [{ banners: categoryBanner?.category_banner }],
            youtubeReels,
            popularProducts: popularProductsWithAvailability,
            offeredProducts: offeredProductsWithAvailability,
            newUploadedProducts: newProductsWithAvailability,
            megaDealProducts: megaDealProductsWithAvailability,
        };
    }


    return {
        categoryBanner: [{ banners: categoryBanner?.category_banner }], //categoryName !== 'Grocery' ? [{ banners: categoryBanner?.category_banner }] : [],
        youtubeReels,
        popularProducts: popularProductsWithAvailability,
        offeredProducts: offeredProductsWithAvailability,
        newUploadedProducts: newProductsWithAvailability,
        nestleProducts: nestleProductsWithAvailability,
        unileverProducts: unileverProductsWithAvailability,
        hotDealsProducts: formattedHotDealsProducts,
        comboProducts: simplifiedCombos,
    };

    // return {
    //     popularProducts,
    //     offeredProducts,
    //     newUploadedProducts,
    //     hotDealsProducts,
    // };
};

// Category wise subcategories
const findCategoryWiseSubcategoriesServices = async (queryParams: Record<string, unknown>) => {
    const categoryName = queryParams.category as string;

    // Find category by name
    const category = await CategoryModel.findOne({ category_name: categoryName, category_status: 'active' });
    if (!category) {
        throw new Error('Category not found');
    }

    // Find all subcategories of that category
    const subcategories = await SubcategoryModel.find(
        { category_id: category._id, subcategory_status: 'active' },
        { subcategory_name: 1, subcategory_logo: 1, subcategory_banner: 1 }
    ).sort({ subcategory_serial: 1 }).lean();

    // Get all childcategories for those subcategories
    const subcategoryIds = subcategories.map(sub => sub._id);
    const childcategories = await ChildcategoryModel.find(
        { subcategory_id: { $in: subcategoryIds }, childcategory_status: 'active' },
        { childcategory_name: 1, childcategory_logo: 1, subcategory_id: 1 }
    ).sort({ childcategory_serial: 1 }).lean();

    // Nest childcategories into their respective subcategories
    const nestedSubcategories = subcategories.map(sub => {
        const children = childcategories.filter(child => child.subcategory_id.equals(sub._id));
        return { ...sub, childrens: children };
    });

    return nestedSubcategories;
};

// Category wise only subcategories
const findCategoryWiseOnlySubcategoriesServices = async (queryParams: Record<string, unknown>) => {
    const categoryName = queryParams.category as string;
    const subcategoryId = queryParams.subcategory_id as string | undefined;


    // Find category by name
    const category = await CategoryModel.findOne({ category_name: categoryName, category_status: 'active' });
    if (!category) {
        throw new Error('Category not found');
    }

    // If subcategory_id is provided → fetch childcategories
    if (subcategoryId) {
        const subcategory = await SubcategoryModel.findOne({
            _id: subcategoryId,
            category_id: category._id,
            subcategory_status: "active",
        });
        if (!subcategory) {
            throw new Error("Subcategory not found under this category");
        }


        const childcategories = await ChildcategoryModel.find(
            {
                // category_id: category._id, // category_id is optional that's why commented, (if not optional, then it will also work)
                subcategory_id: subcategory._id,
                childcategory_status: "active",
            },
            { childcategory_name: 1, childcategory_logo: 1 }
        ).sort({ childcategory_serial: 1 }).lean();


        return childcategories;
    }

    // Otherwise Find all subcategories of that category
    const subcategories = await SubcategoryModel.find(
        { category_id: category._id, subcategory_status: 'active' },
        { subcategory_name: 1, subcategory_logo: 1 }
    ).sort({ subcategory_serial: 1 }).lean();

    // Get all childcategories for those subcategories
    // const subcategoryIds = subcategories.map(sub => sub._id);


    // // Nest childcategories into their respective subcategories
    // const nestedSubcategories = subcategories.map(sub => {
    //     const children = childcategories.filter(child => child.subcategory_id.equals(sub._id));
    //     return { ...sub, childrens: children };
    // });

    return subcategories;
};

// const findCategorySectionWiseAllProductsServices = async (queryParams: Record<string, unknown>) => {
//     const categoryName = queryParams.category as string;
//     const section = queryParams.section as string;

//     const page = Number(queryParams.page) || 1;
//     const limit = Number(queryParams.limit) || 10;
//     const skip = (page - 1) * limit;

//     // First get the active hot deal to check for discounts
//     const activeHotDeal = await HotDealModel.findOne({}).populate('hotDeal_products.product_id');

//     const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);

//     const applyHotDealDiscounts = (products: any[]) => {
//         // If no active hot deal or no hot deal products, return original products
//         if (!activeHotDeal || hotDealProductIds?.length === 0) return products;

//         return products.map(product => {
//             // Find if this product has a hot deal
//             const hotDealItem = activeHotDeal.hotDeal_products.find(
//                 (item: any) => item.product_id?._id.toString() === product._id.toString()
//             );

//             if (hotDealItem) {
//                 const originalPrice = product.product_discount_price || product.product_price;
//                 const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

//                 return {
//                     ...product,
//                     product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
//                     is_hot_deal: true, // Optional: flag to indicate hot deal
//                     hot_deal_discount: hotDealItem.discount_amount,
//                     hot_deal_start_date: activeHotDeal.hotDeal_start_date,
//                     hot_deal_end_date: activeHotDeal.hotDeal_end_date
//                 };
//             }
//             return product;
//         });
//     };

//     // Step 3: Query ProductModel with aggregation
//     let hotDealsProducts = [];
//     if (hotDealProductIds && hotDealProductIds.length > 0) {
//         hotDealsProducts = await ProductModel.aggregate([
//             {
//                 $match: {
//                     _id: { $in: hotDealProductIds },
//                     product_status: { $in: ['active', 'temporary-in-active'] }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'categories',
//                     localField: 'category_id',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             { $unwind: '$category' },
//             {
//                 $match: {
//                     'category.category_name': categoryName
//                 }
//             },
//             {
//                 $project: {
//                     product_name: 1,
//                     product_price: 1,
//                     product_discount_price: 1,
//                     thumbnail_image: 1,
//                     product_slug: 1,
//                     product_inactivity_start: 1,
//                     product_inactivity_end: 1,
//                     product_status: 1,
//                     discount_show: 1,
//                     product_quantity: 1,
//                     category_id: {
//                         _id: '$category._id',
//                         category_name: '$category.category_name'
//                     },
//                 }
//             },
//             { $skip: skip },
//             { $limit: limit }
//         ]);
//     }

//     const calculateComboDiscountedPrice = (combo: any) => {
//         if (!combo?.combo_products?.length) return 0;

//         return combo.combo_products.reduce((total: number, item: any) => {
//             const price = typeof item.combo_price === 'number' ? item.combo_price : 0;
//             return total + price;
//         }, 0);
//     };


//     const popularProducts = await ProductModel.aggregate([
//         { $sort: { product_order_count: -1 } },
//         {
//             $match: {
//                 product_status: { $in: ['active', 'temporary-in-active'] }
//             }
//         },
//         {
//             $match: {
//                 product_order_count: { $gte: 1 }
//             }
//         },
//         {
//             $lookup: {
//                 from: 'categories', // your Category collection name
//                 localField: 'category_id',
//                 foreignField: '_id',
//                 as: 'category'
//             }
//         },
//         {
//             $unwind: '$category'
//         },
//         {
//             $match: {
//                 'category.category_name': categoryName
//             }
//         },
//         {
//             $project: {
//                 product_name: 1,
//                 product_price: 1,
//                 product_discount_price: 1,
//                 thumbnail_image: 1,
//                 product_slug: 1,
//                 product_inactivity_start: 1,
//                 product_inactivity_end: 1,
//                 product_status: 1,
//                 discount_show: 1,
//                 product_quantity: 1,
//                 category_id: {
//                     _id: '$category._id',
//                     category_name: '$category.category_name'
//                 },
//             }
//         },
//         { $skip: skip },
//         { $limit: limit }
//     ]);

//     const offeredProducts = await ProductModel.aggregate([
//         {
//             $match: {
//                 product_status: { $in: ['active', 'temporary-in-active'] }
//             }
//         },
//         {
//             $lookup: {
//                 from: 'categories', // your Category collection name
//                 localField: 'category_id',
//                 foreignField: '_id',
//                 as: 'category'
//             }
//         },
//         {
//             $unwind: '$category'
//         },
//         {
//             $match: {
//                 'category.category_name': categoryName
//             }
//         },
//         {
//             $match: {
//                 'offered_product_show': true
//             }
//         },
//         {
//             $project: {
//                 product_name: 1,
//                 product_price: 1,
//                 product_discount_price: 1,
//                 thumbnail_image: 1,
//                 product_slug: 1,
//                 product_inactivity_start: 1,
//                 product_inactivity_end: 1,
//                 product_status: 1,
//                 discount_show: 1,
//                 product_quantity: 1,
//                 category_id: {
//                     _id: '$category._id',
//                     category_name: '$category.category_name'
//                 },
//             }
//         },
//         { $skip: skip },
//         { $limit: limit }
//     ]);

//     const newUploadedProducts = await ProductModel.aggregate([
//         { $sort: { createdAt: -1 } },
//         {
//             $match: {
//                 product_status: { $in: ['active', 'temporary-in-active'] }
//             }
//         },
//         {
//             $lookup: {
//                 from: 'categories', // your Category collection name
//                 localField: 'category_id',
//                 foreignField: '_id',
//                 as: 'category'
//             }
//         },
//         {
//             $unwind: '$category'
//         },
//         {
//             $match: {
//                 'category.category_name': categoryName
//             }
//         },
//         {
//             $project: {
//                 product_name: 1,
//                 product_price: 1,
//                 product_discount_price: 1,
//                 thumbnail_image: 1,
//                 product_slug: 1,
//                 product_inactivity_start: 1,
//                 product_inactivity_end: 1,
//                 product_status: 1,
//                 discount_show: 1,
//                 product_quantity: 1,
//                 category_id: {
//                     _id: '$category._id',
//                     category_name: '$category.category_name'
//                 },
//             }
//         },
//         { $skip: skip },
//         { $limit: limit }
//     ]);

//     const comboProducts = await ComboModel.find({})
//         // .populate('combo_products.product_id');
//         .populate({
//             path: 'combo_products.product_id',
//             select: 'product_name product_price product_discount_price thumbnail_image category_id product_status product_inactivity_start product_inactivity_end product_quantity',
//             populate: {
//                 path: 'category_id',
//                 select: '_id category_name'
//             }
//         })
//         .skip(skip)
//         .limit(limit)

//     const comboWithPrices = comboProducts
//         .map((combo) => {
//             const finalPrice = calculateComboDiscountedPrice(combo, /*categoryName*/);
//             if (finalPrice === null) return null; // Skip combos with no products in this category

//             return {
//                 ...combo.toObject(),
//                 final_price: finalPrice,
//             };
//         })
//         .filter(combo => combo !== null);

//     const simplifiedCombos = comboWithPrices.map((combo) => {
//         // Check availability of all products in the combo
//         const allProductsAvailable = combo.combo_products.every((item: any) => {
//             if (!item.product_id) return false; // if product is missing, consider unavailable
//             return checkProductAvailability(item.product_id).isAvailable;
//         });


//         const quantities: number[] = combo.combo_products
//             .map((item) => (item?.product_id as any)?.product_quantity)
//             .filter((q): q is number => typeof q === 'number');

//         const minStock = quantities.length > 0 ? Math.min(...quantities) : null;

//         return {
//             _id: combo._id,
//             product_name: combo.combo_title,
//             product_slug: combo.combo_slug,
//             thumbnail_image: combo.combo_image,
//             product_price: combo.final_price,
//             product_quantity: minStock,
//             type: 'combo',
//             availability: {
//                 isAvailable: allProductsAvailable
//             }
//             // cart_quantity: getComboCartQuantity(cartItems, combo._id as string)
//         };
//     });


//     const getCategoryBrandProducts = async (
//         categoryName: string,
//         brandName?: string,
//         extraMatch: Record<string, unknown> = {},
//         limit = 10
//     ) => {
//         const pipeline: any[] = [
//             {
//                 $match: {
//                     product_status: { $in: ['active', 'temporary-in-active'] },
//                     ...extraMatch
//                 }
//             },
//             // Lookup category
//             {
//                 $lookup: {
//                     from: 'categories',
//                     localField: 'category_id',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             { $unwind: '$category' },
//             { $match: { 'category.category_name': categoryName } },
//             // Lookup brand
//             {
//                 $lookup: {
//                     from: 'brands',
//                     localField: 'brand_id',
//                     foreignField: '_id',
//                     as: 'brand'
//                 }
//             },
//             { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
//         ];

//         // Apply brand filter if provided
//         if (brandName) {
//             pipeline.push({
//                 $match: { 'brand.brand_name': brandName }
//             });
//         }

//         // Project only needed fields
//         pipeline.push({
//             $project: {
//                 product_name: 1,
//                 product_price: 1,
//                 product_discount_price: 1,
//                 thumbnail_image: 1,
//                 product_slug: 1,
//                 product_inactivity_start: 1,
//                 product_inactivity_end: 1,
//                 product_status: 1,
//                 discount_show: 1,
//                 product_quantity: 1,
//                 category_id: {
//                     _id: '$category._id',
//                     category_name: '$category.category_name'
//                 },
//                 brand_id: {
//                     _id: '$brand._id',
//                     brand_name: '$brand.brand_name'
//                 }
//             }
//         });

//         pipeline.push({ $skip: skip });
//         pipeline.push({ $limit: limit });

//         return await ProductModel.aggregate(pipeline);
//     };



//     // Apply hot deal discounts to all product arrays
//     const popularWithDiscounts = applyHotDealDiscounts(popularProducts);
//     const offeredWithDiscounts = applyHotDealDiscounts(offeredProducts);
//     const newWithDiscounts = applyHotDealDiscounts(newUploadedProducts);
//     const hotWithDiscounts = applyHotDealDiscounts(hotDealsProducts);

//     // Nestle
//     const nestleProductsRaw = await getCategoryBrandProducts(categoryName, 'Nestle', {}, limit);
//     const nestleWithDiscounts = applyHotDealDiscounts(nestleProductsRaw);

//     // Unilever
//     const unileverProductsRaw = await getCategoryBrandProducts(categoryName, 'Unilever', {}, limit);
//     const unileverWithDiscounts = applyHotDealDiscounts(unileverProductsRaw);


//     const formatProductResponse = (product: any) => {
//         const {
//             product_inactivity_start,
//             product_inactivity_end,
//             product_status,
//             ...rest
//         } = product;

//         return {
//             ...rest,
//             availability: checkProductAvailability(product),
//             type: 'product'
//             // cart_quantity: getProductCartQuantity(cartItems, product._id)
//         };
//     };

//     const popularProductsWithAvailability = popularWithDiscounts.map(formatProductResponse)
//     const offeredProductsWithAvailability = offeredWithDiscounts.map(formatProductResponse)
//     const newProductsWithAvailability = newWithDiscounts.map(formatProductResponse)

//     // Nestle
//     const nestleProductsWithAvailability = nestleWithDiscounts.map(formatProductResponse);

//     // Unilever
//     const unileverProductsWithAvailability = unileverWithDiscounts.map(formatProductResponse);

//     // Create the hot deals products array with dates first
//     let formattedHotDealsProducts;
//     if (hotWithDiscounts.length > 0) {
//         formattedHotDealsProducts = {
//             hotDeal_start_date: activeHotDeal?.hotDeal_start_date,
//             hotDeal_end_date: activeHotDeal?.hotDeal_end_date,
//             hotWithDiscounts: hotWithDiscounts.map(formatProductResponse)
//         };
//     } else {
//         formattedHotDealsProducts = {
//             hotWithDiscounts: []
//         };
//     }

//     const sectionsMap: Record<string, any> = {};

//     // For Pharmacy category sections:
//     if (categoryName === "Pharmacy") {

//         const healthAndNutrientsRaw = await getPharmacySectionProducts("pharmacy_section_1_show", categoryName);
//         const covid19Raw = await getPharmacySectionProducts("pharmacy_section_2_show", categoryName);
//         const adultRaw = await getPharmacySectionProducts("pharmacy_section_3_show", categoryName);
//         const supplementRaw = await getPharmacySectionProducts("pharmacy_section_4_show", categoryName);
//         const herbalRaw = await getPharmacySectionProducts("pharmacy_section_5_show", categoryName);
//         const firstAidRaw = await getPharmacySectionProducts("pharmacy_section_6_show", categoryName);

//         const healthAndNutrientsProducts = healthAndNutrientsRaw.map(formatProductResponse);
//         const covid19Products = covid19Raw.map(formatProductResponse);
//         const adultProducts = adultRaw.map(formatProductResponse);
//         const supplementProducts = supplementRaw.map(formatProductResponse);
//         const herbalProducts = herbalRaw.map(formatProductResponse);
//         const firstAidProducts = firstAidRaw.map(formatProductResponse);


//         sectionsMap['healthAndNutrientsProducts'] = healthAndNutrientsProducts;
//         sectionsMap['covid19Products'] = covid19Products;
//         sectionsMap['adultProducts'] = adultProducts;
//         sectionsMap['supplementProducts'] = supplementProducts;
//         sectionsMap['herbalProducts'] = herbalProducts;
//         sectionsMap['firstAidProducts'] = firstAidProducts;
//     }

//     // For all categories
//     sectionsMap['popularProducts'] = popularProductsWithAvailability;
//     sectionsMap['offeredProducts'] = offeredProductsWithAvailability;
//     sectionsMap['newUploadedProducts'] = newProductsWithAvailability;
//     sectionsMap['nestleProducts'] = nestleProductsWithAvailability;
//     sectionsMap['unileverProducts'] = unileverProductsWithAvailability;
//     sectionsMap['hotDealsProducts'] = formattedHotDealsProducts;
//     sectionsMap['comboProducts'] = simplifiedCombos;

//     // Calculate total counts for each section
//     const totalCountsMap: Record<string, number> = {
//         comboProducts: await ComboModel.countDocuments(),
//         hotDealsProducts: hotDealProductIds?.length || 0,
//         popularProducts: await ProductModel.countDocuments({
//             product_order_count: { $gte: 1 },
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             // category filter can be added if needed
//         }),
//         offeredProducts: await ProductModel.countDocuments({
//             offered_product_show: true,
//             product_status: { $in: ['active', 'temporary-in-active'] },
//         }),
//         newUploadedProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             // $sort: { createdAt: -1 },
//         }),
//         nestleProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             // Add brand filter for Nestle
//             // We can reuse getCategoryBrandProducts or do a direct query with brand filter
//         }),
//         unileverProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             // Add brand filter for Unilever
//         }),
//         // For pharmacy sections:
//         healthAndNutrientsProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             pharmacy_section_1_show: true,
//         }),
//         covid19Products: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             pharmacy_section_2_show: true,
//         }),
//         adultProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             pharmacy_section_3_show: true,
//         }),
//         supplementProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             pharmacy_section_4_show: true,
//         }),
//         herbalProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             pharmacy_section_5_show: true,
//         }),
//         firstAidProducts: await ProductModel.countDocuments({
//             product_status: { $in: ['active', 'temporary-in-active'] },
//             pharmacy_section_6_show: true,
//         }),
//     };


//     const getCategoryBrandProductsCount = async (categoryName: string, brandName: string) => {
//         const matchQuery: any = {
//             product_status: { $in: ['active', 'temporary-in-active'] }
//         };

//         // aggregation pipeline to count matching docs
//         const countAgg = [
//             { $match: matchQuery },
//             {
//                 $lookup: {
//                     from: 'categories',
//                     localField: 'category_id',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             { $unwind: '$category' },
//             { $match: { 'category.category_name': categoryName } },
//             {
//                 $lookup: {
//                     from: 'brands',
//                     localField: 'brand_id',
//                     foreignField: '_id',
//                     as: 'brand'
//                 }
//             },
//             { $unwind: '$brand' },
//             { $match: { 'brand.brand_name': brandName } },
//             { $count: 'total' }
//         ];

//         const result = await ProductModel.aggregate(countAgg);
//         return result.length > 0 ? result[0].total : 0;
//     };


//     totalCountsMap.nestleProducts = await getCategoryBrandProductsCount(categoryName, 'Nestle');
//     totalCountsMap.unileverProducts = await getCategoryBrandProductsCount(categoryName, 'Unilever');



//     // if (section && sectionsMap[section]) {
//     //     return { products: sectionsMap[section] };
//     // }

//     const paginationInfo = {
//         page,
//         limit,
//         totalCount: 0,
//         totalPages: 0,
//     };

//     if (section && sectionsMap[section]) {
//         let totalCount = 0;

//         if (totalCountsMap[section] !== undefined) {
//             totalCount = totalCountsMap[section];
//         } else {
//             // fallback, for example:
//             totalCount = 0;
//         }

//         paginationInfo.totalCount = totalCount;
//         paginationInfo.totalPages = Math.ceil(totalCount / limit);

//         return {
//             products: sectionsMap[section],
//             pagination: paginationInfo,
//         };
//     }



//     return {
//         products: []
//     };
// };


type SectionKey =
    | "popularProducts"
    | "offeredProducts"
    | "newUploadedProducts"
    | "nestleProducts"
    | "unileverProducts"
    | "hotDealsProducts"
    | "comboProducts"
    // pharmacy-only sections
    | "healthAndNutrientsProducts"
    | "covid19Products"
    | "adultProducts"
    | "supplementProducts"
    | "herbalProducts"
    | "firstAidProducts"
    // skincare-only sections
    | "buyAndGetProducts"
    | "winterProducts"
    | "summerProducts"
    | "bestSellingProducts"
    | "hairFallProducts"
    // fashion-only sections
    | "fashionPopularProducts"
    | "fashionWinterProducts"
    | "womenProducts"
    | "menProducts"
    | "kidsProducts"
    | "megaDealProducts"

    // for common categories ( mega deals 50% + )
    | "commonMegaDealProducts";

const PHARMACY_FLAG_BY_SECTION: Record<string, string> = {
    healthAndNutrientsProducts: "pharmacy_section_1_show",
    covid19Products: "pharmacy_section_2_show",
    adultProducts: "pharmacy_section_3_show",
    supplementProducts: "pharmacy_section_4_show",
    herbalProducts: "pharmacy_section_5_show",
    firstAidProducts: "pharmacy_section_6_show",
};

const SKINCARE_FLAG_BY_SECTION: Record<string, string> = {
    buyAndGetProducts: "skincare_section_1_show",
    winterProducts: "skincare_section_2_show",
    summerProducts: "skincare_section_3_show",
    bestSellingProducts: "skincare_section_4_show",
    hairFallProducts: "skincare_section_5_show",
    // firstAidProducts: "skincare_section_6_show",
};

const FASHION_FLAG_BY_SECTION: Record<string, string> = {
    popularProducts: "fashion_section_1_show",
    winterProducts: "fashion_section_2_show",
    womenProducts: "fashion_section_3_show",
    menProducts: "fashion_section_4_show",
    kidsProducts: "fashion_section_5_show",
    megaDealProducts: "fashion_section_6_show",
};

const PROJECT_FIELDS = {
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
    // category_id: 1,
    category_id: {
        _id: '$category_id._id',
        category_name: '$category_id.category_name'
    },
    //brand_id: 1, // no need for now.
};

export const findCategorySectionWiseAllProductsServices = async (
    queryParams: Record<string, unknown>
) => {
    const categoryName = String(queryParams.category || "");
    const section = String(queryParams.section || "") as SectionKey;

    const page = Number(queryParams.page) || 1;
    const limit = Math.min(Number(queryParams.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Resolve category _id up front so we can match by id (faster + indexable)
    const categoryDoc = await CategoryModel.findOne(
        { category_name: categoryName },
        { _id: 1 }
    )
        .lean()
        .exec();

    if (!categoryDoc) {
        return {
            products: [],
            pagination: { page, limit, totalCount: 0, totalPages: 0 },
        };
    }

    const categoryId = categoryDoc._id as Types.ObjectId;

    // Hot deal (lean + map for O(1) lookups)
    const activeHotDeal = await HotDealModel.findOne(
        {},
        {
            hotDeal_products: 1,
            hotDeal_start_date: 1,
            hotDeal_end_date: 1,
        }
    )
        .lean()
        .exec();

    const hotDealMap = new Map<
        string,
        { discount: number | 0 }
    >();

    if (activeHotDeal?.hotDeal_products?.length) {
        for (const h of activeHotDeal.hotDeal_products) {
            const id = String(
                (h as any).product_id?._id || (h as any).product_id
            );
            if (id) hotDealMap.set(id, { discount: h.discount_amount || 0 });
        }
    }

    const applyHot = <T extends any>(docs: T[]): T[] => {
        if (!activeHotDeal || hotDealMap.size === 0) return docs;
        return docs.map((p: any) => {
            const entry = hotDealMap.get(String(p._id));
            if (!entry) return p;
            const original =
                p.product_discount_price ?? p.product_price ?? 0;
            const discounted = Math.max(0, original - (entry.discount ?? 0));
            return {
                ...p,
                product_discount_price: discounted,
                is_hot_deal: true,
                hot_deal_discount: entry.discount,
                hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                hot_deal_end_date: activeHotDeal.hotDeal_end_date,
            };
        });
    };

    const formatProductResponse = (product: any) => {
        const {
            product_inactivity_start,
            product_inactivity_end,
            product_status,
            ...rest
        } = product;
        return {
            ...rest,
            availability: checkProductAvailability(product),
            type: "product",
        };
    };

    // Generic single-aggregate with facet (data + total in one round trip)
    const aggWithFacet = async ({
        match,
        sort,
    }: {
        match: Record<string, any>;
        sort: Record<string, 1 | -1>;
    }) => {
        const [res] = await ProductModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $lookup: {
                    from: "categories", // collection name of CategoryModel
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_id",
                },
            },
            { $unwind: "$category_id" },
            { $project: PROJECT_FIELDS },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    total: [{ $count: "count" }],
                },
            },
        ])
            .allowDiskUse(true)
            .exec();

        const items: any[] = res?.data ?? [];
        const totalCount: number = res?.total?.[0]?.count ?? 0;
        return { items, totalCount };
    };

    // Handle COMBO early (no need to do other work)
    if (section === "comboProducts") {
        const [combos, totalCount] = await Promise.all([
            ComboModel.find({})
                .populate({
                    path: "combo_products.product_id",
                    select:
                        "product_name product_price product_discount_price thumbnail_image category_id product_status product_inactivity_start product_inactivity_end product_quantity",
                    populate: { path: "category_id", select: "_id category_name" },
                })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            ComboModel.countDocuments().exec(),
        ]);

        const calculateComboDiscountedPrice = (combo: any) =>
            (combo?.combo_products ?? []).reduce(
                (t: number, i: any) =>
                    t + (typeof i.combo_price === "number" ? i.combo_price : 0),
                0
            );

        const products = (combos ?? []).map((combo: any) => {
            const finalPrice = calculateComboDiscountedPrice(combo);
            const quantities: number[] = (combo.combo_products ?? [])
                .map((it: any) => it?.product_id?.product_quantity)
                .filter((q: any) => typeof q === "number");
            const minStock = quantities.length ? Math.min(...quantities) : null;

            const allProductsAvailable = (combo.combo_products ?? []).every(
                (it: any) => it.product_id && checkProductAvailability(it.product_id).isAvailable
            );

            return {
                _id: combo._id,
                product_name: combo.combo_title,
                product_slug: combo.combo_slug,
                thumbnail_image: combo.combo_image,
                product_price: finalPrice,
                product_quantity: minStock,
                type: "combo",
                availability: { isAvailable: allProductsAvailable },
            };
        });

        return {
            products,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }


    // Special case: Fashion Mega Deal 40%+
    if (section === "megaDealProducts") {
        const [res] = await ProductModel.aggregate([
            {
                $match: {
                    category_id: categoryId,
                    product_status: { $in: ["active", "temporary-in-active"] },
                    product_discount_price: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: "categories", // collection name of CategoryModel
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_id",
                },
            },
            { $unwind: "$category_id" },
            {
                $addFields: {
                    discountPercentage: {
                        $multiply: [
                            {
                                $divide: [
                                    { $subtract: ["$product_price", "$product_discount_price"] },
                                    "$product_price"
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            { $match: { discountPercentage: { $gte: 40 } } },
            //{ $sort: { discountPercentage: -1, _id: 1 } }, // optional: best deals first
            { $project: PROJECT_FIELDS },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    total: [{ $count: "count" }],
                },
            },
        ])
            .allowDiskUse(true)
            .exec();

        const items: any[] = res?.data ?? [];
        const totalCount: number = res?.total?.[0]?.count ?? 0;

        const priced = applyHot(items);
        const formatted = priced.map(formatProductResponse);

        return {
            products: formatted,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }


    // common categories (mega deals 50% +)
    if (section === "commonMegaDealProducts") {
        const [res] = await ProductModel.aggregate([
            {
                $match: {
                    category_id: categoryId,
                    product_status: { $in: ["active", "temporary-in-active"] },
                    product_discount_price: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: "categories", // collection name of CategoryModel
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_id",
                },
            },
            { $unwind: "$category_id" },
            {
                $addFields: {
                    discountPercentage: {
                        $multiply: [
                            {
                                $divide: [
                                    { $subtract: ["$product_price", "$product_discount_price"] },
                                    "$product_price"
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            { $match: { discountPercentage: { $gte: 50 } } }, // 50% or above
            //{ $sort: { discountPercentage: -1, _id: 1 } }, // optional: best deals first
            { $project: PROJECT_FIELDS },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    total: [{ $count: "count" }],
                },
            },
        ])
            .allowDiskUse(true)
            .exec();

        const items: any[] = res?.data ?? [];
        const totalCount: number = res?.total?.[0]?.count ?? 0;

        const priced = applyHot(items);
        const formatted = priced.map(formatProductResponse);

        return {
            products: formatted,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }

    // Build per-section match/sort (all index-friendly)
    const baseMatch = {
        category_id: categoryId,
        product_status: { $in: ["active", "temporary-in-active"] },
    };

    const SECTION_BUILDERS: Partial<Record<
        SectionKey,
        | ((brandId?: Types.ObjectId) => { match: any; sort: any })
        | undefined
    >> = {
        popularProducts: () => ({
            match: { ...baseMatch, product_order_count: { $gte: 1 } },
            sort: { product_order_count: -1, _id: 1 },
        }),
        offeredProducts: () => ({
            match: { ...baseMatch, offered_product_show: true },
            sort: { _id: 1 },
        }),
        newUploadedProducts: () => ({
            match: { ...baseMatch },
            sort: { createdAt: -1, _id: 1 },
        }),
        // brands (we inject brandId below)
        nestleProducts: (brandId?: Types.ObjectId) => ({
            match: { ...baseMatch, brand_id: brandId },
            sort: { _id: 1 },
        }),
        unileverProducts: (brandId?: Types.ObjectId) => ({
            match: { ...baseMatch, brand_id: brandId },
            sort: { _id: 1 },
        }),
        hotDealsProducts: () => ({
            // match by ids + category
            match: {
                ...baseMatch,
                _id: { $in: Array.from(hotDealMap.keys()).map((s) => new Types.ObjectId(s)) },
            },
            sort: { _id: 1 },
        }),

        // pharmacy flags
        healthAndNutrientsProducts: () => ({
            match: { ...baseMatch, [PHARMACY_FLAG_BY_SECTION.healthAndNutrientsProducts]: true },
            sort: { _id: 1 },
        }),
        covid19Products: () => ({
            match: { ...baseMatch, [PHARMACY_FLAG_BY_SECTION.covid19Products]: true },
            sort: { _id: 1 },
        }),
        adultProducts: () => ({
            match: { ...baseMatch, [PHARMACY_FLAG_BY_SECTION.adultProducts]: true },
            sort: { _id: 1 },
        }),
        supplementProducts: () => ({
            match: { ...baseMatch, [PHARMACY_FLAG_BY_SECTION.supplementProducts]: true },
            sort: { _id: 1 },
        }),
        herbalProducts: () => ({
            match: { ...baseMatch, [PHARMACY_FLAG_BY_SECTION.herbalProducts]: true },
            sort: { _id: 1 },
        }),
        firstAidProducts: () => ({
            match: { ...baseMatch, [PHARMACY_FLAG_BY_SECTION.firstAidProducts]: true },
            sort: { _id: 1 },
        }),


        // skincare flags
        buyAndGetProducts: () => ({
            match: { ...baseMatch, [SKINCARE_FLAG_BY_SECTION.buyAndGetProducts]: true },
            sort: { _id: 1 },
        }),
        winterProducts: () => ({
            match: { ...baseMatch, [SKINCARE_FLAG_BY_SECTION.winterProducts]: true },
            sort: { _id: 1 },
        }),
        summerProducts: () => ({
            match: { ...baseMatch, [SKINCARE_FLAG_BY_SECTION.summerProducts]: true },
            sort: { _id: 1 },
        }),
        bestSellingProducts: () => ({
            match: { ...baseMatch, [SKINCARE_FLAG_BY_SECTION.bestSellingProducts]: true },
            sort: { _id: 1 },
        }),
        hairFallProducts: () => ({
            match: { ...baseMatch, [SKINCARE_FLAG_BY_SECTION.hairFallProducts]: true },
            sort: { _id: 1 },
        }),


        // fashion flags
        fashionPopularProducts: () => ({
            match: { ...baseMatch, [FASHION_FLAG_BY_SECTION.popularProducts]: true },
            sort: { _id: 1 },
        }),
        fashionWinterProducts: () => ({
            match: { ...baseMatch, [FASHION_FLAG_BY_SECTION.winterProducts]: true },
            sort: { _id: 1 },
        }),
        womenProducts: () => ({
            match: { ...baseMatch, [FASHION_FLAG_BY_SECTION.womenProducts]: true },
            sort: { _id: 1 },
        }),
        menProducts: () => ({
            match: { ...baseMatch, [FASHION_FLAG_BY_SECTION.menProducts]: true },
            sort: { _id: 1 },
        }),
        kidsProducts: () => ({
            match: { ...baseMatch, [FASHION_FLAG_BY_SECTION.kidsProducts]: true },
            sort: { _id: 1 },
        }),
    };

    // For brand sections, resolve the brand id once
    let brandId: Types.ObjectId | undefined;
    if (section === "nestleProducts" || section === "unileverProducts") {
        const brandName = section === "nestleProducts" ? "Nestle" : "Unilever";
        const brandDoc = await BrandModel.findOne(
            { brand_name: brandName },
            { _id: 1 }
        )
            .lean()
            .exec();
        brandId = brandDoc?._id;
        if (!brandId) {
            return {
                products: [],
                pagination: { page, limit, totalCount: 0, totalPages: 0 },
            };
        }
    }

    const build = SECTION_BUILDERS[section];
    if (!build) {
        return {
            products: [],
            pagination: { page, limit, totalCount: 0, totalPages: 0 },
        };
    }

    // Hot deals without active deals → empty fast-path
    if (section === "hotDealsProducts" && hotDealMap.size === 0) {
        return {
            products: { hotWithDiscounts: [] },
            pagination: { page, limit, totalCount: 0, totalPages: 0 },
        };
    }

    const { match, sort } = build(brandId)!;

    // Single aggregate + facet
    const { items, totalCount } = await aggWithFacet({ match, sort });

    // Apply hot deal prices (O(1) lookup) to non-combo sections
    const priced = applyHot(items);

    // Format/availability
    const formatted = priced.map(formatProductResponse);

    // Special wrapping for hotDealsProducts to keep your previous shape
    if (section === "hotDealsProducts") {
        return {
            products: {
                hotDeal_start_date: activeHotDeal?.hotDeal_start_date,
                hotDeal_end_date: activeHotDeal?.hotDeal_end_date,
                hotWithDiscounts: formatted,
            },
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }

    return {
        products: formatted,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
    };
};

const findAllPopularProductsServices = async (
    page: number = 1,
    limit: number = 10
) => {
    // First get the active hot deal to check for discounts
    const activeHotDeal = await HotDealModel.findOne({}).populate('hotDeal_products.product_id');

    const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);

    if (!hotDealProductIds || hotDealProductIds.length === 0) {
        return {
            hotDealsProducts: [],
            totalCount: 0,
            page,
            limit,
            totalPages: 0
        };
    }

    // Helper function to apply hot deal discounts to products
    const applyHotDealDiscounts = (products: any[]) => {
        return products.map(product => {
            if (!activeHotDeal) return product;

            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find(
                (item: any) => item.product_id?._id.toString() === product._id.toString()
            );

            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

                return {
                    ...product,
                    product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
                    is_hot_deal: true, // Optional: flag to indicate hot deal
                    hot_deal_discount: hotDealItem.discount_amount,
                    hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                    hot_deal_end_date: activeHotDeal.hotDeal_end_date
                };
            }
            return product;
        });
    };

    // Count total before pagination
    const totalCount = await ProductModel.countDocuments({
        product_status: { $in: ['active', 'temporary-in-active'] },
        product_order_count: { $gte: 1 }
    });

    const products = await ProductModel.find({ product_status: { $in: ['active', 'temporary-in-active'] }, product_order_count: { $gte: 1 } }, {
        product_name: 1,
        product_price: 1,
        product_discount_price: 1,
        thumbnail_image: 1,
        product_status: 1,
        product_order_count: 1
    })
        .sort({ product_order_count: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category_id', 'category_name')
        .lean();

    // const productsWithAvailability = products.map(product => ({
    //     ...product,
    //     availability: checkProductAvailability(product)
    // }))
    // const productsWithAvailability = products.map(product => {
    //     const availability = checkProductAvailability(product);
    //     // Destructure to remove product_status from the final object
    //     const { product_status, ...productData } = product;
    //     return {
    //         ...productData,
    //         category_id: {
    //             _id: product.category_id._id,
    //             category_name: product.category_id.category_name
    //         },
    //         availability
    //     };
    // });
    const productsWithAvailability = products.map(product => {
        const availability = checkProductAvailability(product);
        const { product_status, ...productData } = product;

        let categoryInfo: { _id: any; category_name?: string } = { _id: product.category_id };

        if (
            product.category_id &&
            typeof product.category_id === 'object' &&
            'category_name' in product.category_id
        ) {
            categoryInfo = {
                _id: (product.category_id as any)._id,
                category_name: (product.category_id as any).category_name
            };
        }

        return {
            ...productData,
            // category_info: categoryInfo,
            availability
        };
    });


    // const totalCount = products.length ? products.length : 0;
    return {
        products: applyHotDealDiscounts(productsWithAvailability),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
    };
}

const findAllOfferedProductsServices = async (
    page: number = 1,
    limit: number = 10
) => {
    // First get the active hot deal to check for discounts
    const activeHotDeal = await HotDealModel.findOne({}).populate('hotDeal_products.product_id');

    const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);

    if (!hotDealProductIds || hotDealProductIds.length === 0) {
        return {
            hotDealsProducts: [],
            totalCount: 0,
            page,
            limit,
            totalPages: 0
        };
    }

    // Helper function to apply hot deal discounts to products
    const applyHotDealDiscounts = (products: any[]) => {
        return products.map(product => {
            if (!activeHotDeal) return product;

            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find(
                (item: any) => item.product_id?._id.toString() === product._id.toString()
            );

            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

                return {
                    ...product,
                    product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
                    is_hot_deal: true, // Optional: flag to indicate hot deal
                    hot_deal_discount: hotDealItem.discount_amount,
                    hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                    hot_deal_end_date: activeHotDeal.hotDeal_end_date
                };
            }
            return product;
        });
    };

    // Count total before pagination
    const totalCount = await ProductModel.countDocuments({
        product_status: { $in: ['active', 'temporary-in-active'] },
        offered_product_show: true
    });

    const products = await ProductModel.find({ product_status: { $in: ['active', 'temporary-in-active'] }, offered_product_show: true, }, {
        product_name: 1,
        product_price: 1,
        product_discount_price: 1,
        thumbnail_image: 1,
        product_status: 1,
        offered_product_show: 1
    })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category_id', 'category_name')
        .lean();

    const productsWithAvailability = products.map(product => {
        const availability = checkProductAvailability(product);
        const { product_status, ...productData } = product;

        let categoryInfo: { _id: any; category_name?: string } = { _id: product.category_id };

        if (
            product.category_id &&
            typeof product.category_id === 'object' &&
            'category_name' in product.category_id
        ) {
            categoryInfo = {
                _id: (product.category_id as any)._id,
                category_name: (product.category_id as any).category_name
            };
        }

        return {
            ...productData,
            // category_info: categoryInfo,
            availability
        };
    });


    // const totalCount = products.length ? products.length : 0;
    return {
        products: applyHotDealDiscounts(productsWithAvailability),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
    };
}

const findAllHotDealProductsServices = async (
    page: number = 1,
    limit: number = 10
) => {
    const currentDate = new Date();
    // First get the active hot deal to check for discounts
    const activeHotDeal = await HotDealModel.findOne({ hotDeal_status: 'active', hotDeal_end_date: { $gte: currentDate } }).populate('hotDeal_products.product_id');

    const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);

    if (!hotDealProductIds || hotDealProductIds.length === 0) {
        return {
            hotDealsProducts: [],
            totalCount: 0,
            page,
            limit,
            totalPages: 0
        };
    }

    // Count total before pagination
    const totalCountResult = await ProductModel.aggregate([
        {
            $match: {
                _id: { $in: hotDealProductIds },
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        { $count: "total" }
    ]);

    const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    // Helper function to apply hot deal discounts to products
    const applyHotDealDiscounts = (products: any[]) => {
        return products.map(product => {
            if (!activeHotDeal) return product;

            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find(
                (item: any) => item.product_id?._id.toString() === product._id.toString()
            );

            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

                return {
                    ...product,
                    product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
                    is_hot_deal: true, // Optional: flag to indicate hot deal
                    hot_deal_discount: hotDealItem.discount_amount,
                    hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                    hot_deal_end_date: activeHotDeal.hotDeal_end_date
                };
            }
            return product;
        });
    };

    // Step 3: Query ProductModel with aggregation
    const hotDealsProducts = await ProductModel.aggregate([
        {
            $match: {
                _id: { $in: hotDealProductIds },
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
            }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ]);

    const hotWithDiscounts = applyHotDealDiscounts(hotDealsProducts)

    const formatProductResponse = (product: any) => {
        const {
            product_inactivity_start,
            product_inactivity_end,
            product_status,
            ...rest
        } = product;


        return {
            ...rest,
            availability: checkProductAvailability(product),
            type: 'product'
            // cart_quantity: getProductCartQuantity(cartItems, product._id)
        };
    };

    // Create the hot deals products array with dates first
    let formattedHotDealsProducts;
    if (hotWithDiscounts.length > 0) {
        formattedHotDealsProducts = {
            hotDeal_start_date: activeHotDeal?.hotDeal_start_date,
            hotDeal_end_date: activeHotDeal?.hotDeal_end_date,
            products: hotWithDiscounts.map(formatProductResponse), //hotWithDiscounts
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        };
    } else {
        formattedHotDealsProducts = {
            hotWithDiscounts: [],
            totalCount: 0,
            page,
            limit,
            totalPages: 0,
        };
    }

    return formattedHotDealsProducts;
}


const findAllComboProductsServices = async (
    page: number = 1,
    limit: number = 10
) => {

    const calculateComboDiscountedPrice = (combo: any) => {
        if (!combo?.combo_products?.length) return 0;

        return combo.combo_products.reduce((total: number, item: any) => {
            const price = typeof item.combo_price === 'number' ? item.combo_price : 0;
            return total + price;
        }, 0);
    };

    // Count total before pagination
    const totalCount = await ComboModel.countDocuments({});

    const comboProducts = await ComboModel.find({})
        // .populate('combo_products.product_id');
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
            path: 'combo_products.product_id',
            select: 'product_name product_price product_discount_price thumbnail_image category_id product_status product_inactivity_start product_inactivity_end product_quantity',
            populate: {
                path: 'category_id',
                select: '_id category_name'
            }
        })

    const comboWithPrices = comboProducts
        .map((combo) => {
            const finalPrice = calculateComboDiscountedPrice(combo, /*categoryName*/);
            if (finalPrice === null) return null; // Skip combos with no products in this category

            return {
                ...combo.toObject(),
                final_price: finalPrice,
            };
        })
        .filter(combo => combo !== null);

    const simplifiedCombos = comboWithPrices.map((combo) => {
        // Check availability of all products in the combo
        const allProductsAvailable = combo.combo_products.every((item: any) => {
            if (!item.product_id) return false; // if product is missing, consider unavailable
            return checkProductAvailability(item.product_id).isAvailable;
        });


        const quantities: number[] = combo.combo_products
            .map((item) => (item?.product_id as any)?.product_quantity)
            .filter((q): q is number => typeof q === 'number');

        const minStock = quantities.length > 0 ? Math.min(...quantities) : null;

        return {
            _id: combo._id,
            product_name: combo.combo_title,
            product_slug: combo.combo_slug,
            thumbnail_image: combo.combo_image,
            product_price: combo.final_price,
            product_quantity: minStock,
            type: 'combo',
            availability: {
                isAvailable: allProductsAvailable
            }
            // cart_quantity: getComboCartQuantity(cartItems, combo._id as string)
        };
    });

    return {
        products: simplifiedCombos,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
    };
};


const findAllNestleBrandProductsServices = async (
    /*queryParams: Record<string, unknown>*/
    page: number = 1,
    limit: number = 10
) => {

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // const categoryName = queryParams.category as string;

    // First get the active hot deal to check for discounts
    const activeHotDeal = await HotDealModel.findOne({}).populate('hotDeal_products.product_id');

    const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);

    const applyHotDealDiscounts = (products: any[]) => {
        // If no active hot deal or no hot deal products, return original products
        if (!activeHotDeal || hotDealProductIds?.length === 0) return products;

        return products.map(product => {
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find(
                (item: any) => item.product_id?._id.toString() === product._id.toString()
            );

            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

                return {
                    ...product,
                    product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
                    is_hot_deal: true, // Optional: flag to indicate hot deal
                    hot_deal_discount: hotDealItem.discount_amount,
                    hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                    hot_deal_end_date: activeHotDeal.hotDeal_end_date
                };
            }
            return product;
        });
    };


    const getCategoryBrandProducts = async (
        // categoryName: string,
        brandName?: string,
        extraMatch: Record<string, unknown> = {},
        skip = 0,
        limit = 10
    ) => {
        const pipeline: any[] = [
            {
                $match: {
                    product_status: { $in: ['active', 'temporary-in-active'] },
                    ...extraMatch
                }
            },
            // Lookup category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            // { $match: { 'category.category_name': categoryName } },
            // Lookup brand
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        ];

        // Apply brand filter if provided
        if (brandName) {
            pipeline.push({
                $match: { 'brand.brand_name': brandName }
            });
        }

        // Project only needed fields
        pipeline.push({
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
                brand_id: {
                    _id: '$brand._id',
                    brand_name: '$brand.brand_name'
                }
            }
        });

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        return await ProductModel.aggregate(pipeline);
    };

    const totalCountAgg = await ProductModel.aggregate([
        {
            $match: {
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: '$brand' },
        {
            $match: {
                'brand.brand_name': 'Nestle'
            }
        },
        {
            $count: 'total'
        }
    ]);

    const totalCount = totalCountAgg.length > 0 ? totalCountAgg[0].total : 0;



    // Apply hot deal discounts to all product arrays

    // Nestle
    const nestleProductsRaw = await getCategoryBrandProducts(/*categoryName,*/ 'Nestle', {}, skip, limitNumber);
    const nestleWithDiscounts = applyHotDealDiscounts(nestleProductsRaw);


    const formatProductResponse = (product: any) => {
        const {
            product_inactivity_start,
            product_inactivity_end,
            product_status,
            ...rest
        } = product;

        return {
            ...rest,
            availability: checkProductAvailability(product),
            type: 'product'
            // cart_quantity: getProductCartQuantity(cartItems, product._id)
        };
    };

    // Nestle
    const nestleProductsWithAvailability = nestleWithDiscounts.map(formatProductResponse);

    return {
        products: nestleProductsWithAvailability,
        totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
    };
};

const findAllUnileverBrandProductsServices = async (
    /*queryParams: Record<string, unknown>*/
    page: number = 1,
    limit: number = 10
) => {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // const categoryName = queryParams.category as string;

    // First get the active hot deal to check for discounts
    const activeHotDeal = await HotDealModel.findOne({}).populate('hotDeal_products.product_id');

    const hotDealProductIds = activeHotDeal?.hotDeal_products.map((product) => product.product_id._id);

    const applyHotDealDiscounts = (products: any[]) => {
        // If no active hot deal or no hot deal products, return original products
        if (!activeHotDeal || hotDealProductIds?.length === 0) return products;

        return products.map(product => {
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find(
                (item: any) => item.product_id?._id.toString() === product._id.toString()
            );

            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);

                return {
                    ...product,
                    product_discount_price: discountedPrice > 0 ? discountedPrice : 0,
                    is_hot_deal: true, // Optional: flag to indicate hot deal
                    hot_deal_discount: hotDealItem.discount_amount,
                    hot_deal_start_date: activeHotDeal.hotDeal_start_date,
                    hot_deal_end_date: activeHotDeal.hotDeal_end_date
                };
            }
            return product;
        });
    };


    const getCategoryBrandProducts = async (
        // categoryName: string,
        brandName?: string,
        extraMatch: Record<string, unknown> = {},
        skip = 0,
        limit = 10
    ) => {
        const pipeline: any[] = [
            {
                $match: {
                    product_status: { $in: ['active', 'temporary-in-active'] },
                    ...extraMatch
                }
            },
            // Lookup category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            // { $match: { 'category.category_name': categoryName } },
            // Lookup brand
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        ];

        // Apply brand filter if provided
        if (brandName) {
            pipeline.push({
                $match: { 'brand.brand_name': brandName }
            });
        }

        // Project only needed fields
        pipeline.push({
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
                    _id: '$category._id',
                    category_name: '$category.category_name'
                },
                brand_id: {
                    _id: '$brand._id',
                    brand_name: '$brand.brand_name'
                }
            }
        });

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        return await ProductModel.aggregate(pipeline);
    };

    const totalCountAgg = await ProductModel.aggregate([
        {
            $match: {
                product_status: { $in: ['active', 'temporary-in-active'] }
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: '$brand' },
        {
            $match: {
                'brand.brand_name': 'Unilever'
            }
        },
        {
            $count: 'total'
        }
    ]);

    const totalCount = totalCountAgg.length > 0 ? totalCountAgg[0].total : 0;


    // Apply hot deal discounts to all product arrays

    // Unilever
    const unileverProductsRaw = await getCategoryBrandProducts(/*categoryName,*/ 'Unilever', {}, skip, limitNumber);
    const unileverWithDiscounts = applyHotDealDiscounts(unileverProductsRaw);


    const formatProductResponse = (product: any) => {
        const {
            product_inactivity_start,
            product_inactivity_end,
            product_status,
            ...rest
        } = product;

        return {
            ...rest,
            availability: checkProductAvailability(product),
            type: 'product'
            // cart_quantity: getProductCartQuantity(cartItems, product._id)
        };
    };

    // Unilever
    const unileverProductsWithAvailability = unileverWithDiscounts.map(formatProductResponse);

    return {
        products: unileverProductsWithAvailability,
        totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
    };
};

const findSingleProductServices = async (id: string) => {
    const product = await ProductModel.findOne({
        product_slug: id,
        product_status: { $in: ['active', 'temporary-in-active'] } // Ensure the product is active or temporarily inactive
    }, {
        product_name: 1,
        thumbnail_image: 1,
        additional_images: 1,
        product_quantity: 1,
        unit: 1,
        unit_quantity: 1,
        category_id: 1,
        product_price: 1,
        product_discount_price: 1,
        description: 1,
        product_status: 1,
        product_inactivity_start: 1,
        product_inactivity_end: 1,
        is_flat_discount_show: 1,
        is_percent_discount_show: 1,
        video_url: 1
    })
        .populate('category_id', 'category_name category_logo')
        // .populate('childcategory_id')
        // .populate('subcategory_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object

    if (!product) {
        throw new AppError(404, "Product Not Found !");
    }

    const {
        product_status,
        product_inactivity_start,
        product_inactivity_end,
        ...rest
    } = product;

    // Transform and return
    const transformedProduct = {
        ...rest,
        additional_images: product.additional_images?.map(img => img.additional_image) || [],
        availability: checkProductAvailability(product),
        type: 'product'
    };

    return transformedProduct;
}

const findSingleComboServices = async (id: string) => {
    const combo = await ComboModel.findOne({
        combo_slug: id,
        combo_status: 'active'
    }, {
        combo_title: 1,
        combo_description: 1,
        combo_image: 1,
        combo_products: 1,
    })
        .populate('combo_products.product_id', 'product_name product_price product_discount_price thumbnail_image product_quantity unit unit_quantity combo_price')
        .lean();

    // const calculateComboPrice = (combo: any) => {
    //     if (!combo?.combo_products?.length) return 0;

    //     return combo.combo_products.reduce((total: number, item: { product_id: IProductInterface; product_quantity: number; discount_amount: any; }) => {
    //         const product = item.product_id as IProductInterface;
    //         if (!product) return total;

    //         const quantity = item.product_quantity || 1;
    //         const basePrice = typeof product.product_discount_price === 'number' ? product.product_discount_price : (product.product_price || 0);
    //         let productTotal = basePrice * quantity;

    //         // productTotal -= item.discount_amount * quantity;
    //         productTotal -= item.discount_amount || 0;
    //         console.log('total + productTotal >>>>>>>>>', total + productTotal);
    //         console.log('total >>>>>>>>>', total);
    //         return total + productTotal;
    //     }, 0);
    // };

    // const calculateComboItemPrice = (item: IComboProducts) => {
    //     const product = item.product_id;
    //     if (!product) return 0;

    //     const quantity = item.product_quantity || 1;
    //     const basePrice = typeof product.product_discount_price === 'number' ? product.product_discount_price : (product.product_price || 0);
    //     let productTotal = basePrice * quantity;

    //     productTotal -= item.discount_amount * quantity;
    //     return productTotal;
    // };
    // const finalPrice = calculateComboPrice(combo)
    // const regularPrice = combo?.combo_products.reduce((total, product) => {
    //     const prod = product.product_id;
    //     let price = 0;

    //     if (prod && typeof prod === 'object' && 'product_discount_price' in prod) {
    //         price = typeof prod.product_discount_price === 'number'
    //             ? prod.product_discount_price
    //             : prod.product_price || 0;
    //     }

    //     const mainPrice = price * product?.product_quantity;
    //     return total + mainPrice;
    // }, 0);
    // const comboItemPrice = combo?.combo_products.map((product) => calculateComboItemPrice(product))

    // console.log('regularPrice >>>>>>>>>', regularPrice);
    // console.log('comboItemPrice >>>>>>>>>', comboItemPrice);

    // return {
    //     ...combo,
    //     finalPrice
    // }

    // Calculate final combo price

    if (!combo) return null;

    // const finalPrice = combo.combo_products.reduce((total, item) => {
    //     const product = item.product_id;
    //     if (!product) return total;

    //     const quantity = item.product_quantity || 1;
    //     let basePrice = 0;
    //     if (product && typeof product === 'object' && 'product_discount_price' in product) {
    //         basePrice = typeof product.product_discount_price === 'number'
    //             ? product.product_discount_price
    //             : (product.product_price || 0);
    //     }
    //     const discount = item.discount_amount || 0;

    //     const productTotal = (basePrice * quantity) - (discount * quantity);
    //     return total + productTotal;
    // }, 0);

    const finalPrice = combo.combo_products.reduce((total, item) => {
        const price = typeof item.combo_price === 'number' ? item.combo_price : 0;
        return total + price;
    }, 0);

    // Calculate total regular price
    const totalRegularPrice = combo.combo_products.reduce((total, item) => {
        const product = item.product_id;
        if (!product) return total;

        const quantity = item.product_quantity || 1;
        let basePrice = 0;
        if (product && typeof product === 'object' && 'product_discount_price' in product) {
            basePrice = typeof product.product_discount_price === 'number'
                ? product.product_discount_price
                : (product.product_price || 0);
        }
        return total + (basePrice * quantity);
    }, 0);

    // Prepare an array to track stock quantities
    let stockQuantities: any[] = [];

    // Format each combo product
    const formattedComboProducts = combo.combo_products.map(item => {
        const product = item.product_id;
        const quantity = item.product_quantity || 1;
        const discount = item.discount_amount || 0;
        let basePrice = 0;
        let stock_quantity = 0;

        if (product && typeof product === 'object' && 'product_discount_price' in product) {
            basePrice = typeof product.product_discount_price === 'number'
                ? product.product_discount_price
                : (product.product_price || 0);


            // Extract stock quantity if available
            // stock_quantity = product.product_quantity || 0;
            const stock_quantity =
                product.product_quantity === 0
                    ? 0
                    : product.product_quantity === null
                        ? null
                        : product.product_quantity;


            console.log(stock_quantity);



            stockQuantities.push(stock_quantity);
        }

        return {
            _id: product._id,
            product_name: product && typeof product === 'object' && 'product_name' in product ? product.product_name : undefined,
            thumbnail_image: product && typeof product === 'object' && 'thumbnail_image' in product
                ? product.thumbnail_image
                : 'https://default.image.url',
            stock_quantity: (product as any)?.product_quantity,
            combo_quantity: item.product_quantity,
            unit: (product as any).unit,
            unit_quantity: (product as any).unit_quantity,
            product_regular_price: basePrice * quantity,
            product_combo_price: (basePrice * quantity) - discount
        };
    });


    // Find the minimum stock quantity
    // const minimum_stock_quantity = stockQuantities.length > 0 ? Math.min(...stockQuantities) : null;

    const validQuantities = stockQuantities.filter(q => q !== null);

    const minimum_stock_quantity =
        validQuantities.length === 0 ? null : Math.min(...validQuantities);

    // Final response
    return {
        _id: combo._id,
        combo_title: combo.combo_title,
        finalPrice: finalPrice,
        availability: {
            isAvailable: true
        },
        type: 'combo',
        minimum_stock_quantity,
        combo_description: combo.combo_description,
        combo_image: combo.combo_image,
        combo: {
            tota_regular_price: totalRegularPrice,
            tota_combo_price: finalPrice,
            combo_products: formattedComboProducts
        }
    };
}


export const getCommonCategoryDataAppService = async (category_slug: string) => {
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

    const category = await CategoryModel.findOne({ category_slug }).select("_id");
    if (!category) throw new Error("Category not found");


    const productProjection = {
        _id: 1,
        product_name: 1,
        product_slug: 1,
        category_id: {
            _id: "$category._id",
            category_name: "$category.category_name"
        },
        thumbnail_image: 1,
        product_price: 1,
        product_discount_price: 1,
        product_quantity: 1,
        type: 1
    };


    const [banners, reels, productsGrouped, subcategories] = await Promise.all([
        BannerModel.find({ banner_position: category_slug, banner_status: "active" })
            .sort({ banner_serial: 1 })
            .limit(10)
            .lean(),

        YTLinkModel.find({ category_type: category_slug, ytLink_status: "active" })
            .sort({ ytLink_serial: 1 })
            .limit(10)
            .lean(),

        ProductModel.aggregate([
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
                $lookup: {
                    from: "categories",             // collection name (used lookup for populating category data)
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $facet: {
                    common_popular_products: [
                        // { $match: { popular_product_show: true } },
                        // { $sort: { createdAt: -1 } },
                        { $match: { product_order_count: { $gt: 0 } } }, // Popular products → must have product_order_count > 0
                        { $sort: { product_order_count: -1 } },
                        { $limit: 10 },
                        { $project: productProjection }
                    ],
                    common_offer_products: [
                        { $match: { offered_product_show: true } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        { $project: productProjection }
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
                        { $limit: 10 },
                        { $project: productProjection }
                    ],
                    common_newly_uploaded: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        { $project: productProjection }
                    ]
                }
            }
        ]),

        // ✅ Fetch subcategories for this category
        SubcategoryModel.find({ category_id: category._id, subcategory_status: "active" })
            .sort({ subcategory_serial: 1 })
            .lean()


    ]);

    const {
        common_popular_products,
        common_offer_products,
        common_mega_deal,
        common_newly_uploaded
    } = productsGrouped[0] || {};


    // ✅ Add availability for all product arrays
    const addAvailability = (products: any[]) =>
        products.map((product) => ({
            ...product,
            availability: checkProductAvailability(product)

        }));

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
};


export const findFilteredCategoriesAppService = async () => {
    const excludedSlugs = ["Grocery", "Pharmacy", "Fashion", "Beauty-and-Skincare", "Food"];

    const categories = await CategoryModel.find(
        { category_slug: { $nin: excludedSlugs } }, // exclude these slugs
        { category_name: 1, category_logo: 1 }      // select only needed fields
    ).lean();

    return categories;
};

//get all active products for customers
const findAllProductServicesApp = async (queryParams: Record<string, unknown>): Promise<any> => {
    // Extract category_id from query params if it exists
    const categoryId = queryParams.category_id || queryParams.categoryId; // ✅ handle both cases
    const subcategoryId = queryParams.subcategory_id;
    const childcategoryId = queryParams.childcategory_id;
    const minPrice = Number(queryParams.min_price);
    const maxPrice = Number(queryParams.max_price);
    // Build initial query with category filter if provided
    const initialQuery: any = {
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
        initialQuery.product_price = { ...(initialQuery.product_price || {}), $gte: minPrice };
    }
    if (!isNaN(maxPrice)) {
        initialQuery.product_price = { ...(initialQuery.product_price || {}), $lte: maxPrice };
    }

    const initialSort: any = {};
    const sortBy = queryParams.sort_by || 'bestselling_product_show';
    const sortOrder = queryParams.sort_order || 'asc';
    if (sortBy === 'bestselling_product_show') {
        initialSort.bestselling_product_show = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'product_price') {
        initialSort.product_price = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'product_name') {
        initialSort.product_name = sortOrder === 'asc' ? 1 : -1;
    } else {
        initialSort._id = sortOrder === 'asc' ? 1 : -1; // Default sorting by _id
    }
    // Step 1: Build the base query with population and sorting
    const modelQuery = ProductModel.find({
        ...initialQuery,
        ...((!isNaN(minPrice) || !isNaN(maxPrice)) && {
            $expr: {
                $and: [
                    !isNaN(minPrice) && { $gte: [{ $ifNull: ["$product_discount_price", "$product_price"] }, minPrice] },
                    !isNaN(maxPrice) && { $lte: [{ $ifNull: ["$product_discount_price", "$product_price"] }, maxPrice] }
                ].filter(Boolean)
            }
        })
    }) // filter max, min price if product_discount_price exists, otherwise fallback to product_price
        .populate([
            { path: "category_id", select: "category_name" },
            // { path: "childcategory_id" },
            // { path: "subcategory_id", select: "subcategory_name" },
            // { path: "brand_id" },
            // { path: "product_publisher_id" },
            // { path: "product_updated_by" },
        ])
        .sort(initialSort)
        .select("product_name product_slug thumbnail_image product_price product_discount_price product_quantity discount_show")
        // .select("-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty")
        .lean(); // Return plain JavaScript objects for easier processing

    // Step 2: Use QueryBuilder to handle search, filter, sort, paginate, etc.
    const query = new QueryBuilder(modelQuery, queryParams)
        .search(['product_name'])
        // .search(productSearchableField) // Provide searchable fields
        // .filter() // Uncomment and implement if needed
        .sort()
        .paginate()
    // .fields(); // Uncomment and implement if needed

    // Step 3: Execute the query to get the products
    const products = await query.modelQuery;

    // Add availability check to each product
    const productsWithAvailability = products.map(product => ({
        ...product,
        availability: checkProductAvailability(product)
    }))

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
    const totalCount = await ProductModel.countDocuments(query.modelQuery.getFilter());
    return { products: productsWithAvailability, totalCount };
}

// logged in User info
const findUserByIdServices = async (user_phone_or_email: string) => {
    const result = await userModel.findOne({
        $or: [
            { user_phone: user_phone_or_email },
            { user_email: user_phone_or_email }
        ]
    })
    // .select('-user_password -otp_code -otp_expires_at -scheduledForDeletionAt');

    return result;
};

const updateUserProfileServices = async (_id: string, payload: Partial<IUserInterface>) => {
    const userData = await userModel.findById(_id);
    if (!userData) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // If the user wants to update the password, hash it
    if (payload.user_password) {
        payload.user_password = await hashPassword(
            payload.user_password,
        );
    }

    const result = await userModel.findByIdAndUpdate(_id, payload, {
        new: true,
        runValidators: true,
    })

    return result;
}


// find recent transactions by user id
const findRecentTransactionsByUserIdServices = async (
    user_id: string,
    limit: number,
    skip: number
) => {

    const filter = {
        order_user_id: user_id,
        "order_details.wallet_used": { $gt: 0 }, // ✅ only orders where wallet_used > 0
    };

    const orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        // .populate("order_user_id order_delivery_location")
        .select(
            'order_id order_status order_payable_amount order_details.wallet_used createdAt updatedAt ' //+
            // pick only these subfields from order_items
            // 'order_items._id order_items.quantity order_items.price'
        )
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await OrderModel.countDocuments(filter);

    return {
        data: orders,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
    };
};


// find my orders by user id
const findMyOrdersByUserIdServices = async (
    user_id: string,
    limit: number,
    skip: number
) => {
    const orders = await OrderModel.find({ order_user_id: user_id })
        .sort({ createdAt: -1 })
        // .populate("order_user_id order_delivery_location")
        .select(
            'order_id order_status order_payable_amount order_items createdAt updatedAt' //+
            // pick only these subfields from order_items
            // 'order_items._id order_items.quantity'
        )
        .skip(skip)
        .limit(limit)
        .lean();

    const ordersWithCount = orders.map(o => ({
        ...o,
        order_items_count: o.order_items?.length || 0,
    }));

    const total = await OrderModel.countDocuments({ order_user_id: user_id });

    return {
        data: ordersWithCount, //orders,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
    };
};


const findRefundByUserIdService = async (id: string, limit: number, skip: number) => {
    const refunds = await RefundModel.find({ user_id: id })
        .sort({ createdAt: -1 })
        .select('order_id refund_status refund_amount refund_reason createdAt')
        // .populate('user_id')
        .skip(skip)
        .limit(limit)

    const total = await RefundModel.countDocuments({ user_id: id });

    return {
        data: refunds,
        total,
        page: Math.floor(skip / limit) + 1,
        limit
    };
};

//get Address info
const getAddressServiceApp = async (id: string) => {
    const result = await AddressModel.find({ user_id: id }).select('address_name address_phone address_email address_address address_status'); //.populate('user_id');
    return result;
};

// user name and wallet info data
const getUserNameWalletAmountService = async (user_id: string) => {

    // let query: FilterQuery<IUserInterface> = {};

    // if (searchTerm) {
    //   const regex = new RegExp(searchTerm, "i"); // case-insensitive search
    //   query = {
    //     $or: [
    //       { user_name: regex },
    //       // { user_email: regex },
    //       // { user_phone: regex },
    //       // { user_city: regex },
    //       // { user_country: regex },
    //       // { user_current_job: regex },
    //     ],
    //   };
    // }

    const result = await userModel.findOne({ _id: user_id })
        .sort({ createdAt: -1 }) // Sort by recent
        .select('user_name user_phone user_wallet_amount')
    return result;
};

export const AppServices = {
    findBannerAndReelsServices,
    findCategoryWiseProductsServices,
    findCategoryWiseSubcategoriesServices,
    findCategoryWiseOnlySubcategoriesServices,
    findCategorySectionWiseAllProductsServices,
    findAllPopularProductsServices,
    findAllOfferedProductsServices,
    findAllHotDealProductsServices,
    findAllComboProductsServices,
    findAllNestleBrandProductsServices,
    findAllUnileverBrandProductsServices,
    findSingleProductServices,
    findSingleComboServices,
    findAllProductServicesApp,
    findUserByIdServices,
    updateUserProfileServices,
    findRecentTransactionsByUserIdServices,
    findMyOrdersByUserIdServices,
    findRefundByUserIdService,
    getAddressServiceApp,
    getUserNameWalletAmountService
}