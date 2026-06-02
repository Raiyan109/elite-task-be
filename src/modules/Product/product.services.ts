
import { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { checkProductAvailability } from "../../utils/checkAvailability";
import { BrandModel } from "../Brand/brand.model";
import CategoryModel from "../Category/category.model";
import { YTLinkModel } from "../YTLink/ytLink.model";
import { additionalImagesArray, IProductInterface, productSearchableField } from "./product.interface";
import ProductModel from "./product.model";
import { BannerModel } from "../Banner/banner.model";
import SubcategoryModel from "../Subcategory/subcategory.model";


// Create A Product
const postProductServices = async (
  data: IProductInterface,
  // session: mongoose.ClientSession
): Promise<IProductInterface | {} | any> => {
  const createProduct: IProductInterface | {} | any = await ProductModel.create(
    [data],
    // { session }
  );
  return createProduct[0];
};


// get all dashboard products
// const findAllDashboardProductServices = async (queryParams: Record<string, unknown>): Promise<any> => {
//   console.log(' >>>>>>>>>', queryParams);
//   // Step 1: Build the base query with population and sorting
//   const modelQuery = ProductModel.find()
//     .populate([
//       { path: "category_id" },
//       { path: "childcategory_id" },
//       { path: "subcategory_id" },
//       { path: "brand_id" },
//       // { path: "product_publisher_id" },
//       // { path: "product_updated_by" },
//     ])
//     .sort({ createdAt: -1 })
//     .select("-__v")
//     .lean(); // Return plain JavaScript objects for easier processing

//   // Step 2: Use QueryBuilder to handle search, filter, sort, paginate, etc.
//   const query = new QueryBuilder(modelQuery, queryParams)
//     .search(['product_name'])
//     // .search(productSearchableField) // Provide searchable fields
//     // .filter() // Uncomment and implement if needed
//     .sort()
//     .paginate();
//   // .fields(); // Uncomment and implement if needed

//   // Step 3: Execute the query to get the products
//   const products = await query.modelQuery;

//   // Step 4: For each product, conditionally fetch variations if is_variation is true
//   // const productsWithVariations = await Promise.all(
//   //   products.map(async (product) => {
//   //     if (product?.is_variation) {
//   //       const variations = await VariationModel.find({
//   //         product_id: product?._id,
//   //       })
//   //         .select("-__v")
//   //         .lean();

//   //       return { ...product, variations };
//   //     } else {
//   //       return { ...product, variations: [] };
//   //     }
//   //   })
//   // );
//   const totalCount = await ProductModel.countDocuments(query.modelQuery.getFilter());
//   return { products, totalCount };
// }


export const findAllDashboardProductServices = async (queryParams: Record<string, unknown>) => {
  const searchTerm = queryParams?.searchTerm as string;
  const category_name = queryParams?.category_name as string;
  const subcategory_name = queryParams?.subcategory_name as string;
  const childcategory_name = queryParams?.childcategory_name as string;
  const product_status = queryParams?.product_status as string;

  // console.log(childcategory_name);


  let page = parseInt(queryParams?.page as string) || 1;
  let limit = parseInt(queryParams?.limit as string) || 100;
  let skip = (page - 1) * limit;

  const aggregationPipeline: any[] = [
    {
      $lookup: {
        from: 'brands',
        localField: 'brand_id',
        foreignField: '_id',
        as: 'brand_id',
      },
    },
    { $unwind: { path: '$brand_id', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category_id',
      },
    },
    { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategory_id',
        foreignField: '_id',
        as: 'subcategory_id',
      },
    },
    { $unwind: { path: '$subcategory_id', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'childcategories',
        localField: 'childcategory_id',
        foreignField: '_id',
        as: 'childcategory_id',
      },
    },
    { $unwind: { path: '$childcategory_id', preserveNullAndEmptyArrays: true } },
  ];


  // 🔹 Add product_status filter only if provided
  if (product_status) {
    aggregationPipeline.push({
      $match: { product_status: product_status },
    });
  }

  // Filter by category/subcategory/childcategory names
  const nameFilterConditions: any[] = [];

  if (category_name) {
    nameFilterConditions.push({
      'category_id.category_name': { $regex: category_name, $options: 'i' },
    });
  }

  if (subcategory_name) {
    nameFilterConditions.push({
      'subcategory_id.subcategory_name': { $regex: subcategory_name, $options: 'i' },
    });
  }

  if (childcategory_name) {
    nameFilterConditions.push({
      'childcategory_id.childcategory_name': { $regex: childcategory_name, $options: 'i' },
    });
  }

  if (nameFilterConditions.length > 0) {
    aggregationPipeline.push({
      $match: { $and: nameFilterConditions },
    });
  }

  console.log(searchTerm)

  // Filter by search term
  if (searchTerm) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { product_name: { $regex: searchTerm, $options: "i" } },
          { "brand_id.brand_name": { $regex: searchTerm, $options: "i" } },
          { product_barcode: { $regex: searchTerm, $options: "i" } },
          //{ 'category_id.category_name': { $regex: searchTerm, $options: 'i' } },
          // { 'subcategory_id.subcategory_name': { $regex: searchTerm, $options: 'i' } },
          // { 'childcategory_id.childcategory_name': { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });

    // Optional: reset pagination when searching
    page = 1;

    limit = 100;
    skip = 0;
  }

  // Sort and paginate
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  // Execute main query
  const result = await ProductModel.aggregate(aggregationPipeline);

  // For total count (exclude skip & limit)
  const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: 'total' }];
  const totalResult = await ProductModel.aggregate(totalCountPipeline);
  const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data: result,
    pagination: {
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    total: totalRecords,
  };
};

