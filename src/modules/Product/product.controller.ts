import { NextFunction, RequestHandler } from "express";
import mongoose from "mongoose";
import ProductModel from "./product.model";
import httpStatus from "http-status";
import path from "path";
import {
  deleteAllFilesInDirectory,
  generateQRCode,
  generateUniqueSlug,
} from "./product.constant";
import QRCode from "qrcode";

import { fashionSectionsShowBulkUpdateService, getCommonCategoryDataService, getFashionSectionsForWebsiteShowService, getPharmacySectionsForWebsiteShowService, getSkincareSectionsForWebsiteShowService, pharmacySectionsShowBulkUpdateService, ProductServices, skincareSectionsShowBulkUpdateService } from "./product.services";
import { IProductInterface, productSearchableField } from "./product.interface";
import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

// Path to the upload folder
const uploadDir = path.join(__dirname, "../../../uploads");

// Post/create multiple images with product data
const postProduct: RequestHandler = async (req, res, next) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    if (req.files || req.body) {
      const requestData = req.body;

      // Check existing barcode if showProductVariation == "false"
      //     if (requestData?.showProductVariation == "false") {
      //  if (requestData?.barcode) {
      //       const barCodeCheck = await ProductModel.findOne({
      //         barcode: requestData?.barcode,
      //       }).session(session);
      //       if (barCodeCheck) {
      //         deleteAllFilesInDirectory(uploadDir);
      //         throw new AppError(
      //           httpStatus.BAD_REQUEST,
      //           "Barcode already exists"
      //         );
      //       }
      //     }
      //     }

      if (requestData?.barcode) {
        const barCodeCheck = await ProductModel.findOne({
          barcode: requestData?.barcode,
        });
        if (barCodeCheck) {
          deleteAllFilesInDirectory(uploadDir);
          throw new AppError(httpStatus.BAD_REQUEST, "Barcode already exists");
        }
      }

      // Check existing barcode if showProductVariation == "true"
      // if (
      //   requestData?.showProductVariation == "true" &&
      //   requestData?.variation_details
      // ) {
      //   // const variationDetails = JSON.parse(requestData?.variation_details);
      //   for (const variation of requestData?.variation_details) {
      //     const { variation_barcode } = variation;

      //     const barCodeCheck = await VariationModel.findOne({
      //       variation_barcode: variation_barcode,
      //     }).session(session);

      //     if (barCodeCheck) {
      //       deleteAllFilesInDirectory(uploadDir);
      //       throw new AppError(
      //         httpStatus.BAD_REQUEST,
      //         `Barcode "${variation_barcode}" already exists`
      //       );
      //     }
      //   }
      // }

      const files = req.files as Express.Multer.File[];

      // Array to store thumbnail_image data
      let thumbnail_image;
      let thumbnail_image_key;

      // Handle thumbnail image
      const thumbnailImage = files?.find(
        (file) => file.fieldname === "thumbnail_image"
      );
      if (thumbnailImage) {
        const thumbnail_image_upload = await FileUploadHelper.uploadToSpaces(
          thumbnailImage
        );
        thumbnail_image = thumbnail_image_upload?.Location;
        thumbnail_image_key = thumbnail_image_upload?.Key;
      } else {
        thumbnail_image = requestData?.thumbnail_image;
        thumbnail_image_key = requestData?.thumbnail_image_key;
      }

      // Array to store additional_images URLs and keys
      const additional_images = [];

      // Handle additional_images
      const additionalImageFiles = files?.filter((file) =>
        file.fieldname.startsWith("additional_images")
      );
      for (const file of additionalImageFiles) {
        const imageUpload = await FileUploadHelper.uploadToSpaces(file);
        additional_images.push({
          additional_image: imageUpload.Location,
          additional_image_key: imageUpload.Key,
        });
      }

      if (requestData?.additional_default_images) {
        // Assuming requestData?.additional_default_images is defined as shown
        const additionalImages = requestData?.additional_default_images;

        // Combine `additional_image` and `additional_image_key` into objects, filtering out `undefined` values
        const formattedImages = additionalImages.additional_image
          .map((image: any, index: any) => {
            const key = additionalImages.additional_image_key[index];
            // Skip if either `image` or `key` is `undefined`
            if (image === "undefined" || key === "undefined") return null;

            return { additional_image: image, additional_image_key: key };
          })
          .filter(Boolean); // Remove any null values from the array
        additional_images.push(...formattedImages);
      }

      // Generate a unique slug for the product
      const product_slug = await generateUniqueSlug(requestData?.product_name);
      requestData.product_slug = product_slug;

      // let barcode: any;
      // barcode = await generateQRCode();
      // //console.log(barcode);

      // requestData.barcode = requestData?.barcode
      //   ? requestData?.barcode
      //   : barcode;

      // requestData.product_barcode_image = await QRCode.toDataURL(
      //   requestData?.product_barcode
      // );

      // if (requestData?.showProductVariation == "false") {

      // }

      // Create product object
      const productData: any = {
        product_name: requestData?.product_name,
        // product_article_number: requestData?.product_article_number,
        product_slug: requestData?.product_slug,
        product_sku: requestData?.product_sku,
        // product_barcode: requestData?.product_barcode,
        product_status: requestData?.product_status as
          | "active"
          | "in-active"
          | "temporary-in-active",
        product_inactivity_start: requestData?.product_inactivity_start,
        product_inactivity_end: requestData?.product_inactivity_end,
        category_id: requestData?.category_id,
        subcategory_id: requestData?.subcategory_id
          ? requestData?.subcategory_id
          : undefined,
        childcategory_id: requestData?.childcategory_id
          ? requestData?.childcategory_id
          : undefined,
        // attributes_details: Object.values(requestData?.attributes_details ?? {})
        //   .filter(
        //     (att: any) =>
        //       att?.attribute_name !== undefined &&
        //       att?.attribute_values?.length > 0
        //   )
        //   .map((att: any) => ({
        //     attribute_name: att?.attribute_name,
        //     attribute_values:
        //       att?.attribute_values?.map(
        //         (value: { attribute_value_name: any }) => ({
        //           attribute_value_name:
        //             value?.attribute_value_name ?? undefined,
        //         })
        //       ) ?? [],
        //   })),
        product_barcode: requestData?.product_barcode ?? "",
        product_barcode_image: requestData?.product_barcode_image ?? "",
        description: requestData?.description ?? "",
        thumbnail_image: thumbnail_image as string,
        thumbnail_image_key: thumbnail_image_key,
        additional_images: additional_images ?? [],
        product_price:
          requestData?.product_price && parseFloat(requestData?.product_price),
        product_buying_price:
          requestData?.product_buying_price &&
          parseFloat(requestData?.product_buying_price),
        product_discount_price:
          requestData?.product_discount_price &&
          parseFloat(requestData?.product_discount_price),
        product_quantity:
          requestData?.product_quantity &&
          parseInt(requestData?.product_quantity),
        product_alert_quantity:
          requestData?.product_alert_quantity &&
          parseInt(requestData?.product_alert_quantity),
        // is_variation: requestData?.is_variation === "true",
        product_warrenty: requestData?.product_warrenty ?? "",
        product_return: requestData?.product_return ?? "",
        unit: requestData?.unit ?? "",
        unit_quantity:
          requestData?.unit_quantity && parseInt(requestData?.unit_quantity),
        meta_title: requestData?.meta_title ?? "",
        meta_description: requestData?.meta_description ?? "",
        meta_keywords:
          typeof requestData?.meta_keywords === "string"
            ? JSON.parse(requestData?.meta_keywords)
            : requestData?.meta_keywords || [],
        // product_publisher_id: requestData?.product_publisher_id,
        // product_supplier_id: requestData?.product_supplier_id || null,

        product_is_delivery_dhaka_only:
          requestData?.product_is_delivery_dhaka_only ?? false,
        // popular_product_show: requestData?.popular_product_show ?? false,
        // bestselling_product_show: requestData?.bestselling_product_show ?? false,
        offered_product_show: requestData?.offered_product_show ?? false,

        video_url: requestData?.video_url ? requestData?.video_url : "",
        // is_flat_discount_show: requestData?.is_flat_discount_show ? requestData?.is_flat_discount_show : false,
        // is_percent_discount_show: requestData?.is_percent_discount_show ? requestData?.is_percent_discount_show : false,
        discount_show: requestData?.discount_show
          ? requestData?.discount_show
          : "",
        brand_id: requestData?.brand_id ? requestData?.brand_id : null,
      };

      // Save product in the database
      const newProduct: any = await ProductServices.postProductServices(
        productData
      );
      // const newProduct: any = await ProductServices.postProductServices(productData, session);

      // if (requestData?.showProductVariation == "true") {
      //   const variation_details = req?.body?.variation_details; //have to remove JSON Parse when working with frontend
      //   // Process variation_details images
      //   const updatedVariation_details: any = [];
      //   for (let index = 0; index < variation_details?.length; index++) {
      //     let product = variation_details[index];
      //     console.log(product);
      //     product.product_id = newProduct?._id?.toString();
      //     const matchingFiles = files.filter(
      //       (file) =>
      //         file.fieldname === `variation_details[${index}][variation_image]`
      //     );

      //     let v_barcode: any;
      //     v_barcode = await generateQRCode();
      //     product.variation_barcode = product.variation_barcode
      //       ? product.variation_barcode
      //       : v_barcode;
      //     product.variation_barcode_image = await QRCode.toDataURL(
      //       product.variation_barcode
      //     );
      //     for (const file of matchingFiles) {
      //       const imageUpload = await FileUploadHelper.uploadToSpaces(file);
      //       product.variation_image = imageUpload.Location;
      //       product.variation_image_key = imageUpload.Key;
      //     }

      //     updatedVariation_details.push(product);
      //   }

      //   console.log(updatedVariation_details);

      //   const successVariationUpload: any = [];
      //   // Loop through each state in the array
      //   for (const variationDetails of updatedVariation_details) {
      //     // Call the service to save the state with merged data
      //     const result: IVariationInterface | {} = await VariationModel.create(
      //       [variationDetails],
      //       { session }
      //     );
      //     if (result) {
      //       successVariationUpload.push(result);
      //     }
      //   }
      //   if (successVariationUpload.length > 0) {
      //     // Commit transaction
      //     await session.commitTransaction();
      //     session.endSession();
      //     return sendResponse(res, {
      //       statusCode: 200,
      //       success: true,
      //       message: "Product created successfully!",
      //       data: newProduct
      //     });
      //   }
      // }

      // Commit transaction
      // await session.commitTransaction();
      // session.endSession();
      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product created successfully!",
        data: newProduct,
      });
    } else {
      throw new AppError(400, "Image Upload Failed");
    }
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    next(error);
  }
};

