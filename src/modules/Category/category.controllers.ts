import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  categorySearchableField,
  ICategoryInterface,
} from "./category.interface";
import {
  deleteCategoryServices,
  findAllCategoryServices,
  findAllDashboardCategoryServices,
  findGroceryCategoryBannerAndReelsServices,
  postCategoryServices,
  updateCategoryServices,
} from "./category.services";
import * as fs from "fs";
import CategoryModel from "./category.model";
import httpStatus from 'http-status'
import slugify from "slugify";
import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import sendResponse from "../../utils/sendResponse";
import SubcategoryModel from "../Subcategory/subcategory.model";
import ChildcategoryModel from "../Childcategory/childcategory.model";


// Add A Category
export const postCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ICategoryInterface | any> => {
  if (!req.files || !("category_logo" in req.files)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Logo are required',
    });
  }
  try {
    // if (req.files && "category_logo" in req.files && "category_banner" in req.files && req.body) {
    const requestData = req.body;
    let category_slug = slugify(requestData?.category_name);

    const findCategoryNameExit: boolean | null | undefined | any =
      await CategoryModel.exists({
        category_slug,
      });
    if (findCategoryNameExit) {
      fs.unlinkSync(req.files.category_logo[0].path);
      throw new AppError(400, "This category is already exists!");
    }

    // Get the highest category_serial
    const lastCategory = await CategoryModel.findOne().sort({ category_serial: -1 });
    // Determine the new category_serial
    const newCategorySerial = lastCategory ? lastCategory.category_serial + 1 : 1;

    // get the category image and upload
    let category_logo;
    let category_logo_key;
    if (req.files && "category_logo" in req.files) {
      const categoryImage = req.files["category_logo"][0];
      const category_logo_upload = await FileUploadHelper.uploadToSpaces(
        categoryImage
      );
      category_logo = category_logo_upload?.Location;
      category_logo_key = category_logo_upload?.Key;
    }

    // Upload banners (optional)
    let category_banner: string[] = [];
    let category_banner_key: string[] = [];

    if ("category_banner" in req.files) {
      const categoryBanner = req.files["category_banner"];
      for (const file of categoryBanner) {
        const upload = await FileUploadHelper.uploadToSpaces(file);
        category_banner.push(upload?.Location);
        category_banner_key.push(upload?.Key);
      }
    }

    const data = {
      ...requestData,
      category_logo,
      category_logo_key,
      category_banner,
      category_banner_key,
      category_slug,
      category_serial: newCategorySerial
    };

    const result: ICategoryInterface | {} = await postCategoryServices(data);

    if (result) {
      return sendResponse<ICategoryInterface>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category Added Successfully !",
      });
    } else {
      throw new AppError(400, "Category Added Failed !");
    }
    // } else {
    //   throw new AppError(400, "Image Upload Failed");
    // }
  } catch (error: any) {
    next(error);
  }
};

// Find All Category
export const findAllCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ICategoryInterface | any> => {
  try {
    const { searchTerm, ...filterData } = req.query;
    const result: ICategoryInterface[] | any = await findAllCategoryServices(searchTerm);
    return sendResponse<ICategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All dashboard Category
export const findAllDashboardCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ICategoryInterface | any> => {
  try {
    const { page, limit, searchTerm } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result: ICategoryInterface[] | any =
      await findAllDashboardCategoryServices(limitNumber, skip, searchTerm);
    const andCondition = [];
    if (searchTerm) {
      andCondition.push({
        $or: categorySearchableField.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: "i",
          },
        })),
      });
    }
    const whereCondition =
      andCondition.length > 0 ? { $and: andCondition } : {};
    const total = await CategoryModel.countDocuments(whereCondition);
    return sendResponse<ICategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category Found Successfully !",
      data: result,
      totalData: total,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All Grocery Category Banner And Reels