export const findDashboardAvailableProductsForHotDealsServices = async (
  queryParams: Record<string, unknown>
) => {
  const searchTerm = queryParams?.searchTerm as string;
  const category_name = queryParams?.category_name as string;
  const subcategory_name = queryParams?.subcategory_name as string;
  const childcategory_name = queryParams?.childcategory_name as string;

  let page = parseInt(queryParams?.page as string) || 1;
  let limit = parseInt(queryParams?.limit as string) || 100;
  let skip = (page - 1) * limit;

  const aggregationPipeline: any[] = [
    // 🔎 Join brands
    {
      $lookup: {
        from: 'brands',
        localField: 'brand_id',
        foreignField: '_id',
        as: 'brand_id',
      },
    },
    { $unwind: { path: '$brand_id', preserveNullAndEmptyArrays: true } },

    // 🔎 Join categories
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category_id',
      },
    },
    { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },

    // 🔎 Join subcategories
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategory_id',
        foreignField: '_id',
        as: 'subcategory_id',
      },
    },
    { $unwind: { path: '$subcategory_id', preserveNullAndEmptyArrays: true } },

    // 🔎 Join childcategories
    {
      $lookup: {
        from: 'childcategories',
        localField: 'childcategory_id',
        foreignField: '_id',
        as: 'childcategory_id',
      },
    },
    { $unwind: { path: '$childcategory_id', preserveNullAndEmptyArrays: true } },

    // 🚫 Exclude products that are inside any Hot Deal
    {
      $lookup: {
        from: 'hotdeals',
        let: { productId: '$_id' },
        pipeline: [
          { $unwind: '$hotDeal_products' },
          {
            $match: {
              $expr: { $eq: ['$hotDeal_products.product_id', '$$productId'] },
            },
          },
        ],
        as: 'hot_deal_ref',
      },
    },
    {
      $match: {
        hot_deal_ref: { $size: 0 }, // keep only those NOT in hot deals
      },
    },
    // ✅ Only active products
    {
      $match: { product_status: "active" },
    },
  ];

  // Filter by category/subcategory/childcategory names
  const nameFilterConditions: any[] = [];

  if (category_name) {
    nameFilterConditions.push({
      'category_id.category_name': { $regex: category_name, $options: 'i' },
    });
  }

  if (subcategory_name) {
    nameFilterConditions.push({
      'subcategory_id.subcategory_name': { $regex: subcategory_name, $options: 'i' },
    });
  }

  if (childcategory_name) {
    nameFilterConditions.push({
      'childcategory_id.childcategory_name': { $regex: childcategory_name, $options: 'i' },
    });
  }

  if (nameFilterConditions.length > 0) {
    aggregationPipeline.push({
      $match: { $and: nameFilterConditions },
    });
  }

  // Filter by search term
  if (searchTerm) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { product_name: { $regex: searchTerm, $options: 'i' } },
          { 'brand_id.brand_name': { $regex: searchTerm, $options: 'i' } },
          { product_barcode: { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });

    // Reset pagination for search
    page = 1;
    limit = 100;
    skip = 0;
  }

  // Sort + Paginate
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  // Execute main query
  const result = await ProductModel.aggregate(aggregationPipeline);

  // For total count (exclude skip & limit)
  const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: 'total' }];
  const totalResult = await ProductModel.aggregate(totalCountPipeline);
  const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data: result,
    pagination: {
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    total: totalRecords,
  };
};