// get all dashboard product
// const findAllDashboardProduct = catchAsync(async (req, res, next: NextFunction) => {
//   const query = req.query; // Get all query parameters

//   // Step 1: Fetch products using the service
//   const { products, totalCount } = await ProductServices.findAllDashboardProductServices(query);

//   // Step 2: Check if no data is found
//   // if (!products || products.length === 0) {
//   //   return sendResponse(res, {
//   //     success: false,
//   //     statusCode: httpStatus.NOT_FOUND,
//   //     message: 'No data found.',
//   //     data: [],
//   //   });
//   // }

//   // Step 3: Calculate total count for pagination
//   // const andCondition = [];
//   // if (query.searchTerm) {
//   //   andCondition.push({
//   //     $or: productSearchableField.map((field) => ({
//   //       [field]: {
//   //         $regex: query.searchTerm,
//   //         $options: "i",
//   //       },
//   //     })),
//   //   });
//   // }

//   // const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
//   // const total = await ProductModel.countDocuments(whereCondition);

//   // Step 4: Send the response
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: 'Dashboard products retrieved successfully',
//     totalData: totalCount,  // Include the total count here
//     data: products,
//   });
// });

const findAllDashboardProduct = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ProductServices.findAllDashboardProductServices(query);

  // Check if the database collection is empty or no matching data is found
  // if (!result || result?.data?.length === 0) {
  //   return sendResponse(res, {
  //     success: false,
  //     statusCode: 404,
  //     message: 'No data found.',
  //     data: [],
  //   });
  // }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard Products retrieved successfully",
    data: result?.data,
    pagination: result?.pagination,
    totalData: result?.total,
  });
});