export const findGroceryCategoryBannerAndReels: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ICategoryInterface | any> => {
  try {
    const result: ICategoryInterface[] | any = await findGroceryCategoryBannerAndReelsServices();
    return sendResponse<ICategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Grocery Category Banner And Reels Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find Nested category 
export const findNestedCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ICategoryInterface | any> => {
  try {
    const categories = await CategoryModel.find({ category_status: 'active' })
      .sort({ category_serial: 1 })
      .lean();

    const subcategories = await SubcategoryModel.find({ subcategory_status: 'active' })
      .sort({ subcategory_serial: 1 })
      .lean();

    const childcategories = await ChildcategoryModel.find({ childcategory_status: 'active' })
      .sort({ childcategory_serial: 1 })
      .lean();

    // Build nested structure
    const nested = categories.map(category => {
      const catSubs = subcategories.filter(sub => sub.category_id.equals(category._id));
      const subsWithChildren = catSubs.map(sub => {
        const subChildren = childcategories.filter(child =>
          child.subcategory_id.equals(sub._id)
        );

        // Always add "Others" as default
        const childrensWithOthers = [
          ...subChildren,
          {
            childcategory_name: "Others",
            childcategory_slug: "Others",
          },
        ];

        return { ...sub, /*childrens: subChildren*/ childrens: childrensWithOthers };
      });
      return { ...category, subcategories: subsWithChildren };
    });
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Nested category Found Successfully !",
      data: nested,
    });
  } catch (error: any) {
    next(error);
  }
};