export const findDashboardAvailableProductsForCouponNotAppliedServices = async (
  queryParams: Record<string, unknown>
) => {
  const searchTerm = queryParams?.searchTerm as string;
  const category_name = queryParams?.category_name as string;
  const subcategory_name = queryParams?.subcategory_name as string;
  const childcategory_name = queryParams?.childcategory_name as string;

  let page = parseInt(queryParams?.page as string) || 1;
  let limit = parseInt(queryParams?.limit as string) || 100;
  let skip = (page - 1) * limit;

  const aggregationPipeline: any[] = [
    // 🔎 Join brands
    {
      $lookup: {
        from: 'brands',
        localField: 'brand_id',
        foreignField: '_id',
        as: 'brand_id',
      },
    },
    { $unwind: { path: '$brand_id', preserveNullAndEmptyArrays: true } },

    // 🔎 Join categories
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category_id',
      },
    },
    { $unwind: { path: '$category_id', preserveNullAndEmptyArrays: true } },

    // 🔎 Join subcategories
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subcategory_id',
        foreignField: '_id',
        as: 'subcategory_id',
      },
    },
    { $unwind: { path: '$subcategory_id', preserveNullAndEmptyArrays: true } },

    // 🔎 Join childcategories
    {
      $lookup: {
        from: 'childcategories',
        localField: 'childcategory_id',
        foreignField: '_id',
        as: 'childcategory_id',
      },
    },
    { $unwind: { path: '$childcategory_id', preserveNullAndEmptyArrays: true } },

    // 🚫 Exclude products that are inside Coupon Not Applied
    {
      $lookup: {
        from: 'couponnotapplieds',
        let: { productId: '$_id' },
        pipeline: [
          { $unwind: '$coupon_not_applied_products' },
          {
            $match: {
              $expr: { $eq: ['$coupon_not_applied_products.product_id', '$$productId'] },
            },
          },
        ],
        as: 'coupon_not_applied_ref',
      },
    },
    {
      $match: {
        coupon_not_applied_ref: { $size: 0 }, // ✅ exclude those already in coupon not applied
      },
    },
  ];

  // 🔎 Filter by category/subcategory/childcategory names
  const nameFilterConditions: any[] = [];

  if (category_name) {
    nameFilterConditions.push({
      'category_id.category_name': { $regex: category_name, $options: 'i' },
    });
  }

  if (subcategory_name) {
    nameFilterConditions.push({
      'subcategory_id.subcategory_name': { $regex: subcategory_name, $options: 'i' },
    });
  }

  if (childcategory_name) {
    nameFilterConditions.push({
      'childcategory_id.childcategory_name': { $regex: childcategory_name, $options: 'i' },
    });
  }

  if (nameFilterConditions.length > 0) {
    aggregationPipeline.push({
      $match: { $and: nameFilterConditions },
    });
  }

  // 🔎 Filter by search term
  if (searchTerm) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { product_name: { $regex: searchTerm, $options: 'i' } },
          { 'brand_id.brand_name': { $regex: searchTerm, $options: 'i' } },
          { product_barcode: { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });

    // Reset pagination for search
    page = 1;
    limit = 100;
    skip = 0;
  }

  // ⏳ Sort + Paginate
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  // Execute main query
  const result = await ProductModel.aggregate(aggregationPipeline);

  // 📊 For total count (exclude skip & limit)
  const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: 'total' }];
  const totalResult = await ProductModel.aggregate(totalCountPipeline);
  const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data: result,
    pagination: {
      totalPage: totalPages,
      currentPage: page,
      limit: limit,
    },
    total: totalRecords,
  };
};



//get all active products for customers
const findAllProductServices = async (queryParams: Record<string, unknown>): Promise<any> => {
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
      { path: "category_id" },
      { path: "childcategory_id" },
      { path: "subcategory_id" },
      { path: "brand_id" },
      // { path: "product_publisher_id" },
      // { path: "product_updated_by" },
    ])
    .sort(initialSort)
    // .select("product_order_count product_name")
    .select("-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty")
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

//get all active products for customers
const findSearchProductServices = async (queryParams: Record<string, unknown>): Promise<any> => {

  const products = await ProductModel.find({ product_status: { $in: ['active', 'temporary-in-active'] } }).lean();

  // Add availability check to each product
  const productsWithAvailability = products.map(product => ({
    ...product,
    availability: checkProductAvailability(product)
  }))


  const totalCount = await ProductModel.countDocuments();
  return { products: productsWithAvailability, totalCount };
}

//get all related products for customers
const findRelatedProductServices = async (
  queryParams: Record<string, unknown>
): Promise<any> => {
  const productId = queryParams.id; // product to exclude
  const categoryId = queryParams.category_id || queryParams.categoryId;
  const subcategoryId = queryParams.subcategory_id;

  // Base query (only active products, exclude the given id)
  const initialQuery: any = {
    product_status: { $in: ["active", "temporary-in-active"] },
    _id: { $ne: productId }, // exclude specific product
  };

  if (categoryId) {
    initialQuery.category_id = categoryId;
  }
  if (subcategoryId) {
    initialQuery.subcategory_id = subcategoryId;
  }

  // Sorting
  // const initialSort: any = {};
  // const sortBy = queryParams.sort_by || "bestselling_product_show";
  // const sortOrder = queryParams.sort_order || "asc";

  // if (sortBy === "bestselling_product_show") {
  //   initialSort.bestselling_product_show = sortOrder === "asc" ? 1 : -1;
  // } else if (sortBy === "product_price") {
  //   initialSort.product_price = sortOrder === "asc" ? 1 : -1;
  // } else if (sortBy === "product_name") {
  //   initialSort.product_name = sortOrder === "asc" ? 1 : -1;
  // } else {
  //   initialSort._id = sortOrder === "asc" ? 1 : -1;
  // }

  // Step 1: Base query with populate + sort
  const modelQuery = ProductModel.find(initialQuery)
    .populate([
      { path: "category_id" },
      { path: "subcategory_id" },
      { path: "childcategory_id" },
      { path: "brand_id" },
    ])
    //.sort(initialSort)
    .sort({ createdAt: -1 }) // newest products first
    .select(
      "-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty"
    )
    .lean();

  // Step 2: QueryBuilder (for search, paginate, etc.)
  const query = new QueryBuilder(modelQuery, queryParams)
    .search(["product_name"])
    .sort()
    .paginate();

  // Step 3: Execute query
  const products = await query.modelQuery;

  // Add availability
  const productsWithAvailability = products.map((product) => ({
    ...product,
    availability: checkProductAvailability(product),
  }));

  const totalCount = await ProductModel.countDocuments(
    query.modelQuery.getFilter()
  );

  return { products: productsWithAvailability, totalCount };
};