const findDashboardAvailableProductsForHotDeals = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ProductServices.findDashboardAvailableProductsForHotDealsServices(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available Products for Dashboard Hot Deals retrieved successfully",
    data: result?.data,
    pagination: result?.pagination,
    totalData: result?.total,
  });
});


const findDashboardAvailableProductsForCouponNotApplied = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ProductServices.findDashboardAvailableProductsForCouponNotAppliedServices(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available Products for Dashboard coupon Not Applied retrieved successfully",
    data: result?.data,
    pagination: result?.pagination,
    totalData: result?.total,
  });
});

// get all active product
const findAllProduct = catchAsync(async (req, res, next: NextFunction) => {
  const query = req.query; // Get all query parameters

  // Step 1: Fetch products using the service
  const { products, totalCount } = await ProductServices.findAllProductServices(
    query
  );

  //console.log(products.length);

  // // Step 2: Check if no data is found
  // if (!products || products.length === 0) {
  //   return sendResponse(res, {
  //     success: true,
  //     statusCode: httpStatus.NO_CONTENT,
  //     message: "No data found.",
  //     data: [],
  //   });
  // }

  // Step 3: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Active Products retrieved successfully",
    totalData: totalCount, // Include the total count here
    data: products,
  });
});

const findSearchProduct = catchAsync(async (req, res, next: NextFunction) => {
  const query = req.query; // Get all query parameters

  // Step 1: Fetch products using the service
  const { products, totalCount } =
    await ProductServices.findSearchProductServices(query);

  //console.log(products.length);

  // Step 2: Check if no data is found
  if (!products || products.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.NO_CONTENT,
      message: "No data found.",
      data: [],
    });
  }

  // Step 3: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Search Products retrieved successfully",
    totalData: totalCount, // Include the total count here
    data: products,
  });
});