// Update A Category
export const updateCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ICategoryInterface | any> => {
  try {
    if (req.files && ("category_logo" in req.files || "category_banner" in req.files) && req.body) {
      const requestData = req.body;
      console.log("requestData", requestData);
      console.log("req.files", req.files);


      let category_slug = slugify(requestData?.category_name);
      const findCategoryNameExit: boolean | null | undefined | any =
        await CategoryModel.exists({
          category_slug,
        });
      if (
        findCategoryNameExit &&
        requestData?._id !== findCategoryNameExit?._id.toString()
      ) {
        // fs.unlinkSync(req.files.category_logo[0].path);
        throw new AppError(400, "This category is already exists!");
      }
      // const findCategorySerialExit: boolean | null | undefined | any =
      //   await CategoryModel.exists({
      //     category_serial: requestData?.category_serial,
      //   });
      // if (
      //   findCategorySerialExit &&
      //   requestData?._id !== findCategorySerialExit?._id.toString()
      // ) {
      //   fs.unlinkSync(req.files.category_logo[0].path);
      //   throw new AppError(400, "Serial Number Previously Added !");
      // }


      // Find the category that currently has the given newSerial
      const existingCategory = await CategoryModel.findOne({ category_serial: requestData?.category_serial });

      //console.log("hello",existingCategory);


      // Find the category that is being updated
      const categoryToUpdate = await CategoryModel.findById(requestData?._id);

      //console.log(categoryToUpdate);


      if (!categoryToUpdate) {
        throw new Error("Category to update not found.");
      }

      if (existingCategory) {
        // Swap serials if another category already has the newSerial
        await CategoryModel.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
      }

      // Update the requested category with the new serial
      await CategoryModel.findByIdAndUpdate(requestData?._id, { category_serial: requestData?.category_serial });

      // get the category image and upload
      let category_logo;
      let category_logo_key;
      if (req.files && "category_logo" in req.files) {
        const categoryImage = req.files["category_logo"][0];
        const category_logo_upload = await FileUploadHelper.uploadToSpaces(
          categoryImage
        );
        category_logo = category_logo_upload?.Location;
        category_logo_key = category_logo_upload?.Key;

        fs.existsSync(categoryImage.path) && fs.unlinkSync(categoryImage.path);

        // Delete old logo if key exists
        if (requestData?.category_logo_key) {
          await FileUploadHelper.deleteFromSpaces(requestData.category_logo_key);
        }
      }

      // Handle banner uploads
      // let category_banner = categoryToUpdate.category_banner || [];
      // let category_banner_key = categoryToUpdate.category_banner_key || [];

      // if ("category_banner" in req.files) {
      //   const bannerFiles = req.files["category_banner"];
      //   const bannerExistingFiles = categoryToUpdate.category_banner || [];
      //   const bannerExistingKeys = categoryToUpdate.category_banner_key || [];
      //   console.log(bannerExistingFiles, "bannerExistingFiles");

      //   const newBannerUrls: string[] = [...bannerExistingFiles];
      //   const newBannerKeys: string[] = [...bannerExistingKeys];

      //   for (const file of bannerFiles) {
      //     const upload = await FileUploadHelper.uploadToSpaces(file);
      //     newBannerUrls.push(upload?.Location);
      //     newBannerKeys.push(upload?.Key);
      //   }

      //   // Optional: Delete old banners if replacing
      //   if (Array.isArray(requestData?.category_banner_key)) {
      //     for (const oldKey of requestData.category_banner_key) {
      //       await FileUploadHelper.deleteFromSpaces(oldKey);
      //     }
      //   }

      //   category_banner = newBannerUrls;
      //   category_banner_key = newBannerKeys;
      // }

      // Handle banner uploads - MODIFIED SECTION
      let category_banner = [];
      let category_banner_key = [];

      // Process existing banners
      if (req.body.category_banner) {
        // Ensure we always work with an array
        const existingBanners = Array.isArray(req.body.category_banner)
          ? req.body.category_banner
          : [req.body.category_banner];

        category_banner = existingBanners.filter((b: string[]) => typeof b === 'string');

        // Process keys - ensure we have an array
        const existingKeys = Array.isArray(req.body.category_banner_key)
          ? req.body.category_banner_key
          : req.body.category_banner_key ? [req.body.category_banner_key] : [];

        // Match keys with banners
        category_banner_key = existingKeys.slice(0, category_banner.length);
      }

      // Process new banner files
      if (req.files?.category_banner) {
        const bannerFiles = Array.isArray(req.files["category_banner"])
          ? req.files["category_banner"]
          : [req.files["category_banner"]];

        for (const file of bannerFiles) {
          const upload = await FileUploadHelper.uploadToSpaces(file);
          category_banner.push(upload?.Location);
          category_banner_key.push(upload?.Key);
          fs.existsSync(file.path) && fs.unlinkSync(file.path);
        }
      }

      const data = {
        ...requestData, category_logo, category_logo_key, category_banner,
        category_banner_key, category_slug
      };
      const result: ICategoryInterface | any = await updateCategoryServices(
        data,
        requestData?._id
      );
      if (result?.modifiedCount > 0) {
        if (requestData?.category_logo_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.category_logo_key
          );
        }
        return sendResponse<ICategoryInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Category Update Successfully !",
        });
      } else {
        throw new AppError(400, "Category Update Failed !");
      }
    } else {
      const requestData = req.body;
      const category_banner: string[] = requestData?.category_banner ? requestData?.category_banner : []; //if no file but still banner image then add or []
      const category_banner_key: string[] = requestData?.category_banner_key ? requestData?.category_banner_key : [];
      // console.log("requestData from cat controller without file", requestData);

      let category_slug = slugify(requestData?.category_name);
      const findCategoryNameExit: boolean | null | undefined | any =
        await CategoryModel.exists({
          category_slug,
        });
      if (
        findCategoryNameExit &&
        requestData?._id !== findCategoryNameExit?._id.toString()
      ) {
        throw new AppError(400, "This category is already exists!");
      }
      // const findCategorySerialExit: boolean | null | undefined | any =
      //   await CategoryModel.exists({
      //     category_serial: requestData?.category_serial,
      //   });
      // if (
      //   findCategorySerialExit &&
      //   requestData?._id !== findCategorySerialExit?._id.toString()
      // ) {
      //   throw new AppError(400, "Serial Number Previously Added !");
      // }

      // Find the category that currently has the given newSerial
      const existingCategory = await CategoryModel.findOne({ category_serial: requestData?.category_serial });


      // Find the category that is being updated
      const categoryToUpdate = await CategoryModel.findById(requestData?._id);


      if (!categoryToUpdate) {
        throw new Error("Category to update not found.");
      }

      if (existingCategory) {
        // Swap serials if another category already has the newSerial
        await CategoryModel.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
      }

      // Update the requested category with the new serial
      await CategoryModel.findByIdAndUpdate(requestData?._id, { category_serial: requestData?.category_serial });

      const data = { ...requestData, category_banner, category_banner_key, category_slug };
      const result: ICategoryInterface | any = await updateCategoryServices(
        data,
        requestData?._id
      );
      if (result?.modifiedCount > 0) {
        return sendResponse<ICategoryInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Category Update Successfully !",
        });
      } else {
        throw new AppError(400, "Category Update Failed !");
      }
    }
  } catch (error: any) {
    next(error);
  }
};