//get all popular products for customers
const findPopularProductsServices = async (queryParams: Record<string, unknown>): Promise<any> => {
  // Extract category_id from query params if it exists
  // const categoryId = queryParams.category_id;

  //Find Grocery category ID
  const groceryCategory = await CategoryModel.findOne({ category_name: "Grocery" })
    .select("_id")
    .lean();

  if (!groceryCategory) {
    return { products: [], totalCount: 0 };
  }

  // Build initial query with category filter if provided
  const initialQuery: any = {
    product_status: { $in: ['active', 'temporary-in-active'] },
    product_order_count: { $gte: 1 },
    category_id: groceryCategory._id,
  };
  // if (categoryId) {
  //   initialQuery.category_id = categoryId;
  // }
  // Step 1: Build the base query with population and sorting
  const modelQuery = ProductModel.find(initialQuery)
    .populate([
      { path: "category_id" },
      { path: "childcategory_id" },
      { path: "subcategory_id" },
      { path: "brand_id" },
      //  { path: "category_id", select: "category_name category_slug category_logo category_status category_serial category_banner" },
      // { path: "childcategory_id", select: "subcategory_name subcategory_slug subcategory_logo subcategory_status subcategory_serial subcategory_banner category_id" },
      // { path: "subcategory_id", select: "childcategory_name childcategory_slug childcategory_logo childcategory_status childcategory_serial childcategory_banner subcategory_id" },
      // { path: "brand_id" },
      // { path: "product_publisher_id" },
      // { path: "product_updated_by" },
    ])
    .sort({ product_order_count: -1 })
    .select("-__v")
    .lean()
    .limit(10);

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

  const totalCount = await ProductModel.countDocuments(query.modelQuery.getFilter());

  // Add availability check to each product
  const productsWithAvailability = products.map(product => ({
    ...product,
    availability: checkProductAvailability(product)
  }))
  return { products: productsWithAvailability, totalCount };
}

//find hot deals
const findHotDealsProductsServices = async () => {
  //Find Grocery category ID
  const groceryCategory = await CategoryModel.findOne({ category_name: "Grocery" })
    .select("_id")
    .lean();

  if (!groceryCategory) {
    return { products: [], totalCount: 0 };
  }

  const filter = {
    product_status: { $in: ['active', 'temporary-in-active'] },
    category_id: groceryCategory._id,
    $expr: {
      $lte: ["$product_discount_price", { $multiply: ["$product_price", 0.6] }]  // discount_price <= 0.6 * price
    }
  };

  const products = await ProductModel.find(filter)
    .populate([
      { path: "category_id" },
      { path: "childcategory_id" },
      { path: "subcategory_id" },
      { path: "brand_id" },
    ])
    .sort({ _id: -1 })
    .select("-__v")
    .lean()
    .limit(10);

  const totalCount = await ProductModel.countDocuments(filter);
  return { products, totalCount };
}

//find hot deals
const findNewUploadedProductsServices = async () => {

  //Find Grocery category ID
  const groceryCategory = await CategoryModel.findOne({ category_name: "Grocery" })
    .select("_id")
    .lean();

  if (!groceryCategory) {
    return { products: [], totalCount: 0 };
  }

  // Build initial query with category filter if provided
  const initialQuery: any = {
    product_status: { $in: ['active', 'temporary-in-active'] },
    category_id: groceryCategory._id,
  };

  const products = await ProductModel.find(initialQuery)
    .populate([
      { path: "category_id" },
      { path: "childcategory_id" },
      { path: "subcategory_id" },
      { path: "brand_id" },
    ])
    .sort({ createdAt: -1 })
    .select("-__v -meta_description -meta_keywords -meta_title -product_return -product_warrenty")
    .lean()
    .limit(10);

  const totalCount = await ProductModel.countDocuments();
  const productsWithAvailability = products.map(product => ({
    ...product,
    availability: checkProductAvailability(product)
  }))
  return { products: productsWithAvailability, totalCount };
}