// get all related products
const findRelatedProducts = catchAsync(async (req, res, next: NextFunction) => {
  const query = req.query; // Get all query parameters

  const { products, totalCount } = await ProductServices.findRelatedProductServices(
    query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Related Products retrieved successfully",
    totalData: totalCount, // Include the total count here
    data: products,
  });
});

// get all popular product
const findPopularProduct = catchAsync(async (req, res, next: NextFunction) => {
  const query = req.query; // Get all query parameters

  // Step 1: Fetch products using the service
  const { products, totalCount } =
    await ProductServices.findPopularProductsServices(query);

  //console.log(products.length);

  // Step 2: Check if no data is found
  if (!products || products.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "No data found.",
      data: [],
    });
  }

  // Step 3: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Popular Products retrieved successfully",
    totalData: totalCount, // Include the total count here
    data: products,
  });
});

// get all hot deals product
const findHotDealsProduct = catchAsync(async (req, res, next: NextFunction) => {
  const query = req.query; // Get all query parameters

  // Step 1: Fetch products using the service
  const { products, totalCount } =
    await ProductServices.findHotDealsProductsServices();

  //console.log(products.length);

  // Step 2: Check if no data is found
  if (!products || products.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.NO_CONTENT,
      message: "No data found.",
      data: [],
    });
  }

  // Step 3: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Hot deals Products retrieved successfully",
    totalData: totalCount, // Include the total count here
    data: products,
  });
});

// get all bestselling product
const findNewUploadedProduct = catchAsync(
  async (req, res, next: NextFunction) => {
    const query = req.query; // Get all query parameters

    // Step 1: Fetch products using the service
    const { products, totalCount } =
      await ProductServices.findNewUploadedProductsServices();

    //console.log(products.length);

    // Step 2: Check if no data is found
    if (!products || products.length === 0) {
      return sendResponse(res, {
        success: true,
        statusCode: httpStatus.NO_CONTENT,
        message: "No data found.",
        data: [],
      });
    }

    // Step 3: Send the response
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New uploaded Products retrieved successfully",
      totalData: totalCount, // Include the total count here
      data: products,
    });
  }
);

// get all bestselling product
const findOfferedProduct = catchAsync(async (req, res, next: NextFunction) => {
  // Step 1: Fetch products using the service
  const { products, totalCount } =
    await ProductServices.findOfferedProductsServices();

  //console.log(products.length);

  // Step 2: Check if no data is found
  if (!products || products.length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.NO_CONTENT,
      message: "No data found.",
      data: [],
    });
  }

  // Step 3: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Offered Products retrieved successfully",
    totalData: totalCount, // Include the total count here
    data: products,
  });
});