// export const updateCategory: RequestHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<ICategoryInterface | any> => {
//   try {
//     if (req.files && ("category_logo" in req.files || "category_banner" in req.files) && req.body) {
//       const requestData = req.body;
//       console.log("requestData", requestData);
//       console.log("req.files", req.files);


//       let category_slug = slugify(requestData?.category_name);
//       const findCategoryNameExit: boolean | null | undefined | any =
//         await CategoryModel.exists({
//           category_slug,
//         });
//       if (
//         findCategoryNameExit &&
//         requestData?._id !== findCategoryNameExit?._id.toString()
//       ) {
//         // fs.unlinkSync(req.files.category_logo[0].path);
//         throw new AppError(400, "This category is already exists!");
//       }
//       // const findCategorySerialExit: boolean | null | undefined | any =
//       //   await CategoryModel.exists({
//       //     category_serial: requestData?.category_serial,
//       //   });
//       // if (
//       //   findCategorySerialExit &&
//       //   requestData?._id !== findCategorySerialExit?._id.toString()
//       // ) {
//       //   fs.unlinkSync(req.files.category_logo[0].path);
//       //   throw new AppError(400, "Serial Number Previously Added !");
//       // }


//       // Find the category that currently has the given newSerial
//       const existingCategory = await CategoryModel.findOne({ category_serial: requestData?.category_serial });

//       //console.log("hello",existingCategory);


//       // Find the category that is being updated
//       const categoryToUpdate = await CategoryModel.findById(requestData?._id);

//       //console.log(categoryToUpdate);


//       if (!categoryToUpdate) {
//         throw new Error("Category to update not found.");
//       }

//       if (existingCategory) {
//         // Swap serials if another category already has the newSerial
//         await CategoryModel.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
//       }

//       // Update the requested category with the new serial
//       await CategoryModel.findByIdAndUpdate(requestData?._id, { category_serial: requestData?.category_serial });

//       // get the category image and upload
//       let category_logo;
//       let category_logo_key;
//       if (req.files && "category_logo" in req.files) {
//         const categoryImage = req.files["category_logo"][0];
//         const category_logo_upload = await FileUploadHelper.uploadToSpaces(
//           categoryImage
//         );
//         category_logo = category_logo_upload?.Location;
//         category_logo_key = category_logo_upload?.Key;

//         // fs.unlinkSync(categoryImage.path);

//         // Delete old logo if key exists
//         if (requestData?.category_logo_key) {
//           await FileUploadHelper.deleteFromSpaces(requestData.category_logo_key);
//         }
//       }

//       // Handle banner uploads
//       let category_banner = categoryToUpdate.category_banner || [];
//       // let category_banner_key = categoryToUpdate.category_banner_key || [];

//       if ("category_banner" in req.files) {
//         const bannerFiles = req.files["category_banner"];
//         const bannerExistingFiles = categoryToUpdate.category_banner || [];
//         // const bannerExistingKeys = categoryToUpdate.category_banner_key || [];
//         console.log(bannerExistingFiles, "bannerExistingFiles");

//         const newBannerUrls: string[] = [...bannerExistingFiles];
//         // const newBannerKeys: string[] = [...bannerExistingKeys];

//         for (const file of bannerFiles) {
//           const upload = await FileUploadHelper.uploadToSpaces(file);
//           newBannerUrls.push(upload?.Location);
//           // newBannerKeys.push(upload?.Key);
//         }