//find offered products
const findOfferedProductsServices = async () => {

  //Find Grocery category ID
  const groceryCategory = await CategoryModel.findOne({ category_name: "Grocery" })
    .select("_id")
    .lean();

  if (!groceryCategory) {
    return { products: [], totalCount: 0 };
  }

  // Build initial query with category filter if provided
  const initialQuery: any = {
    product_status: { $in: ['active', 'temporary-in-active'] },
    category_id: groceryCategory._id,
    offered_product_show: true
  };

  const products = await ProductModel.find(/*{ offered_product_show: true }*/ initialQuery)
    .populate([
      { path: "category_id" },
      { path: "childcategory_id" },
      { path: "subcategory_id" },
      { path: "brand_id" },
    ])
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  // Add availability check to each product
  const productsWithAvailability = products.map(product => ({
    ...product,
    availability: checkProductAvailability(product)
  }))

  const totalCount = products.length ? products.length : 0;
  return { products: productsWithAvailability, totalCount };
}


// get single dashboard products
const findSingleDashboardProductServices = async (productId: string) => {
  const product = await ProductModel.findById(productId)
    .populate('category_id')
    .populate('childcategory_id')
    .populate('subcategory_id')
    .populate('brand_id')
    .select("-__v")
    .lean(); // Use .lean() to return a plain JavaScript object

  if (!product) {
    throw new AppError(404, "Product Not Found !");
  }
  // if (product?.is_variation) {
  //   // Step 2: Find variations related to the product and populate attributes
  //   const variations = await VariationModel.find({ product_id: productId })
  //     .select("-__v")
  //     .lean();

  //   // Step 3: Combine product data with variations
  //   return { ...product, variations };
  // }
  return { ...product };
}

// get single products
const findSingleProductServices = async (id: string) => {
  const product = await ProductModel.findOne({
    product_slug: id,
    product_status: { $in: ['active', 'temporary-in-active'] } // Ensure the product is active or temporarily inactive
  })
    .populate('category_id')
    .populate('childcategory_id')
    .populate('subcategory_id')
    .populate('brand_id')
    .select("-__v")
    .lean(); // Use .lean() to return a plain JavaScript object

  if (!product) {
    throw new AppError(404, "Product Not Found !");
  }

  return {
    ...product,
    availability: checkProductAvailability(product)
  };
}

// get products by IDs (cart)
const findProductsByIdsServices = async (ids: Array<string>) => {
  const products = await ProductModel.find({ _id: { $in: ids } })
  return products
}

// get products by brand IDs
const findProductsByBrandIdServices = async (
  brandId: string,
  page: number = 1,
  limit: number = 10
) => {
  if (!Types.ObjectId.isValid(brandId)) {
    throw new Error("Invalid brand ID");
  }

  const skip = (page - 1) * limit;

  // Fetch products with pagination
  const products = await ProductModel.find({ brand_id: brandId })
    .populate({
      path: "brand_id",
      select: "brand_name",
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }) // newest first (optional)
    .lean();

  // Get total count
  const totalRecords = await ProductModel.countDocuments({ brand_id: brandId });

  // Add availability check to each product
  const productsWithAvailability = products.map(product => ({
    ...product,
    availability: checkProductAvailability(product)
  }))

  return {
    products: productsWithAvailability,
    pagination: {
      totalPage: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
    },
    total: totalRecords,
  };
};

// Status bulk update after filtering with category, subcategory and childcategory
const statusBulkUpdateService = async ({
  productIds,
  product_status,
  product_inactivity_start,
  product_inactivity_end,
}: {
  productIds: string[];
  product_status?: string;
  product_inactivity_start?: string;
  product_inactivity_end?: string;
}) => {
  const updatePayload: any = {};
  if (product_status) updatePayload.product_status = product_status;
  if (product_inactivity_start) updatePayload.product_inactivity_start = product_inactivity_start;
  if (product_inactivity_end) updatePayload.product_inactivity_end = product_inactivity_end;

  const result = await ProductModel.updateMany(
    { _id: { $in: productIds } },
    { $set: updatePayload }
  );

  return result;
};

export const pharmacySectionsShowBulkUpdateService = async (
  updates: {
    productId: string;
    sections: Record<string, boolean>;
  }[]
) => {
  const bulkOps = updates.map(({ productId, sections }) => {
    const setPayload: Record<string, boolean> = {};
    const unsetPayload: Record<string, ''> = {};

    for (const [key, value] of Object.entries(sections)) {
      if (key.startsWith('pharmacy_section_') && key.endsWith('_show')) {
        if (value) setPayload[key] = true;
        else unsetPayload[key] = '';
      }
    }

    const updateOps: Record<string, any> = {};
    if (Object.keys(setPayload).length > 0) updateOps.$set = setPayload;
    if (Object.keys(unsetPayload).length > 0) updateOps.$unset = unsetPayload;

    return {
      updateOne: {
        filter: { _id: productId },
        update: updateOps,
      },
    };
  });

  const result = await ProductModel.bulkWrite(bulkOps);
  return result;
};