// get single dashboard product
const findSingleDashboardProduct = catchAsync(
  async (req, res, next: NextFunction) => {
    const { productId } = req.params; // Get all query parameters

    // Step 1: Fetch product using the service
    const product = await ProductServices.findSingleDashboardProductServices(
      productId
    );

    // Step 2: Check if no data is found
    if (!product) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: "No data found.",
        data: [],
      });
    }

    // Step 4: Send the response
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Dashboard product retrieved successfully",
      data: product,
    });
  }
);

// get single product
const findSingleProduct = catchAsync(async (req, res, next: NextFunction) => {
  const { id } = req.params; // Get all query parameters

  // Step 1: Fetch product using the service
  const product = await ProductServices.findSingleProductServices(id);

  // Step 2: Check if no data is found
  if (!product) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "No data found.",
      data: [],
    });
  }

  // Step 4: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Single product retrieved successfully",
    data: product,
  });
});

// get products by IDs
const findProductsByIds = catchAsync(async (req, res, next: NextFunction) => {
  const { ids } = req.body; // Get all query parameters

  // Step 1: Fetch product using the service
  const product = await ProductServices.findProductsByIdsServices(ids);

  // Step 2: Check if no data is found
  if (!product) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "No data found.",
      data: [],
    });
  }

  // Step 4: Send the response
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products by IDs retrieved successfully",
    data: product,
  });
});

export const findProductsByBrandId = catchAsync(async (req, res) => {
  const brandId = req.query.brand_id as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await ProductServices.findProductsByBrandIdServices(brandId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products based on brand id fetched successfully",
    data: result.products,
    totalData: result.total,
    pagination: result.pagination,
  });
});