//         // Optional: Delete old banners if replacing
//         if (Array.isArray(requestData?.category_banner_key)) {
//           for (const oldKey of requestData.category_banner_key) {
//             await FileUploadHelper.deleteFromSpaces(oldKey);
//           }
//         }

//         category_banner = newBannerUrls;
//         // category_banner_key = newBannerKeys;
//       }
//       const data = {
//         ...requestData, category_logo, category_logo_key, category_banner,
//          category_slug
//       };
//       const result: ICategoryInterface | any = await updateCategoryServices(
//         data,
//         requestData?._id
//       );
//       if (result?.modifiedCount > 0) {
//         if (requestData?.category_logo_key) {
//           await FileUploadHelper.deleteFromSpaces(
//             requestData?.category_logo_key
//           );
//         }
//         return sendResponse<ICategoryInterface>(res, {
//           statusCode: httpStatus.OK,
//           success: true,
//           message: "Category Update Successfully !",
//         });
//       } else {
//         throw new AppError(400, "Category Update Failed !");
//       }
//     } else {
//       const requestData = req.body;
//       console.log("requestData from cat controller without file", requestData);

//       let category_slug = slugify(requestData?.category_name);
//       const findCategoryNameExit: boolean | null | undefined | any =
//         await CategoryModel.exists({
//           category_slug,
//         });
//       if (
//         findCategoryNameExit &&
//         requestData?._id !== findCategoryNameExit?._id.toString()
//       ) {
//         throw new AppError(400, "This category is already exists!");
//       }
//       // const findCategorySerialExit: boolean | null | undefined | any =
//       //   await CategoryModel.exists({
//       //     category_serial: requestData?.category_serial,
//       //   });
//       // if (
//       //   findCategorySerialExit &&
//       //   requestData?._id !== findCategorySerialExit?._id.toString()
//       // ) {
//       //   throw new AppError(400, "Serial Number Previously Added !");
//       // }

//       // Find the category that currently has the given newSerial
//       const existingCategory = await CategoryModel.findOne({ category_serial: requestData?.category_serial });


//       // Find the category that is being updated
//       const categoryToUpdate = await CategoryModel.findById(requestData?._id);


//       if (!categoryToUpdate) {
//         throw new Error("Category to update not found.");
//       }

//       if (existingCategory) {
//         // Swap serials if another category already has the newSerial
//         await CategoryModel.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
//       }

//       // Update the requested category with the new serial
//       await CategoryModel.findByIdAndUpdate(requestData?._id, { category_serial: requestData?.category_serial });

//       const data = { ...requestData, category_slug };
//       const result: ICategoryInterface | any = await updateCategoryServices(
//         data,
//         requestData?._id
//       );
//       if (result?.modifiedCount > 0) {
//         return sendResponse<ICategoryInterface>(res, {
//           statusCode: httpStatus.OK,
//           success: true,
//           message: "Category Update Successfully !",
//         });
//       } else {
//         throw new AppError(400, "Category Update Failed !");
//       }
//     }
//   } catch (error: any) {
//     next(error);
//   }
// };

// delete A Category item


export const deleteACategoryInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category_id = req.body._id;

    // const findCategoryInChildCategoryExist: boolean | null | undefined | any =
    //   await ChildCategoryModel.exists({
    //     category_id: category_id,
    //   });
    // if (findCategoryInChildCategoryExist) {
    //   throw new AppError(400, "Already Added In ChildCategory !");
    // }
    const result = await deleteCategoryServices(category_id);
    if (result?.deletedCount > 0) {
      if (req.body?.category_logo_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.category_logo_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category Delete successfully !",
      });
    } else {
      throw new AppError(400, "Category delete failed !");
    }
  } catch (error) {
    next(error);
  }
};


// //get single category item
// export const getSingleCategory = catchAsync(async (req, res) => {
//   const { _id } = req.body;
//   const result = await getSingleCategoryServices(_id);
//   //console.log(result);

//   sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: 'Category retrieved successfully',
//       data: result,
//   });

// });