export const getPharmacySectionsForWebsiteShowService = async () => {
  // 1️⃣ Find Pharmacy category ID
  const pharmacyCategory = await CategoryModel.findOne({ category_name: "Pharmacy" }).select("_id category_banner").lean();
  if (!pharmacyCategory) {
    throw new Error("Pharmacy category not found");
  }

  const categoryId = pharmacyCategory._id;

  // 2️⃣ Define section keys
  const sectionKeys = [
    "pharmacy_section_1_show",
    "pharmacy_section_2_show",
    "pharmacy_section_3_show",
    "pharmacy_section_4_show",
    "pharmacy_section_5_show",
    "pharmacy_section_6_show"
  ];

  // 2️⃣a Define section names for each key
  const sectionNamesMap: Record<string, string> = {
    pharmacy_section_1_show: "Health & Nutrients",
    pharmacy_section_2_show: "Covid-19",
    pharmacy_section_3_show: "Adult Products",
    pharmacy_section_4_show: "Supplement",
    pharmacy_section_5_show: "Herbal Products",
    pharmacy_section_6_show: "First Aid",
  };

  // 3️⃣ Get products for each section
  const sections = await Promise.all(
    sectionKeys.map(async (key, index) => {
      const products = await ProductModel.find({
        product_status: { $in: ['active', 'temporary-in-active'] },
        category_id: categoryId,
        [key]: true
      })
        .populate("brand_id", "brand_name brand_slug brand_logo")
        .lean();

      // Add availability check to each product
      const productsWithAvailability = products.map(product => ({
        ...product,
        availability: checkProductAvailability(product)
      }))

      return {
        section_name: sectionNamesMap[key] || `Section ${key}`, // use mapping //`Pharmacy Section ${index + 1}`,
        section_key: key,
        products: productsWithAvailability
      };
    })
  );

  // 4️⃣ Get Brands and their products
  // const brands = await BrandModel.find({
  //   category_id: categoryId,
  //   brand_status: "active"
  // }).lean();

  // const brandData = await Promise.all(
  //   brands.map(async (brand) => {
  //     const products = await ProductModel.find({
  //       category_id: categoryId,
  //       brand_id: brand._id
  //     }).lean();

  //     return {
  //       ...brand,
  //       products
  //     };
  //   })
  // );

  // 4️⃣ Get only brand _id and brand_name
  const brandData = await BrandModel.find(
    { category_id: categoryId, brand_status: "active" },
    "_id brand_name brand_logo" // projection
  ).lean();

  // 5️⃣ Get YouTube reels (active + Pharmacy category type)
  const youtubeReels = await YTLinkModel.find(
    {
      ytLink_status: "active",
      category_type: "Pharmacy",
    },
    "_id ytLink_link"
  )
    .sort({ ytLink_serial: 1 }) // optional: sort by serial
    .lean();

  // 6️⃣ Return combined result
  return [
    {
      category_banner: pharmacyCategory.category_banner || [],
    },
    {
      youtube_reels: youtubeReels
    },
    ...sections,
    {
      section_name: "Pharmacy Brands",
      brands: brandData
    }
  ];
};


export const getSkincareSectionsForWebsiteShowService = async () => {
  // 1️⃣ Find Skincare category ID
  const skincareCategory = await CategoryModel.findOne({ category_name: "Beauty & Skincare" }).select("_id category_banner").lean();
  if (!skincareCategory) {
    throw new Error("Skincare category not found");
  }

  const categoryId = skincareCategory._id;

  // 2️⃣ Define section keys
  const sectionKeys = [
    "skincare_section_1_show",
    "skincare_section_2_show",
    "skincare_section_3_show",
    "skincare_section_4_show",
    "skincare_section_5_show",
    "skincare_section_6_show"
  ];

  // 2️⃣a Define section names for each key
  const sectionNamesMap: Record<string, string> = {
    skincare_section_1_show: "Buy & Get Offer",
    skincare_section_2_show: "Winter Offer",
    skincare_section_3_show: "Summer Offer",
    skincare_section_4_show: "Best Selling Products",
    skincare_section_5_show: "Hair Fall Solutions",
    skincare_section_6_show: "Natural & Organic",
  };

  // 3️⃣ Get products for each section
  const sections = await Promise.all(
    sectionKeys.map(async (key, index) => {
      const products = await ProductModel.find({
        product_status: { $in: ['active', 'temporary-in-active'] },
        category_id: categoryId,
        [key]: true
      })
        .populate("brand_id", "brand_name brand_slug brand_logo")
        .lean();

      // Add availability check to each product
      const productsWithAvailability = products.map(product => ({
        ...product,
        availability: checkProductAvailability(product)
      }))

      return {
        section_name: sectionNamesMap[key] || `Section ${key}`, // use mapping //`Skincare Section ${index + 1}`,
        section_key: key,
        products: productsWithAvailability
      };
    })
  );

  // 4️⃣ Get Brands and their products
  // const brands = await BrandModel.find({
  //   category_id: categoryId,
  //   brand_status: "active"
  // }).lean();

  // const brandData = await Promise.all(
  //   brands.map(async (brand) => {
  //     const products = await ProductModel.find({
  //       category_id: categoryId,
  //       brand_id: brand._id
  //     }).lean();

  //     return {
  //       ...brand,
  //       products
  //     };
  //   })
  // );

  // 4️⃣ Get only brand _id and brand_name
  const brandData = await BrandModel.find(
    { category_id: categoryId, brand_status: "active" },
    "_id brand_name brand_logo" // projection
  ).lean();

  // 5️⃣ Get YouTube reels (active + Pharmacy category type)
  const youtubeReels = await YTLinkModel.find(
    {
      ytLink_status: "active",
      category_type: "Beauty & Skincare",
    },
    "_id ytLink_link"
  )
    .sort({ ytLink_serial: 1 }) // optional: sort by serial
    .lean();

  // 6️⃣ Return combined result
  return [
    {
      category_banner: skincareCategory.category_banner || [],
    },
    {
      youtube_reels: youtubeReels
    },
    ...sections,
    {
      section_name: "Beauty & Skincare Brands",
      brands: brandData
    }
  ];
};