const statusBulkUpdate: RequestHandler = async (req, res, next) => {
  try {
    const {
      productIds,
      product_status,
      product_inactivity_start,
      product_inactivity_end,
    } = req.body;

    const result = await ProductServices.statusBulkUpdateService({
      productIds,
      product_status,
      product_inactivity_start,
      product_inactivity_end,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product Status bulk updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const pharmacySectionsShowBulkUpdate: RequestHandler = async (req, res, next) => {
  try {
    const updates = req.body; // Expecting [{ productId, sections }]
    const result = await pharmacySectionsShowBulkUpdateService(updates);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'pharmacy sections show updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPharmacySectionsForWebsiteShow: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPharmacySectionsForWebsiteShowService();
    res.status(200).json({
      success: true,
      message: "Pharmacy sections fetched successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getSkincareSectionsForWebsiteShow: RequestHandler = async (req, res, next) => {
  try {
    const data = await getSkincareSectionsForWebsiteShowService();
    res.status(200).json({
      success: true,
      message: "Skincare sections fetched successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getFashionSectionsForWebsiteShow: RequestHandler = async (req, res, next) => {
  try {
    const data = await getFashionSectionsForWebsiteShowService();
    res.status(200).json({
      success: true,
      message: "Fashion sections fetched successfully",
      data
    });
  } catch (error) {
    next(error);
  }
};


export const fashionSectionsShowBulkUpdate: RequestHandler = async (req, res, next) => {
  try {
    const updates = req.body; // Expecting [{ productId, sections }]
    const result = await fashionSectionsShowBulkUpdateService(updates);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'fashion sections show updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const skincareSectionsShowBulkUpdate: RequestHandler = async (req, res, next) => {
  try {
    const updates = req.body; // Expecting [{ productId, sections }]
    const result = await skincareSectionsShowBulkUpdateService(updates);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'skincare sections show updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// update product data
const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    if (req.files || req.body) {
      const requestData = req.body;
      console.log(requestData);

      // let barcode: any;
      // if (requestData.is_variation == "false") {
      //   if (requestData.barcode) {
      //     const varCodeCheck = await ProductModel.findOne({
      //       barcode: requestData.barcode,
      //     });
      //     if (
      //       varCodeCheck &&
      //       varCodeCheck?._id.toString() !== requestData?._id
      //     ) {
      //       deleteAllFilesInDirectory(uploadDir);
      //       throw new AppError(
      //         httpStatus.BAD_REQUEST,
      //         "Barcode already exists"
      //       );
      //     }
      //   }
      // }

      // if (requestData.is_variation == "true" && requestData.variation_details) {
      //   // const variationDetails = JSON.parse(requestData.variation_details);
      //   for (const variation of requestData.variation_details) {
      //     const { variation_barcode } = variation;

      //     if (
      //       variation_barcode != null &&
      //       variation_barcode != "" &&
      //       variation_barcode != undefined &&
      //       variation_barcode != "null" &&
      //       variation_barcode != "undefined"
      //     ) {
      //       const varCodeCheck = await VariationModel.findOne({
      //         variation_barcode: variation_barcode,
      //       });

      //       if (
      //         varCodeCheck &&
      //         variation?._id !== varCodeCheck?._id.toString()
      //       ) {
      //         deleteAllFilesInDirectory(uploadDir);
      //         throw new AppError(
      //           httpStatus.BAD_REQUEST,
      //           `Barcode "${variation_barcode}" already exists`
      //         );
      //       }
      //     }
      //   }
      // }

      const files = req.files as Express.Multer.File[];

      // Array to store thumbnail_image data
      let thumbnail_image;
      let thumbnail_image_key;

      // Handle main image
      const thumbnailImage = files?.find(
        (file) => file.fieldname === "thumbnail_image"
      );
      if (thumbnailImage) {
        const thumbnail_image_upload = await FileUploadHelper.uploadToSpaces(
          thumbnailImage
        );
        thumbnail_image = thumbnail_image_upload?.Location;
        thumbnail_image_key = thumbnail_image_upload?.Key;

        if (requestData?.thumbnail_image_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.thumbnail_image_key
          );
        }

      } else {
        thumbnail_image = requestData?.thumbnail_image;
        thumbnail_image_key = requestData?.thumbnail_image_key;
      }

      // Array to store additional_images URLs and keys
      const additional_images = [];

      // Handle additional_images
      const additionalImageFiles = files?.filter((file) =>
        file.fieldname.startsWith("additional_images")
      );
      for (const file of additionalImageFiles) {
        const imageUpload = await FileUploadHelper.uploadToSpaces(file);
        additional_images.push({
          additional_image: imageUpload.Location,
          additional_image_key: imageUpload.Key,
        });
      }

      if (requestData?.additional_default_images) {
        // Assuming requestData?.additional_default_images is defined as shown
        const additionalImages = requestData?.additional_default_images;

        // Combine `additional_image` and `additional_image_key` into objects, filtering out `undefined` values
        const formattedImages = additionalImages.additional_image
          .map((image: any, index: any) => {
            const key = additionalImages.additional_image_key[index];
            // Skip if either `image` or `key` is `undefined`
            if (image === "undefined" || key === "undefined") return null;

            return { additional_image: image, additional_image_key: key };
          })
          .filter(Boolean); // Remove any null values from the array
        additional_images.push(...formattedImages);
      }

      // Generate a unique slug for the product
      // const product_slug = await generateUniqueSlug(requestData.product_name);
      // requestData.product_slug = product_slug;
      requestData.is_variation = requestData.is_variation;

      // Create product object
      const productData: any = {
        // product_article_number: requestData?.product_article_number,
        product_name: requestData.product_name,
        product_slug: requestData.product_slug,
        product_sku: requestData.product_sku,
        product_status: requestData.product_status as
          | "active"
          | "in-active"
          | "temporary-in-active",
        product_inactivity_start: requestData?.product_inactivity_start,
        product_inactivity_end: requestData?.product_inactivity_end,
        category_id: requestData.category_id,
        subcategory_id: requestData.subcategory_id
          ? requestData.subcategory_id
          : undefined,
        childcategory_id: requestData.childcategory_id
          ? requestData.childcategory_id
          : undefined,
        brand_id: requestData.brand_id ? requestData.brand_id : null,
        // specifications:
        //   requestData.specifications?.map(
        //     (spec: { specification_id: any; specification_values: any }) => ({
        //       specification_id: spec.specification_id,
        //       specification_values:
        //         spec.specification_values?.map(
        //           (value: { specification_value_id: any }) => ({
        //             specification_value_id: value.specification_value_id
        //               ? value.specification_value_id
        //               : undefined,
        //           })
        //         ) ?? [],
        //     })
        //   ) ?? [],
        description: requestData.description ?? "",
        thumbnail_image: thumbnail_image as string,
        thumbnail_image_key: thumbnail_image_key,
        additional_images: additional_images ?? [],
        product_price:
          requestData.product_price && parseFloat(requestData.product_price),
        product_buying_price:
          requestData.product_buying_price &&
          parseFloat(requestData.product_buying_price),

        // product_discount_price:
        // requestData.product_discount_price ?
        // parseFloat(requestData.product_discount_price) : undefined,

        // product_quantity: requestData.product_quantity
        // ? parseInt(requestData.product_quantity)
        // : undefined,

        product_discount_price:
          requestData.product_discount_price === "" ||
            requestData.product_discount_price === undefined
            ? null
            : parseFloat(requestData.product_discount_price),

        product_quantity:
          requestData.product_quantity === "" ||
            requestData.product_quantity === undefined
            ? null
            : parseInt(requestData.product_quantity),

        product_alert_quantity:
          requestData.product_alert_quantity &&
          parseInt(requestData.product_alert_quantity),
        is_variation: requestData.is_variation === "true",
        product_warrenty: requestData.product_warrenty ?? "",
        product_return: requestData.product_return ?? "",
        unit: requestData.unit ?? "",
        unit_quantity:
          requestData?.unit_quantity && parseInt(requestData?.unit_quantity),
        meta_title: requestData.meta_title ?? "",
        meta_description: requestData.meta_description ?? "",
        meta_keywords:
          typeof requestData.meta_keywords === "string"
            ? JSON.parse(requestData.meta_keywords)
            : requestData.meta_keywords || [],
        product_updated_by: requestData.product_updated_by,
        product_supplier_id: requestData.product_supplier_id,
        _id: requestData?._id,
        product_barcode: requestData?.product_barcode
          ? requestData?.product_barcode
          : "",


        offered_product_show: requestData.offered_product_show,

        video_url: requestData?.video_url ? requestData?.video_url : "",
        // is_flat_discount_show: requestData?.is_flat_discount_show ? requestData?.is_flat_discount_show : false,
        // is_percent_discount_show: requestData?.is_percent_discount_show ? requestData?.is_percent_discount_show : false,
        discount_show: requestData?.discount_show
          ? requestData?.discount_show
          : "",
      };
      console.log("Product Data >>>", productData);
      // console.log(JSON.stringify(productData, null, 2));
      // console.log(JSON.stringify(requestData, null, 2));

      // Save product in the database
      const newProduct: any = await ProductServices.updateProductServices(
        requestData?._id,
        productData
      );

      if (newProduct) {
        // if (
        //   requestData.is_variation == "true" &&
        //   requestData?.againAddNewVariation == "false"
        // ) {
        //   const variation_details = req.body.variation_details;
        //   const updatedVariation_details = [];
        //   for (let index = 0; index < variation_details.length; index++) {
        //     let product = variation_details[index];
        //     product.product_id = requestData?._id;
        //     const matchingFiles = files.filter(
        //       (file) =>
        //         file.fieldname ===
        //         `variation_details[${index}][variation_image]`
        //     );

        //     //barcode generation if variations are true (no need during updating product)

        //     // let v_barcode: any;
        //     // v_barcode = await generateQRCode();
        //     // product.variation_barcode =
        //     //   product.variation_barcode != "undefined" &&
        //     //     product.variation_barcode != "null" &&
        //     //     product.variation_barcode != null &&
        //     //     product.variation_barcode != undefined &&
        //     //     product.variation_barcode != ""
        //     //     ? product.variation_barcode
        //     //     : v_barcode;
        //     // product.variation_barcode_image = await QRCode.toDataURL(
        //     //   product.variation_barcode
        //     // );

        //     for (const file of matchingFiles) {
        //       const imageUpload = await FileUploadHelper.uploadToSpaces(file);
        //       product.variation_image = imageUpload.Location;
        //       product.variation_image_key = imageUpload.Key;
        //     }

        //     updatedVariation_details.push(product);
        //   }

        //   const successVariationUpload: any = [];
        //   // Loop through each state in the array
        //   for (const variationDetails of updatedVariation_details) {
        //     // Call the service to save the state with merged data
        //     const result: IVariationInterface | {} | any =
        //       await VariationModel.updateOne(
        //         { _id: variationDetails._id },
        //         variationDetails,
        //         { runValidators: true }
        //       );
        //     if (result) {
        //       successVariationUpload.push(result);
        //     }
        //   }
        //   if (successVariationUpload.length > 0) {
        //     return sendResponse(res, {
        //       statusCode: 200,
        //       success: true,
        //       message: "Product updated successfully!",
        //     });
        //   }
        // }

        return sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Product updated successfully!",
        });
      }
    } else {
      throw new AppError(400, "Image Upload Failed");
    }
  } catch (error) {
    next(error);
  }
};

// delete A Product item
const deleteProduct: RequestHandler = async (req, res, next) => {
  try {
    const _id = req.body?._id;
    const thumbnail_image_key = req.body?.thumbnail_image_key;
    const additional_images = req.body?.additional_images;
    const variations = req.body?.variations;
    console.log(_id);
    // const findProductInOrderExist: boolean | null | undefined | any =
    //   await OrderProductModel.exists({
    //     product_id: _id,
    //   });
    // if (findProductInOrderExist) {
    //   throw new AppError(400, "Already Added In Order !");
    // }
    // const findProductInOfferOrderExist: boolean | null | undefined | any =
    //   await OfferOrderModel.exists({
    //     "offer_products.offer_product_id": _id,
    //   });
    // if (findProductInOfferOrderExist) {
    //   throw new AppError(400, "Already Added In Offer Order !");
    // }
    // const findProductInOfferExist: boolean | null | undefined | any =
    //   await OfferModel.exists({
    //     "offer_products.offer_product_id": _id,
    //   });
    // if (findProductInOfferExist) {
    //   throw new AppError(400, "Already Added In Offer !");
    // }
    const result = await ProductServices.deleteProductServices(
      _id,
      thumbnail_image_key,
      additional_images,
      variations
    );
    if (result?.deletedCount > 0) {
      //Delete image using the thumbnail_image_key
      if (thumbnail_image_key) {
        await FileUploadHelper.deleteFromSpaces(thumbnail_image_key);
      }

      // Check if additional_images exists and is an array
      if (additional_images && Array.isArray(additional_images)) {
        for (const image of additional_images) {
          // Delete image using the additional_image_key
          if (image.additional_image_key) {
            await FileUploadHelper.deleteFromSpaces(image.additional_image_key);
          }
        }
      }

      //const variations = await VariationModel.find({ product_id: _id });
      // console.log(variations); // View existing variations before deleting

      // if (variations && Array.isArray(variations)) {

      //   for (const image of variations) {
      //     // Delete image using the additional_image_key
      //     if (image.variation_image_key) {
      //       await FileUploadHelper.deleteFromSpaces(image.variation_image_key);
      //     }
      //   }

      //   await VariationModel.deleteMany({ product_id: _id });
      // }

      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product Deleted successfully !",
      });
    } else {
      throw new AppError(400, "Product delete failed !");
    }
  } catch (error) {
    next(error);
  }
};

export const getCommonCategoryData = catchAsync(async (req, res) => {
  const { category_slug } = req.params;

  // console.log(category_slug);
  

  const result = await getCommonCategoryDataService(category_slug as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Common category data retrieved successfully",
    data: result
  });
});

export const ProductControllers = {
  postProduct,
  findAllDashboardProduct,
  findDashboardAvailableProductsForHotDeals,
  findDashboardAvailableProductsForCouponNotApplied,
  findAllProduct,
  findRelatedProducts,
  findPopularProduct,
  findHotDealsProduct,
  findNewUploadedProduct,
  updateProduct,
  deleteProduct,
  findSingleDashboardProduct,
  findSingleProduct,
  findProductsByIds,
  findProductsByBrandId,
  findOfferedProduct,
  findSearchProduct,
  statusBulkUpdate,
};
