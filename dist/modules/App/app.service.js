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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppServices = exports.findFilteredCategoriesAppService = exports.getCommonCategoryDataAppService = exports.findCategorySectionWiseAllProductsServices = void 0;
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const cartHelper_1 = require("../../helpers/cartHelper");
const checkAvailability_1 = require("../../utils/checkAvailability");
const pharmacySectionHelperFunction_1 = require("../../utils/pharmacySectionHelperFunction");
const banner_model_1 = require("../Banner/banner.model");
const brand_model_1 = require("../Brand/brand.model");
const cart_model_1 = require("../Cart/cart.model");
const category_model_1 = __importDefault(require("../Category/category.model"));
const childcategory_model_1 = __importDefault(require("../Childcategory/childcategory.model"));
const combo_model_1 = require("../Combo/combo.model");
const hotDeal_model_1 = require("../HotDeals/hotDeal.model");
const product_model_1 = __importDefault(require("../Product/product.model"));
const subcategory_model_1 = __importDefault(require("../Subcategory/subcategory.model"));
const ytLink_model_1 = require("../YTLink/ytLink.model");
const SkincareSectionHelperFunction_1 = require("../../utils/SkincareSectionHelperFunction");
const megaDeal40PlusForFashionHelper_1 = require("../../utils/megaDeal40PlusForFashionHelper");
const fashionSectionHelperFunction_1 = require("../../utils/fashionSectionHelperFunction");
const user_model_1 = __importDefault(require("../User/user.model"));
const hashHelper_1 = require("../../helpers/hashHelper");
const http_status_1 = __importDefault(require("http-status"));
const order_model_1 = require("../Order/order.model");
const refund_model_1 = require("../Refund/refund.model");
// Home page: Banner and Reels
const findBannerAndReelsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const reels = yield ytLink_model_1.YTLinkModel.find({ ytLink_status: "active" }, { ytLink_link: 1, _id: 1 }).sort({ ytLink_serial: 1 });
    const banners = yield banner_model_1.BannerModel.find({ banner_status: 'active', banner_position: 'home-top' }, { banner_image: 1, banner_path: 1, _id: 0 });
    return {
        reels,
        banners
    };
});
// Home page: Grocery (Category wise)
const findCategoryWiseProductsServices = (queryParams, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryName = queryParams.category;
    // GET category
    const categoryBanner = yield category_model_1.default.findOne({ category_name: categoryName }, { category_banner: 1, _id: -1 });
    console.log('categoryBanner >>>>>>>>>', categoryBanner);
    //Get Youtube Reels category wise
    const youtubeReels = yield ytLink_model_1.YTLinkModel.find({ category_type: categoryName }).select('_id ytLink_link').lean();
    // GET Cart by user_id
    const userCart = yield cart_model_1.CartModel.find({ user_id: user_id }, { cart_items: 1 });
    const cartItems = (0, cartHelper_1.getCartItems)(userCart);
    // First get the active hot deal to check for discounts
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({}).populate('hotDeal_products.product_id');
    const hotDealProductIds = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products.map((product) => product.product_id._id);
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
    const applyHotDealDiscounts = (products) => {
        // If no active hot deal or no hot deal products, return original products
        if (!activeHotDeal || (hotDealProductIds === null || hotDealProductIds === void 0 ? void 0 : hotDealProductIds.length) === 0)
            return products;
        return products.map(product => {
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find((item) => { var _a; return ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a._id.toString()) === product._id.toString(); });
            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);
                return Object.assign(Object.assign({}, product), { product_discount_price: discountedPrice > 0 ? discountedPrice : 0, is_hot_deal: true, hot_deal_discount: hotDealItem.discount_amount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
            }
            return product;
        });
    };
    // Step 3: Query ProductModel with aggregation
    let hotDealsProducts = [];
    if (hotDealProductIds && hotDealProductIds.length > 0) {
        hotDealsProducts = yield product_model_1.default.aggregate([
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
    const calculateComboDiscountedPrice = (combo) => {
        var _a;
        if (!((_a = combo === null || combo === void 0 ? void 0 : combo.combo_products) === null || _a === void 0 ? void 0 : _a.length))
            return 0;
        return combo.combo_products.reduce((total, item) => {
            const price = typeof item.combo_price === 'number' ? item.combo_price : 0;
            return total + price;
        }, 0);
    };
    const popularProducts = yield product_model_1.default.aggregate([
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
    const offeredProducts = yield product_model_1.default.aggregate([
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
    const newUploadedProducts = yield product_model_1.default.aggregate([
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
    const megaDealProducts = yield product_model_1.default.aggregate([
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
    const comboProducts = yield combo_model_1.ComboModel.find({})
        // .populate('combo_products.product_id');
        .populate({
        path: 'combo_products.product_id',
        select: 'product_name product_price product_discount_price thumbnail_image category_id product_status product_inactivity_start product_inactivity_end product_quantity',
        populate: {
            path: 'category_id',
            select: '_id category_name'
        }
    });
    // const comboWithPrices = comboProducts.map((combo) => ({
    //     ...combo.toObject(),
    //     final_price: calculateComboDiscountedPrice(combo, categoryName),
    // }));
    const comboWithPrices = comboProducts
        .map((combo) => {
        const finalPrice = calculateComboDiscountedPrice(combo);
        if (finalPrice === null)
            return null; // Skip combos with no products in this category
        return Object.assign(Object.assign({}, combo.toObject()), { final_price: finalPrice });
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
        const allProductsAvailable = combo.combo_products.every((item) => {
            if (!item.product_id)
                return false; // if product is missing, consider unavailable
            return (0, checkAvailability_1.checkProductAvailability)(item.product_id).isAvailable;
        });
        const quantities = combo.combo_products
            .map((item) => { var _a; return (_a = item === null || item === void 0 ? void 0 : item.product_id) === null || _a === void 0 ? void 0 : _a.product_quantity; })
            .filter((q) => typeof q === 'number');
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
    const getCategoryBrandProducts = (categoryName_1, brandName_1, ...args_1) => __awaiter(void 0, [categoryName_1, brandName_1, ...args_1], void 0, function* (categoryName, brandName, extraMatch = {}, limit = 10) {
        const pipeline = [
            {
                $match: Object.assign({ product_status: { $in: ['active', 'temporary-in-active'] } }, extraMatch)
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
        return yield product_model_1.default.aggregate(pipeline);
    });
    // Apply hot deal discounts to all product arrays
    const popularWithDiscounts = applyHotDealDiscounts(popularProducts);
    const offeredWithDiscounts = applyHotDealDiscounts(offeredProducts);
    const newWithDiscounts = applyHotDealDiscounts(newUploadedProducts);
    const hotWithDiscounts = applyHotDealDiscounts(hotDealsProducts);
    const megaDealWithDiscounts = applyHotDealDiscounts(megaDealProducts);
    // Nestle
    const nestleProductsRaw = yield getCategoryBrandProducts(categoryName, 'Nestle');
    const nestleWithDiscounts = applyHotDealDiscounts(nestleProductsRaw);
    // Unilever
    const unileverProductsRaw = yield getCategoryBrandProducts(categoryName, 'Unilever');
    const unileverWithDiscounts = applyHotDealDiscounts(unileverProductsRaw);
    const formatProductResponse = (product) => {
        const { product_inactivity_start, product_inactivity_end, product_status } = product, rest = __rest(product, ["product_inactivity_start", "product_inactivity_end", "product_status"]);
        return Object.assign(Object.assign({}, rest), { availability: (0, checkAvailability_1.checkProductAvailability)(product), type: 'product' });
    };
    const popularProductsWithAvailability = popularWithDiscounts.map(formatProductResponse);
    const offeredProductsWithAvailability = offeredWithDiscounts.map(formatProductResponse);
    const newProductsWithAvailability = newWithDiscounts.map(formatProductResponse);
    const megaDealProductsWithAvailability = megaDealWithDiscounts.map(formatProductResponse);
    // Nestle
    const nestleProductsWithAvailability = nestleWithDiscounts.map(formatProductResponse);
    // Unilever
    const unileverProductsWithAvailability = unileverWithDiscounts.map(formatProductResponse);
    // Create the hot deals products array with dates first
    let formattedHotDealsProducts;
    if (hotWithDiscounts.length > 0) {
        formattedHotDealsProducts = {
            hotDeal_start_date: activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_start_date,
            hotDeal_end_date: activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_end_date,
            hotWithDiscounts: hotWithDiscounts.map(formatProductResponse)
        };
    }
    else {
        formattedHotDealsProducts = {
            hotWithDiscounts: []
        };
    }
    if (categoryName === "Pharmacy") {
        const healthAndNutrientsRaw = yield (0, pharmacySectionHelperFunction_1.getPharmacySectionProducts)("pharmacy_section_1_show", categoryName);
        const covid19Raw = yield (0, pharmacySectionHelperFunction_1.getPharmacySectionProducts)("pharmacy_section_2_show", categoryName);
        const adultRaw = yield (0, pharmacySectionHelperFunction_1.getPharmacySectionProducts)("pharmacy_section_3_show", categoryName);
        const supplementRaw = yield (0, pharmacySectionHelperFunction_1.getPharmacySectionProducts)("pharmacy_section_4_show", categoryName);
        const herbalRaw = yield (0, pharmacySectionHelperFunction_1.getPharmacySectionProducts)("pharmacy_section_5_show", categoryName);
        const firstAidRaw = yield (0, pharmacySectionHelperFunction_1.getPharmacySectionProducts)("pharmacy_section_6_show", categoryName);
        const healthAndNutrientsProducts = healthAndNutrientsRaw.map(formatProductResponse);
        const covid19Products = covid19Raw.map(formatProductResponse);
        const adultProducts = adultRaw.map(formatProductResponse);
        const supplementProducts = supplementRaw.map(formatProductResponse);
        const herbalProducts = herbalRaw.map(formatProductResponse);
        const firstAidProducts = firstAidRaw.map(formatProductResponse);
        const pharmacyBrands = yield (0, pharmacySectionHelperFunction_1.getPharmacyBrands)(categoryName);
        return {
            categoryBanner: [{ banners: categoryBanner === null || categoryBanner === void 0 ? void 0 : categoryBanner.category_banner }],
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
        const buyAndGetRaw = yield (0, SkincareSectionHelperFunction_1.getSkincareSectionProducts)("skincare_section_1_show", categoryName);
        const winterRaw = yield (0, SkincareSectionHelperFunction_1.getSkincareSectionProducts)("skincare_section_2_show", categoryName);
        const summerRaw = yield (0, SkincareSectionHelperFunction_1.getSkincareSectionProducts)("skincare_section_3_show", categoryName);
        const bestSellingRaw = yield (0, SkincareSectionHelperFunction_1.getSkincareSectionProducts)("skincare_section_4_show", categoryName);
        const hairFallRaw = yield (0, SkincareSectionHelperFunction_1.getSkincareSectionProducts)("skincare_section_5_show", categoryName);
        const buyAndGetProducts = buyAndGetRaw.map(formatProductResponse);
        const winterProducts = winterRaw.map(formatProductResponse);
        const summerProducts = summerRaw.map(formatProductResponse);
        const bestSellingProducts = bestSellingRaw.map(formatProductResponse);
        const hairFallProducts = hairFallRaw.map(formatProductResponse);
        const skincareBrands = yield (0, SkincareSectionHelperFunction_1.getSkincareBrands)(categoryName);
        return {
            categoryBanner: [{ banners: categoryBanner === null || categoryBanner === void 0 ? void 0 : categoryBanner.category_banner }],
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
        const popularRaw = yield (0, fashionSectionHelperFunction_1.getFashionSectionProducts)("fashion_section_1_show", categoryName);
        const winterRaw = yield (0, fashionSectionHelperFunction_1.getFashionSectionProducts)("fashion_section_2_show", categoryName);
        const womenRaw = yield (0, fashionSectionHelperFunction_1.getFashionSectionProducts)("fashion_section_3_show", categoryName);
        const menRaw = yield (0, fashionSectionHelperFunction_1.getFashionSectionProducts)("fashion_section_4_show", categoryName);
        const kidsRaw = yield (0, fashionSectionHelperFunction_1.getFashionSectionProducts)("fashion_section_5_show", categoryName);
        const megaDealRaw = yield (0, megaDeal40PlusForFashionHelper_1.megaDeal40PlusProducts)(categoryName);
        const popularProducts = popularRaw.map(formatProductResponse);
        const winterProducts = winterRaw.map(formatProductResponse);
        const womenProducts = womenRaw.map(formatProductResponse);
        const menProducts = menRaw.map(formatProductResponse);
        const kidsProducts = kidsRaw.map(formatProductResponse);
        const megaDealProducts = megaDealRaw.map(formatProductResponse);
        const fashionBrands = yield (0, fashionSectionHelperFunction_1.getFashionBrands)(categoryName);
        return {
            categoryBanner: [{ banners: categoryBanner === null || categoryBanner === void 0 ? void 0 : categoryBanner.category_banner }],
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
            categoryBanner: [{ banners: categoryBanner === null || categoryBanner === void 0 ? void 0 : categoryBanner.category_banner }],
            youtubeReels,
            popularProducts: popularProductsWithAvailability,
            offeredProducts: offeredProductsWithAvailability,
            newUploadedProducts: newProductsWithAvailability,
            megaDealProducts: megaDealProductsWithAvailability,
        };
    }
    return {
        categoryBanner: [{ banners: categoryBanner === null || categoryBanner === void 0 ? void 0 : categoryBanner.category_banner }], //categoryName !== 'Grocery' ? [{ banners: categoryBanner?.category_banner }] : [],
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
});
// Category wise subcategories
const findCategoryWiseSubcategoriesServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryName = queryParams.category;
    // Find category by name
    const category = yield category_model_1.default.findOne({ category_name: categoryName, category_status: 'active' });
    if (!category) {
        throw new Error('Category not found');
    }
    // Find all subcategories of that category
    const subcategories = yield subcategory_model_1.default.find({ category_id: category._id, subcategory_status: 'active' }, { subcategory_name: 1, subcategory_logo: 1, subcategory_banner: 1 }).sort({ subcategory_serial: 1 }).lean();
    // Get all childcategories for those subcategories
    const subcategoryIds = subcategories.map(sub => sub._id);
    const childcategories = yield childcategory_model_1.default.find({ subcategory_id: { $in: subcategoryIds }, childcategory_status: 'active' }, { childcategory_name: 1, childcategory_logo: 1, subcategory_id: 1 }).sort({ childcategory_serial: 1 }).lean();
    // Nest childcategories into their respective subcategories
    const nestedSubcategories = subcategories.map(sub => {
        const children = childcategories.filter(child => child.subcategory_id.equals(sub._id));
        return Object.assign(Object.assign({}, sub), { childrens: children });
    });
    return nestedSubcategories;
});
// Category wise only subcategories
const findCategoryWiseOnlySubcategoriesServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryName = queryParams.category;
    const subcategoryId = queryParams.subcategory_id;
    // Find category by name
    const category = yield category_model_1.default.findOne({ category_name: categoryName, category_status: 'active' });
    if (!category) {
        throw new Error('Category not found');
    }
    // If subcategory_id is provided → fetch childcategories
    if (subcategoryId) {
        const subcategory = yield subcategory_model_1.default.findOne({
            _id: subcategoryId,
            category_id: category._id,
            subcategory_status: "active",
        });
        if (!subcategory) {
            throw new Error("Subcategory not found under this category");
        }
        const childcategories = yield childcategory_model_1.default.find({
            // category_id: category._id, // category_id is optional that's why commented, (if not optional, then it will also work)
            subcategory_id: subcategory._id,
            childcategory_status: "active",
        }, { childcategory_name: 1, childcategory_logo: 1 }).sort({ childcategory_serial: 1 }).lean();
        return childcategories;
    }
    // Otherwise Find all subcategories of that category
    const subcategories = yield subcategory_model_1.default.find({ category_id: category._id, subcategory_status: 'active' }, { subcategory_name: 1, subcategory_logo: 1 }).sort({ subcategory_serial: 1 }).lean();
    // Get all childcategories for those subcategories
    // const subcategoryIds = subcategories.map(sub => sub._id);
    // // Nest childcategories into their respective subcategories
    // const nestedSubcategories = subcategories.map(sub => {
    //     const children = childcategories.filter(child => child.subcategory_id.equals(sub._id));
    //     return { ...sub, childrens: children };
    // });
    return subcategories;
});
const PHARMACY_FLAG_BY_SECTION = {
    healthAndNutrientsProducts: "pharmacy_section_1_show",
    covid19Products: "pharmacy_section_2_show",
    adultProducts: "pharmacy_section_3_show",
    supplementProducts: "pharmacy_section_4_show",
    herbalProducts: "pharmacy_section_5_show",
    firstAidProducts: "pharmacy_section_6_show",
};
const SKINCARE_FLAG_BY_SECTION = {
    buyAndGetProducts: "skincare_section_1_show",
    winterProducts: "skincare_section_2_show",
    summerProducts: "skincare_section_3_show",
    bestSellingProducts: "skincare_section_4_show",
    hairFallProducts: "skincare_section_5_show",
    // firstAidProducts: "skincare_section_6_show",
};
const FASHION_FLAG_BY_SECTION = {
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
const findCategorySectionWiseAllProductsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const categoryName = String(queryParams.category || "");
    const section = String(queryParams.section || "");
    const page = Number(queryParams.page) || 1;
    const limit = Math.min(Number(queryParams.limit) || 10, 50);
    const skip = (page - 1) * limit;
    // Resolve category _id up front so we can match by id (faster + indexable)
    const categoryDoc = yield category_model_1.default.findOne({ category_name: categoryName }, { _id: 1 })
        .lean()
        .exec();
    if (!categoryDoc) {
        return {
            products: [],
            pagination: { page, limit, totalCount: 0, totalPages: 0 },
        };
    }
    const categoryId = categoryDoc._id;
    // Hot deal (lean + map for O(1) lookups)
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({}, {
        hotDeal_products: 1,
        hotDeal_start_date: 1,
        hotDeal_end_date: 1,
    })
        .lean()
        .exec();
    const hotDealMap = new Map();
    if ((_a = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products) === null || _a === void 0 ? void 0 : _a.length) {
        for (const h of activeHotDeal.hotDeal_products) {
            const id = String(((_b = h.product_id) === null || _b === void 0 ? void 0 : _b._id) || h.product_id);
            if (id)
                hotDealMap.set(id, { discount: h.discount_amount || 0 });
        }
    }
    const applyHot = (docs) => {
        if (!activeHotDeal || hotDealMap.size === 0)
            return docs;
        return docs.map((p) => {
            var _a, _b, _c;
            const entry = hotDealMap.get(String(p._id));
            if (!entry)
                return p;
            const original = (_b = (_a = p.product_discount_price) !== null && _a !== void 0 ? _a : p.product_price) !== null && _b !== void 0 ? _b : 0;
            const discounted = Math.max(0, original - ((_c = entry.discount) !== null && _c !== void 0 ? _c : 0));
            return Object.assign(Object.assign({}, p), { product_discount_price: discounted, is_hot_deal: true, hot_deal_discount: entry.discount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
        });
    };
    const formatProductResponse = (product) => {
        const { product_inactivity_start, product_inactivity_end, product_status } = product, rest = __rest(product, ["product_inactivity_start", "product_inactivity_end", "product_status"]);
        return Object.assign(Object.assign({}, rest), { availability: (0, checkAvailability_1.checkProductAvailability)(product), type: "product" });
    };
    // Generic single-aggregate with facet (data + total in one round trip)
    const aggWithFacet = (_a) => __awaiter(void 0, [_a], void 0, function* ({ match, sort, }) {
        var _b, _c, _d, _e;
        const [res] = yield product_model_1.default.aggregate([
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
        const items = (_b = res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : [];
        const totalCount = (_e = (_d = (_c = res === null || res === void 0 ? void 0 : res.total) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.count) !== null && _e !== void 0 ? _e : 0;
        return { items, totalCount };
    });
    // Handle COMBO early (no need to do other work)
    if (section === "comboProducts") {
        const [combos, totalCount] = yield Promise.all([
            combo_model_1.ComboModel.find({})
                .populate({
                path: "combo_products.product_id",
                select: "product_name product_price product_discount_price thumbnail_image category_id product_status product_inactivity_start product_inactivity_end product_quantity",
                populate: { path: "category_id", select: "_id category_name" },
            })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            combo_model_1.ComboModel.countDocuments().exec(),
        ]);
        const calculateComboDiscountedPrice = (combo) => {
            var _a;
            return ((_a = combo === null || combo === void 0 ? void 0 : combo.combo_products) !== null && _a !== void 0 ? _a : []).reduce((t, i) => t + (typeof i.combo_price === "number" ? i.combo_price : 0), 0);
        };
        const products = (combos !== null && combos !== void 0 ? combos : []).map((combo) => {
            var _a, _b;
            const finalPrice = calculateComboDiscountedPrice(combo);
            const quantities = ((_a = combo.combo_products) !== null && _a !== void 0 ? _a : [])
                .map((it) => { var _a; return (_a = it === null || it === void 0 ? void 0 : it.product_id) === null || _a === void 0 ? void 0 : _a.product_quantity; })
                .filter((q) => typeof q === "number");
            const minStock = quantities.length ? Math.min(...quantities) : null;
            const allProductsAvailable = ((_b = combo.combo_products) !== null && _b !== void 0 ? _b : []).every((it) => it.product_id && (0, checkAvailability_1.checkProductAvailability)(it.product_id).isAvailable);
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
        const [res] = yield product_model_1.default.aggregate([
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
        const items = (_c = res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : [];
        const totalCount = (_f = (_e = (_d = res === null || res === void 0 ? void 0 : res.total) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.count) !== null && _f !== void 0 ? _f : 0;
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
        const [res] = yield product_model_1.default.aggregate([
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
        const items = (_g = res === null || res === void 0 ? void 0 : res.data) !== null && _g !== void 0 ? _g : [];
        const totalCount = (_k = (_j = (_h = res === null || res === void 0 ? void 0 : res.total) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.count) !== null && _k !== void 0 ? _k : 0;
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
    const SECTION_BUILDERS = {
        popularProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { product_order_count: { $gte: 1 } }),
            sort: { product_order_count: -1, _id: 1 },
        }),
        offeredProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { offered_product_show: true }),
            sort: { _id: 1 },
        }),
        newUploadedProducts: () => ({
            match: Object.assign({}, baseMatch),
            sort: { createdAt: -1, _id: 1 },
        }),
        // brands (we inject brandId below)
        nestleProducts: (brandId) => ({
            match: Object.assign(Object.assign({}, baseMatch), { brand_id: brandId }),
            sort: { _id: 1 },
        }),
        unileverProducts: (brandId) => ({
            match: Object.assign(Object.assign({}, baseMatch), { brand_id: brandId }),
            sort: { _id: 1 },
        }),
        hotDealsProducts: () => ({
            // match by ids + category
            match: Object.assign(Object.assign({}, baseMatch), { _id: { $in: Array.from(hotDealMap.keys()).map((s) => new mongoose_1.Types.ObjectId(s)) } }),
            sort: { _id: 1 },
        }),
        // pharmacy flags
        healthAndNutrientsProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [PHARMACY_FLAG_BY_SECTION.healthAndNutrientsProducts]: true }),
            sort: { _id: 1 },
        }),
        covid19Products: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [PHARMACY_FLAG_BY_SECTION.covid19Products]: true }),
            sort: { _id: 1 },
        }),
        adultProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [PHARMACY_FLAG_BY_SECTION.adultProducts]: true }),
            sort: { _id: 1 },
        }),
        supplementProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [PHARMACY_FLAG_BY_SECTION.supplementProducts]: true }),
            sort: { _id: 1 },
        }),
        herbalProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [PHARMACY_FLAG_BY_SECTION.herbalProducts]: true }),
            sort: { _id: 1 },
        }),
        firstAidProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [PHARMACY_FLAG_BY_SECTION.firstAidProducts]: true }),
            sort: { _id: 1 },
        }),
        // skincare flags
        buyAndGetProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [SKINCARE_FLAG_BY_SECTION.buyAndGetProducts]: true }),
            sort: { _id: 1 },
        }),
        winterProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [SKINCARE_FLAG_BY_SECTION.winterProducts]: true }),
            sort: { _id: 1 },
        }),
        summerProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [SKINCARE_FLAG_BY_SECTION.summerProducts]: true }),
            sort: { _id: 1 },
        }),
        bestSellingProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [SKINCARE_FLAG_BY_SECTION.bestSellingProducts]: true }),
            sort: { _id: 1 },
        }),
        hairFallProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [SKINCARE_FLAG_BY_SECTION.hairFallProducts]: true }),
            sort: { _id: 1 },
        }),
        // fashion flags
        fashionPopularProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [FASHION_FLAG_BY_SECTION.popularProducts]: true }),
            sort: { _id: 1 },
        }),
        fashionWinterProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [FASHION_FLAG_BY_SECTION.winterProducts]: true }),
            sort: { _id: 1 },
        }),
        womenProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [FASHION_FLAG_BY_SECTION.womenProducts]: true }),
            sort: { _id: 1 },
        }),
        menProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [FASHION_FLAG_BY_SECTION.menProducts]: true }),
            sort: { _id: 1 },
        }),
        kidsProducts: () => ({
            match: Object.assign(Object.assign({}, baseMatch), { [FASHION_FLAG_BY_SECTION.kidsProducts]: true }),
            sort: { _id: 1 },
        }),
    };
    // For brand sections, resolve the brand id once
    let brandId;
    if (section === "nestleProducts" || section === "unileverProducts") {
        const brandName = section === "nestleProducts" ? "Nestle" : "Unilever";
        const brandDoc = yield brand_model_1.BrandModel.findOne({ brand_name: brandName }, { _id: 1 })
            .lean()
            .exec();
        brandId = brandDoc === null || brandDoc === void 0 ? void 0 : brandDoc._id;
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
    const { match, sort } = build(brandId);
    // Single aggregate + facet
    const { items, totalCount } = yield aggWithFacet({ match, sort });
    // Apply hot deal prices (O(1) lookup) to non-combo sections
    const priced = applyHot(items);
    // Format/availability
    const formatted = priced.map(formatProductResponse);
    // Special wrapping for hotDealsProducts to keep your previous shape
    if (section === "hotDealsProducts") {
        return {
            products: {
                hotDeal_start_date: activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_start_date,
                hotDeal_end_date: activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_end_date,
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
});
exports.findCategorySectionWiseAllProductsServices = findCategorySectionWiseAllProductsServices;
const findAllPopularProductsServices = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    // First get the active hot deal to check for discounts
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({}).populate('hotDeal_products.product_id');
    const hotDealProductIds = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products.map((product) => product.product_id._id);
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
    const applyHotDealDiscounts = (products) => {
        return products.map(product => {
            if (!activeHotDeal)
                return product;
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find((item) => { var _a; return ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a._id.toString()) === product._id.toString(); });
            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);
                return Object.assign(Object.assign({}, product), { product_discount_price: discountedPrice > 0 ? discountedPrice : 0, is_hot_deal: true, hot_deal_discount: hotDealItem.discount_amount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
            }
            return product;
        });
    };
    // Count total before pagination
    const totalCount = yield product_model_1.default.countDocuments({
        product_status: { $in: ['active', 'temporary-in-active'] },
        product_order_count: { $gte: 1 }
    });
    const products = yield product_model_1.default.find({ product_status: { $in: ['active', 'temporary-in-active'] }, product_order_count: { $gte: 1 } }, {
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
        const availability = (0, checkAvailability_1.checkProductAvailability)(product);
        const { product_status } = product, productData = __rest(product, ["product_status"]);
        let categoryInfo = { _id: product.category_id };
        if (product.category_id &&
            typeof product.category_id === 'object' &&
            'category_name' in product.category_id) {
            categoryInfo = {
                _id: product.category_id._id,
                category_name: product.category_id.category_name
            };
        }
        return Object.assign(Object.assign({}, productData), { 
            // category_info: categoryInfo,
            availability });
    });
    // const totalCount = products.length ? products.length : 0;
    return {
        products: applyHotDealDiscounts(productsWithAvailability),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
    };
});
const findAllOfferedProductsServices = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    // First get the active hot deal to check for discounts
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({}).populate('hotDeal_products.product_id');
    const hotDealProductIds = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products.map((product) => product.product_id._id);
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
    const applyHotDealDiscounts = (products) => {
        return products.map(product => {
            if (!activeHotDeal)
                return product;
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find((item) => { var _a; return ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a._id.toString()) === product._id.toString(); });
            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);
                return Object.assign(Object.assign({}, product), { product_discount_price: discountedPrice > 0 ? discountedPrice : 0, is_hot_deal: true, hot_deal_discount: hotDealItem.discount_amount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
            }
            return product;
        });
    };
    // Count total before pagination
    const totalCount = yield product_model_1.default.countDocuments({
        product_status: { $in: ['active', 'temporary-in-active'] },
        offered_product_show: true
    });
    const products = yield product_model_1.default.find({ product_status: { $in: ['active', 'temporary-in-active'] }, offered_product_show: true, }, {
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
        const availability = (0, checkAvailability_1.checkProductAvailability)(product);
        const { product_status } = product, productData = __rest(product, ["product_status"]);
        let categoryInfo = { _id: product.category_id };
        if (product.category_id &&
            typeof product.category_id === 'object' &&
            'category_name' in product.category_id) {
            categoryInfo = {
                _id: product.category_id._id,
                category_name: product.category_id.category_name
            };
        }
        return Object.assign(Object.assign({}, productData), { 
            // category_info: categoryInfo,
            availability });
    });
    // const totalCount = products.length ? products.length : 0;
    return {
        products: applyHotDealDiscounts(productsWithAvailability),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
    };
});
const findAllHotDealProductsServices = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    const currentDate = new Date();
    // First get the active hot deal to check for discounts
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({ hotDeal_status: 'active', hotDeal_end_date: { $gte: currentDate } }).populate('hotDeal_products.product_id');
    const hotDealProductIds = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products.map((product) => product.product_id._id);
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
    const totalCountResult = yield product_model_1.default.aggregate([
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
    const applyHotDealDiscounts = (products) => {
        return products.map(product => {
            if (!activeHotDeal)
                return product;
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find((item) => { var _a; return ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a._id.toString()) === product._id.toString(); });
            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);
                return Object.assign(Object.assign({}, product), { product_discount_price: discountedPrice > 0 ? discountedPrice : 0, is_hot_deal: true, hot_deal_discount: hotDealItem.discount_amount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
            }
            return product;
        });
    };
    // Step 3: Query ProductModel with aggregation
    const hotDealsProducts = yield product_model_1.default.aggregate([
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
    const hotWithDiscounts = applyHotDealDiscounts(hotDealsProducts);
    const formatProductResponse = (product) => {
        const { product_inactivity_start, product_inactivity_end, product_status } = product, rest = __rest(product, ["product_inactivity_start", "product_inactivity_end", "product_status"]);
        return Object.assign(Object.assign({}, rest), { availability: (0, checkAvailability_1.checkProductAvailability)(product), type: 'product' });
    };
    // Create the hot deals products array with dates first
    let formattedHotDealsProducts;
    if (hotWithDiscounts.length > 0) {
        formattedHotDealsProducts = {
            hotDeal_start_date: activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_start_date,
            hotDeal_end_date: activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_end_date,
            products: hotWithDiscounts.map(formatProductResponse), //hotWithDiscounts
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        };
    }
    else {
        formattedHotDealsProducts = {
            hotWithDiscounts: [],
            totalCount: 0,
            page,
            limit,
            totalPages: 0,
        };
    }
    return formattedHotDealsProducts;
});
const findAllComboProductsServices = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    const calculateComboDiscountedPrice = (combo) => {
        var _a;
        if (!((_a = combo === null || combo === void 0 ? void 0 : combo.combo_products) === null || _a === void 0 ? void 0 : _a.length))
            return 0;
        return combo.combo_products.reduce((total, item) => {
            const price = typeof item.combo_price === 'number' ? item.combo_price : 0;
            return total + price;
        }, 0);
    };
    // Count total before pagination
    const totalCount = yield combo_model_1.ComboModel.countDocuments({});
    const comboProducts = yield combo_model_1.ComboModel.find({})
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
    });
    const comboWithPrices = comboProducts
        .map((combo) => {
        const finalPrice = calculateComboDiscountedPrice(combo);
        if (finalPrice === null)
            return null; // Skip combos with no products in this category
        return Object.assign(Object.assign({}, combo.toObject()), { final_price: finalPrice });
    })
        .filter(combo => combo !== null);
    const simplifiedCombos = comboWithPrices.map((combo) => {
        // Check availability of all products in the combo
        const allProductsAvailable = combo.combo_products.every((item) => {
            if (!item.product_id)
                return false; // if product is missing, consider unavailable
            return (0, checkAvailability_1.checkProductAvailability)(item.product_id).isAvailable;
        });
        const quantities = combo.combo_products
            .map((item) => { var _a; return (_a = item === null || item === void 0 ? void 0 : item.product_id) === null || _a === void 0 ? void 0 : _a.product_quantity; })
            .filter((q) => typeof q === 'number');
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
});
const findAllNestleBrandProductsServices = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (
/*queryParams: Record<string, unknown>*/
page = 1, limit = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    // const categoryName = queryParams.category as string;
    // First get the active hot deal to check for discounts
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({}).populate('hotDeal_products.product_id');
    const hotDealProductIds = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products.map((product) => product.product_id._id);
    const applyHotDealDiscounts = (products) => {
        // If no active hot deal or no hot deal products, return original products
        if (!activeHotDeal || (hotDealProductIds === null || hotDealProductIds === void 0 ? void 0 : hotDealProductIds.length) === 0)
            return products;
        return products.map(product => {
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find((item) => { var _a; return ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a._id.toString()) === product._id.toString(); });
            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);
                return Object.assign(Object.assign({}, product), { product_discount_price: discountedPrice > 0 ? discountedPrice : 0, is_hot_deal: true, hot_deal_discount: hotDealItem.discount_amount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
            }
            return product;
        });
    };
    const getCategoryBrandProducts = (brandName_1, ...args_2) => __awaiter(void 0, [brandName_1, ...args_2], void 0, function* (
    // categoryName: string,
    brandName, extraMatch = {}, skip = 0, limit = 10) {
        const pipeline = [
            {
                $match: Object.assign({ product_status: { $in: ['active', 'temporary-in-active'] } }, extraMatch)
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
        return yield product_model_1.default.aggregate(pipeline);
    });
    const totalCountAgg = yield product_model_1.default.aggregate([
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
    const nestleProductsRaw = yield getCategoryBrandProducts(/*categoryName,*/ 'Nestle', {}, skip, limitNumber);
    const nestleWithDiscounts = applyHotDealDiscounts(nestleProductsRaw);
    const formatProductResponse = (product) => {
        const { product_inactivity_start, product_inactivity_end, product_status } = product, rest = __rest(product, ["product_inactivity_start", "product_inactivity_end", "product_status"]);
        return Object.assign(Object.assign({}, rest), { availability: (0, checkAvailability_1.checkProductAvailability)(product), type: 'product' });
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
});
const findAllUnileverBrandProductsServices = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (
/*queryParams: Record<string, unknown>*/
page = 1, limit = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    // const categoryName = queryParams.category as string;
    // First get the active hot deal to check for discounts
    const activeHotDeal = yield hotDeal_model_1.HotDealModel.findOne({}).populate('hotDeal_products.product_id');
    const hotDealProductIds = activeHotDeal === null || activeHotDeal === void 0 ? void 0 : activeHotDeal.hotDeal_products.map((product) => product.product_id._id);
    const applyHotDealDiscounts = (products) => {
        // If no active hot deal or no hot deal products, return original products
        if (!activeHotDeal || (hotDealProductIds === null || hotDealProductIds === void 0 ? void 0 : hotDealProductIds.length) === 0)
            return products;
        return products.map(product => {
            // Find if this product has a hot deal
            const hotDealItem = activeHotDeal.hotDeal_products.find((item) => { var _a; return ((_a = item.product_id) === null || _a === void 0 ? void 0 : _a._id.toString()) === product._id.toString(); });
            if (hotDealItem) {
                const originalPrice = product.product_discount_price || product.product_price;
                const discountedPrice = originalPrice - (hotDealItem.discount_amount || 0);
                return Object.assign(Object.assign({}, product), { product_discount_price: discountedPrice > 0 ? discountedPrice : 0, is_hot_deal: true, hot_deal_discount: hotDealItem.discount_amount, hot_deal_start_date: activeHotDeal.hotDeal_start_date, hot_deal_end_date: activeHotDeal.hotDeal_end_date });
            }
            return product;
        });
    };
    const getCategoryBrandProducts = (brandName_1, ...args_2) => __awaiter(void 0, [brandName_1, ...args_2], void 0, function* (
    // categoryName: string,
    brandName, extraMatch = {}, skip = 0, limit = 10) {
        const pipeline = [
            {
                $match: Object.assign({ product_status: { $in: ['active', 'temporary-in-active'] } }, extraMatch)
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
        return yield product_model_1.default.aggregate(pipeline);
    });
    const totalCountAgg = yield product_model_1.default.aggregate([
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
    const unileverProductsRaw = yield getCategoryBrandProducts(/*categoryName,*/ 'Unilever', {}, skip, limitNumber);
    const unileverWithDiscounts = applyHotDealDiscounts(unileverProductsRaw);
    const formatProductResponse = (product) => {
        const { product_inactivity_start, product_inactivity_end, product_status } = product, rest = __rest(product, ["product_inactivity_start", "product_inactivity_end", "product_status"]);
        return Object.assign(Object.assign({}, rest), { availability: (0, checkAvailability_1.checkProductAvailability)(product), type: 'product' });
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
});
const findSingleProductServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const product = yield product_model_1.default.findOne({
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
        throw new AppError_1.default(404, "Product Not Found !");
    }
    const { product_status, product_inactivity_start, product_inactivity_end } = product, rest = __rest(product, ["product_status", "product_inactivity_start", "product_inactivity_end"]);
    // Transform and return
    const transformedProduct = Object.assign(Object.assign({}, rest), { additional_images: ((_a = product.additional_images) === null || _a === void 0 ? void 0 : _a.map(img => img.additional_image)) || [], availability: (0, checkAvailability_1.checkProductAvailability)(product), type: 'product' });
    return transformedProduct;
});
const findSingleComboServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const combo = yield combo_model_1.ComboModel.findOne({
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
    if (!combo)
        return null;
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
        if (!product)
            return total;
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
    let stockQuantities = [];
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
            const stock_quantity = product.product_quantity === 0
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
            stock_quantity: product === null || product === void 0 ? void 0 : product.product_quantity,
            combo_quantity: item.product_quantity,
            unit: product.unit,
            unit_quantity: product.unit_quantity,
            product_regular_price: basePrice * quantity,
            product_combo_price: (basePrice * quantity) - discount
        };
    });
    // Find the minimum stock quantity
    // const minimum_stock_quantity = stockQuantities.length > 0 ? Math.min(...stockQuantities) : null;
    const validQuantities = stockQuantities.filter(q => q !== null);
    const minimum_stock_quantity = validQuantities.length === 0 ? null : Math.min(...validQuantities);
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
});
const getCommonCategoryDataAppService = (category_slug) => __awaiter(void 0, void 0, void 0, function* () {
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
    const category = yield category_model_1.default.findOne({ category_slug }).select("_id");
    if (!category)
        throw new Error("Category not found");
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
    const [banners, reels, productsGrouped, subcategories] = yield Promise.all([
        banner_model_1.BannerModel.find({ banner_position: category_slug, banner_status: "active" })
            .sort({ banner_serial: 1 })
            .limit(10)
            .lean(),
        ytLink_model_1.YTLinkModel.find({ category_type: category_slug, ytLink_status: "active" })
            .sort({ ytLink_serial: 1 })
            .limit(10)
            .lean(),
        product_model_1.default.aggregate([
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
                    from: "categories", // collection name (used lookup for populating category data)
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
        subcategory_model_1.default.find({ category_id: category._id, subcategory_status: "active" })
            .sort({ subcategory_serial: 1 })
            .lean()
    ]);
    const { common_popular_products, common_offer_products, common_mega_deal, common_newly_uploaded } = productsGrouped[0] || {};
    // ✅ Add availability for all product arrays
    const addAvailability = (products) => products.map((product) => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
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
});
exports.getCommonCategoryDataAppService = getCommonCategoryDataAppService;
const findFilteredCategoriesAppService = () => __awaiter(void 0, void 0, void 0, function* () {
    const excludedSlugs = ["Grocery", "Pharmacy", "Fashion", "Beauty-and-Skincare", "Food"];
    const categories = yield category_model_1.default.find({ category_slug: { $nin: excludedSlugs } }, // exclude these slugs
    { category_name: 1, category_logo: 1 } // select only needed fields
    ).lean();
    return categories;
});
exports.findFilteredCategoriesAppService = findFilteredCategoriesAppService;
//get all active products for customers
const findAllProductServicesApp = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract category_id from query params if it exists
    const categoryId = queryParams.category_id || queryParams.categoryId; // ✅ handle both cases
    const subcategoryId = queryParams.subcategory_id;
    const childcategoryId = queryParams.childcategory_id;
    const minPrice = Number(queryParams.min_price);
    const maxPrice = Number(queryParams.max_price);
    // Build initial query with category filter if provided
    const initialQuery = {
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
        initialQuery.product_price = Object.assign(Object.assign({}, (initialQuery.product_price || {})), { $gte: minPrice });
    }
    if (!isNaN(maxPrice)) {
        initialQuery.product_price = Object.assign(Object.assign({}, (initialQuery.product_price || {})), { $lte: maxPrice });
    }
    const initialSort = {};
    const sortBy = queryParams.sort_by || 'bestselling_product_show';
    const sortOrder = queryParams.sort_order || 'asc';
    if (sortBy === 'bestselling_product_show') {
        initialSort.bestselling_product_show = sortOrder === 'asc' ? 1 : -1;
    }
    else if (sortBy === 'product_price') {
        initialSort.product_price = sortOrder === 'asc' ? 1 : -1;
    }
    else if (sortBy === 'product_name') {
        initialSort.product_name = sortOrder === 'asc' ? 1 : -1;
    }
    else {
        initialSort._id = sortOrder === 'asc' ? 1 : -1; // Default sorting by _id
    }
    // Step 1: Build the base query with population and sorting
    const modelQuery = product_model_1.default.find(Object.assign(Object.assign({}, initialQuery), ((!isNaN(minPrice) || !isNaN(maxPrice)) && {
        $expr: {
            $and: [
                !isNaN(minPrice) && { $gte: [{ $ifNull: ["$product_discount_price", "$product_price"] }, minPrice] },
                !isNaN(maxPrice) && { $lte: [{ $ifNull: ["$product_discount_price", "$product_price"] }, maxPrice] }
            ].filter(Boolean)
        }
    }))) // filter max, min price if product_discount_price exists, otherwise fallback to product_price
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
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['product_name'])
        // .search(productSearchableField) // Provide searchable fields
        // .filter() // Uncomment and implement if needed
        .sort()
        .paginate();
    // .fields(); // Uncomment and implement if needed
    // Step 3: Execute the query to get the products
    const products = yield query.modelQuery;
    // Add availability check to each product
    const productsWithAvailability = products.map(product => (Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) })));
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
    const totalCount = yield product_model_1.default.countDocuments(query.modelQuery.getFilter());
    return { products: productsWithAvailability, totalCount };
});
// logged in User info
const findUserByIdServices = (user_phone_or_email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.default.findOne({
        $or: [
            { user_phone: user_phone_or_email },
            { user_email: user_phone_or_email }
        ]
    });
    // .select('-user_password -otp_code -otp_expires_at -scheduledForDeletionAt');
    return result;
});
const updateUserProfileServices = (_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield user_model_1.default.findById(_id);
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // If the user wants to update the password, hash it
    if (payload.user_password) {
        payload.user_password = yield (0, hashHelper_1.hashPassword)(payload.user_password);
    }
    const result = yield user_model_1.default.findByIdAndUpdate(_id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// find recent orders by user id
const findRecentOrdersByUserIdServices = (user_id, limit, skip) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.OrderModel.find({ order_user_id: user_id })
        .sort({ createdAt: -1 })
        // .populate("order_user_id order_delivery_location")
        .select('order_id order_status order_payable_amount createdAt updatedAt ' //+
    // pick only these subfields from order_items
    // 'order_items._id order_items.quantity order_items.price'
    )
        .skip(skip)
        .limit(limit)
        .lean();
    const total = yield order_model_1.OrderModel.countDocuments({ order_user_id: user_id });
    return {
        data: orders,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
    };
});
// find my orders by user id
const findMyOrdersByUserIdServices = (user_id, limit, skip) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.OrderModel.find({ order_user_id: user_id })
        .sort({ createdAt: -1 })
        // .populate("order_user_id order_delivery_location")
        .select('order_id order_status order_payable_amount order_items createdAt updatedAt' //+
    // pick only these subfields from order_items
    // 'order_items._id order_items.quantity'
    )
        .skip(skip)
        .limit(limit)
        .lean();
    const ordersWithCount = orders.map(o => {
        var _a;
        return (Object.assign(Object.assign({}, o), { order_items_count: ((_a = o.order_items) === null || _a === void 0 ? void 0 : _a.length) || 0 }));
    });
    const total = yield order_model_1.OrderModel.countDocuments({ order_user_id: user_id });
    return {
        data: ordersWithCount, //orders,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
    };
});
const findRefundByUserIdService = (id, limit, skip) => __awaiter(void 0, void 0, void 0, function* () {
    const refunds = yield refund_model_1.RefundModel.find({ user_id: id })
        .sort({ createdAt: -1 })
        .select('order_id refund_status refund_amount refund_reason createdAt')
        // .populate('user_id')
        .skip(skip)
        .limit(limit);
    const total = yield refund_model_1.RefundModel.countDocuments({ user_id: id });
    return {
        data: refunds,
        total,
        page: Math.floor(skip / limit) + 1,
        limit
    };
});
exports.AppServices = {
    findBannerAndReelsServices,
    findCategoryWiseProductsServices,
    findCategoryWiseSubcategoriesServices,
    findCategoryWiseOnlySubcategoriesServices,
    findCategorySectionWiseAllProductsServices: exports.findCategorySectionWiseAllProductsServices,
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
    findRecentOrdersByUserIdServices,
    findMyOrdersByUserIdServices,
    findRefundByUserIdService
};