export const getFashionSectionsForWebsiteShowService = async () => {
  // 1️⃣ Find Fashion category ID
  const fashionCategory = await CategoryModel.findOne({ category_name: "Fashion" }).select("_id category_banner").lean();
  if (!fashionCategory) {
    throw new Error("Fashion category not found");
  }

  const categoryId = fashionCategory._id;

  // 2️⃣ Define section keys
  const sectionKeys = [
    "fashion_section_1_show",
    "fashion_section_2_show",
    "fashion_section_3_show",
    "fashion_section_4_show",
    "fashion_section_5_show",
    "fashion_section_6_show"
  ];

  // 2️⃣a Define section names for each key
  const sectionNamesMap: Record<string, string> = {
    fashion_section_1_show: "Popular Products",
    fashion_section_2_show: "Mega Deal 40%",
    fashion_section_3_show: "Winter Essentials",
    fashion_section_4_show: "Women's Collection",
    fashion_section_5_show: "Men's Collection",
    fashion_section_6_show: "Kids' Collection",
  };

  // 3️⃣ Get products for each section
  // const sections = await Promise.all(
  //   sectionKeys.map(async (key, index) => {
  //     const products = await ProductModel.find({
  //       product_status: { $in: ['active', 'temporary-in-active'] },
  //       category_id: categoryId,
  //       [key]: true
  //     })
  //       .populate("brand_id", "brand_name brand_slug brand_logo")
  //       .lean();

  //     // Add availability check to each product
  //     const productsWithAvailability = products.map(product => ({
  //       ...product,
  //       availability: checkProductAvailability(product)
  //     }))

  //     return {
  //       section_name: sectionNamesMap[key] || `Section ${key}`, // use mapping //`Fashion Section ${index + 1}`,
  //       section_key: key,
  //       products: productsWithAvailability
  //     };
  //   })
  // );

  // 3️⃣ Get products for each section (with calculated mega deal)
  const sections = await Promise.all(
    sectionKeys.map(async (key) => {
      let products: any[] = [];

      if (key === "fashion_section_2_show") {
        // Mega Deal 40% (discounted products >= 40%)
        products = await ProductModel.find({
          product_status: { $in: ["active", "temporary-in-active"] },
          category_id: categoryId,
          product_discount_price: { $ne: null }, // must have a discount
          product_price: { $gt: 0 }, // prevent division by zero
          $expr: {
            $gte: [
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
              40
            ]
          }
        })
          .populate("brand_id", "brand_name brand_slug brand_logo")
          .lean();
      } else {
        // Normal section logic
        products = await ProductModel.find({
          product_status: { $in: ["active", "temporary-in-active"] },
          category_id: categoryId,
          [key]: true
        })
          .populate("brand_id", "brand_name brand_slug brand_logo")
          .lean();
      }

      // Add availability check
      const productsWithAvailability = products.map(product => ({
        ...product,
        availability: checkProductAvailability(product),
      }));

      return {
        section_name: sectionNamesMap[key] || `Section ${key}`,
        section_key: key,
        products: productsWithAvailability,
      };
    })
  );

  // 4️⃣ Get Brands and their products
  // const brands = await BrandModel.find({
  //   category_id: categoryId,
  //   brand_status: "active"
  // }).lean();

  // const brandData = await Promise.all(
  //   brands.map(async (brand) => {
  //     const products = await ProductModel.find({
  //       category_id: categoryId,
  //       brand_id: brand._id
  //     }).lean();

  //     return {
  //       ...brand,
  //       products
  //     };
  //   })
  // );

  // 4️⃣ Get only brand _id and brand_name
  const brandData = await BrandModel.find(
    { category_id: categoryId, brand_status: "active" },
    "_id brand_name brand_logo" // projection
  ).lean();

  // 5️⃣ Get YouTube reels (active + Pharmacy category type)
  const youtubeReels = await YTLinkModel.find(
    {
      ytLink_status: "active",
      category_type: "Fashion",
    },
    "_id ytLink_link"
  )
    .sort({ ytLink_serial: 1 }) // optional: sort by serial
    .lean();

  // 6️⃣ Return combined result
  return [
    {
      category_banner: fashionCategory.category_banner || [],
    },
    {
      youtube_reels: youtubeReels
    },
    ...sections,
    {
      section_name: "Fashion Brands",
      brands: brandData
    }
  ];
};


export const fashionSectionsShowBulkUpdateService = async (
  updates: {
    productId: string;
    sections: Record<string, boolean>;
  }[]
) => {
  const bulkOps = updates.map(({ productId, sections }) => {
    const setPayload: Record<string, boolean> = {};
    const unsetPayload: Record<string, ''> = {};

    for (const [key, value] of Object.entries(sections)) {
      if (key.startsWith('fashion_section_') && key.endsWith('_show')) {
        if (value) setPayload[key] = true;
        else unsetPayload[key] = '';
      }
    }

    const updateOps: Record<string, any> = {};
    if (Object.keys(setPayload).length > 0) updateOps.$set = setPayload;
    if (Object.keys(unsetPayload).length > 0) updateOps.$unset = unsetPayload;

    return {
      updateOne: {
        filter: { _id: productId },
        update: updateOps,
      },
    };
  });

  const result = await ProductModel.bulkWrite(bulkOps);
  return result;
};


export const skincareSectionsShowBulkUpdateService = async (
  updates: {
    productId: string;
    sections: Record<string, boolean>;
  }[]
) => {
  const bulkOps = updates.map(({ productId, sections }) => {
    const setPayload: Record<string, boolean> = {};
    const unsetPayload: Record<string, ''> = {};

    for (const [key, value] of Object.entries(sections)) {
      if (key.startsWith('skincare_section_') && key.endsWith('_show')) {
        if (value) setPayload[key] = true;
        else unsetPayload[key] = '';
      }
    }

    const updateOps: Record<string, any> = {};
    if (Object.keys(setPayload).length > 0) updateOps.$set = setPayload;
    if (Object.keys(unsetPayload).length > 0) updateOps.$unset = unsetPayload;

    return {
      updateOne: {
        filter: { _id: productId },
        update: updateOps,
      },
    };
  });

  const result = await ProductModel.bulkWrite(bulkOps);
  return result;
};


// update A Product
const updateProductServices = async (
  _id: any,
  data: IProductInterface
): Promise<IProductInterface | {}> => {
  const updateFindProduct: IProductInterface | {} | any =
    await ProductModel.findOne({
      _id,
    });
  if (!updateFindProduct) {
    throw new Error("Product not found");
  }
  // creating data to update
  const updateData: any = { ...data };

  // // যদি `sub_category_id` পাঠানো না হয়, তাহলে সেটি ডিলিট করা হবে
  // const unsetData: any = {};
  // if (!data.hasOwnProperty("sub_category_id")) {
  //   unsetData.sub_category_id = "";
  // }
  // if (!data.hasOwnProperty("child_category_id")) {
  //   unsetData.child_category_id = "";
  // }
  // if (!data.hasOwnProperty("childcategory_id")) {
  //   unsetData.childcategory_id = "";
  // }

  const updateProduct = await ProductModel.updateOne(
    { _id: _id },
    {
      $set: updateData, // updating fields
      //$unset: unsetData, // if don't need to send any field, remove those specific fields
    },
    { runValidators: true }
  );

  return updateProduct;
};


// Delete a Product
export const deleteProductServices = async (
  _id: string,
  thumbnail_image_key: string,
  additional_images: additionalImagesArray[],
  variations: any
): Promise<IProductInterface | any> => {
  const updateProductInfo: IProductInterface | null =
    await ProductModel.findOne({ _id: _id });
  if (!updateProductInfo) {
    throw new AppError(404, "Product not found");
  }
  const Product = await ProductModel.deleteOne(
    { _id: _id },
    {
      runValidators: true,
    }
  );
  return Product;
};


export const getCommonCategoryDataService = async (category_slug: string) => {
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
        $facet: {
          common_popular_products: [
            // { $match: { popular_product_show: true } },
            // { $sort: { createdAt: -1 } },
            { $match: { product_order_count: { $gt: 0 } } }, // Popular products → must have product_order_count > 0
            { $sort: { product_order_count: -1 } },
            { $limit: 10 }
          ],
          common_offer_products: [
            { $match: { offered_product_show: true } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
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
            { $limit: 10 }
          ],
          common_newly_uploaded: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 }
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



export const ProductServices = {
  postProductServices,
  findAllDashboardProductServices,
  findDashboardAvailableProductsForHotDealsServices,
  findDashboardAvailableProductsForCouponNotAppliedServices,
  findAllProductServices,
  findRelatedProductServices,
  findPopularProductsServices,
  findHotDealsProductsServices,
  findNewUploadedProductsServices,
  updateProductServices,
  deleteProductServices,
  findSingleDashboardProductServices,
  findSingleProductServices,
  findProductsByIdsServices,
  findProductsByBrandIdServices,
  findOfferedProductsServices,
  findSearchProductServices,
  statusBulkUpdateService,
};