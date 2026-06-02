import { NextFunction, Request, RequestHandler, Response } from "express";
import * as fs from "fs";
import httpStatus from 'http-status'
import slugify from "slugify";

import { ISubcategoryInterface, subcategorySearchableField } from "./subcategory.interface";
import SubcategoryModel from "./subcategory.model";
import { deleteSubcategoryServices, findAllDashboardSubcategoryServices, findAllFashionSubcategoryServices, findAllGrocerySubcategoryServices, findAllPharmacySubcategoryServices, findAllSkincareSubcategoryServices, findAllSubcategoryServices, postSubcategoryServices, updateSubcategoryServices } from "./subcategory.services";
import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import sendResponse from "../../utils/sendResponse";
import CategoryModel from "../Category/category.model";

// Add A Sub category
export const postSubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  if (!req.files || !("subcategory_logo" in req.files)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Logo are required',
    });
  }
  try {
    // if (req.files && "subcategory_logo" in req.files && req.body) {
    const requestData = req.body;
    let subcategory_slug = slugify(requestData?.subcategory_name);

    const findSubcategoryNameExit: boolean | null | undefined | any =
      await SubcategoryModel.exists({
        subcategory_slug,
      });
    if (findSubcategoryNameExit) {
      fs.unlinkSync(req.files.subcategory_logo[0].path);
      throw new AppError(400, "This subcategory is already exists!");
    }

    // Get the highest category_serial
    const lastSubcategory = await SubcategoryModel.findOne({ category_id: requestData?.category_id }).sort({ subcategory_serial: -1 });

    // Determine the new category_serial
    const newSubcategorySerial = lastSubcategory ? lastSubcategory.subcategory_serial + 1 : 1;

    // get the subcategory image and upload
    let subcategory_logo;
    let subcategory_logo_key;
    if (req.files && "subcategory_logo" in req.files) {
      const subcategoryImage = req.files["subcategory_logo"][0];
      const subcategory_logo_upload = await FileUploadHelper.uploadToSpaces(
        subcategoryImage
      );
      subcategory_logo = subcategory_logo_upload?.Location;
      subcategory_logo_key = subcategory_logo_upload?.Key;
    }

    // Upload banners (optional)
    let subcategory_banner: string[] = [];
    let subcategory_banner_key: string[] = [];

    if ("subcategory_banner" in req.files) {
      const subcategoryBanner = req.files["subcategory_banner"];
      for (const file of subcategoryBanner) {
        const upload = await FileUploadHelper.uploadToSpaces(file);
        subcategory_banner.push(upload?.Location);
        subcategory_banner_key.push(upload?.Key);
      }
    }
    const data = {
      ...requestData,
      subcategory_logo,
      subcategory_logo_key,
      subcategory_banner,
      subcategory_banner_key,
      subcategory_slug,
      subcategory_serial: newSubcategorySerial
    };
    const result: ISubcategoryInterface | {} = await postSubcategoryServices(data);

    if (result) {
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Sub Category Added Successfully !",
        data: result
      });
    } else {
      throw new AppError(400, "Sub Category Added Failed !");
    }
    // } else {
    //   throw new AppError(400, "Image Upload Failed");
    // }
  } catch (error: any) {
    next(error);
  }
};

// Find All Subategory
export const findAllSubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    const { searchTerm, ...filterData } = req.query;
    const result: ISubcategoryInterface[] | any = await findAllSubcategoryServices(searchTerm);
    return sendResponse<ISubcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sub Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All Grocery Sub category
export const findAllGrocerySubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    // const { searchTerm, ...filterData } = req.query;
    const result: ISubcategoryInterface[] | any = await findAllGrocerySubcategoryServices(/*searchTerm*/);
    return sendResponse<ISubcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Grocery Sub Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All Pharmacy Sub category
export const findAllPharmacySubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    // const { searchTerm, ...filterData } = req.query;
    const result: ISubcategoryInterface[] | any = await findAllPharmacySubcategoryServices(/*searchTerm*/);
    return sendResponse<ISubcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Pharmacy Sub Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All Skincare/cosmetics/beauty related Sub category
export const findAllSkincareSubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    // const { searchTerm, ...filterData } = req.query;
    const result: ISubcategoryInterface[] | any = await findAllSkincareSubcategoryServices(/*searchTerm*/);
    return sendResponse<ISubcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Skincare Sub Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All fashion related Sub category
export const findAllFashionSubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    // const { searchTerm, ...filterData } = req.query;
    const result: ISubcategoryInterface[] | any = await findAllFashionSubcategoryServices(/*searchTerm*/);
    return sendResponse<ISubcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fashion Sub Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All dashboard Sub category
export const findAllDashboardSubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    const { page, limit, searchTerm, category_id } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result: ISubcategoryInterface[] | any =
      await findAllDashboardSubcategoryServices(limitNumber, skip, searchTerm, category_id);
    const andCondition = [];
    if (searchTerm) {
      andCondition.push({
        $or: subcategorySearchableField.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: "i",
          },
        })),
      });
    }
    const whereCondition =
      andCondition.length > 0 ? { $and: andCondition } : {};
    const total = await SubcategoryModel.countDocuments(whereCondition);
    return sendResponse<ISubcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sub Category Found Successfully !",
      data: result,
      totalData: total,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update A Sub category
export const updateSubcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ISubcategoryInterface | any> => {
  try {
    if (req.files && ("subcategory_logo" in req.files || "subcategory_banner" in req.files) && req.body) {
      const requestData = req.body;
      let subcategory_slug = slugify(requestData?.subcategory_name);
      const findSubcategoryNameExit: boolean | null | undefined | any =
        await SubcategoryModel.exists({
          subcategory_slug,
        });
      if (
        findSubcategoryNameExit &&
        requestData?._id !== findSubcategoryNameExit?._id.toString()
      ) {
        // fs.unlinkSync(req.files.subcategory_logo[0].path);
        throw new AppError(400, "This subcategory is already exists!");
      }
      // const findCategorySerialExit: boolean | null | undefined | any =
      //   await SubcategoryModel.exists({
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
      const existingSubcategory = await SubcategoryModel.findOne({ category_id: requestData?.category_id, subcategory_serial: requestData?.subcategory_serial });

      //console.log("hello",existingSubcategory);


      // Find the category that is being updated
      const subcategoryToUpdate = await SubcategoryModel.findById(requestData?._id);

      //console.log(subcategoryToUpdate);


      if (!subcategoryToUpdate) {
        throw new Error("Sub Category to update not found.");
      }

      if (existingSubcategory) {
        // Swap serials if another category already has the newSerial
        await SubcategoryModel.findByIdAndUpdate(existingSubcategory._id, { subcategory_serial: subcategoryToUpdate.subcategory_serial });
      }

      // Update the requested category with the new serial
      await SubcategoryModel.findByIdAndUpdate(requestData?._id, { subcategory_serial: requestData?.subcategory_serial });

      // get the category image and upload
      let subcategory_logo;
      let subcategory_logo_key;
      if (req.files && "subcategory_logo" in req.files) {
        const subcategoryImage = req.files["subcategory_logo"][0];
        const subcategory_logo_upload = await FileUploadHelper.uploadToSpaces(
          subcategoryImage
        );
        subcategory_logo = subcategory_logo_upload?.Location;
        subcategory_logo_key = subcategory_logo_upload?.Key;

        fs.existsSync(subcategoryImage.path) && fs.unlinkSync(subcategoryImage.path);

        // Delete old logo if key exists
        if (requestData?.subcategory_logo_key) {
          await FileUploadHelper.deleteFromSpaces(requestData.subcategory_logo_key);
        }
      }

      // Handle banner uploads
      // let subcategory_banner = subcategoryToUpdate.subcategory_banner || [];
      // let subcategory_banner_key = subcategoryToUpdate.subcategory_banner_key || [];

      // if ("subcategory_banner" in req.files) {
      //   const bannerFiles = req.files["subcategory_banner"];
      //   const newBannerUrls: string[] = [];
      //   const newBannerKeys: string[] = [];

      //   for (const file of bannerFiles) {
      //     const upload = await FileUploadHelper.uploadToSpaces(file);
      //     newBannerUrls.push(upload?.Location);
      //     newBannerKeys.push(upload?.Key);


      //     // ✅ delete the local file after upload
      //     try {
      //       await fs.promises.unlink(file.path);
      //     } catch (err: any) {
      //       console.warn("Failed to delete local banner file:", file.path, err.message);
      //     }
      //   }


      //   // Optional: Delete old banners if replacing
      //   if (Array.isArray(requestData?.subcategory_banner_key)) {
      //     for (const oldKey of requestData.subcategory_banner_key) {
      //       await FileUploadHelper.deleteFromSpaces(oldKey);
      //     }
      //   }

      //   subcategory_banner = newBannerUrls;
      //   subcategory_banner_key = newBannerKeys;
      // }

      // Handle banner uploads - MODIFIED SECTION
      let subcategory_banner = [];
      let subcategory_banner_key = [];

      // Process existing banners
      if (req.body.subcategory_banner) {
        // Ensure we always work with an array
        const existingBanners = Array.isArray(req.body.subcategory_banner)
          ? req.body.subcategory_banner
          : [req.body.subcategory_banner];

        subcategory_banner = existingBanners.filter((b: string[]) => typeof b === 'string');

        // Process keys - ensure we have an array
        const existingKeys = Array.isArray(req.body.subcategory_banner_key)
          ? req.body.subcategory_banner_key
          : req.body.subcategory_banner_key ? [req.body.subcategory_banner_key] : [];

        // Match keys with banners
        subcategory_banner_key = existingKeys.slice(0, subcategory_banner.length);
      }

      // Process new banner files
      if (req.files?.subcategory_banner) {
        const bannerFiles = Array.isArray(req.files["subcategory_banner"])
          ? req.files["subcategory_banner"]
          : [req.files["subcategory_banner"]];

        for (const file of bannerFiles) {
          const upload = await FileUploadHelper.uploadToSpaces(file);
          subcategory_banner.push(upload?.Location);
          subcategory_banner_key.push(upload?.Key);
          fs.existsSync(file.path) && fs.unlinkSync(file.path);
        }
      }

      const data = {
        ...requestData,
        subcategory_logo,
        subcategory_logo_key,
        subcategory_banner,
        subcategory_banner_key,
        subcategory_slug
      };
      const result: ISubcategoryInterface | any = await updateSubcategoryServices(
        data,
        requestData?._id
      );
      if (result?.modifiedCount > 0) {
        if (requestData?.subcategory_logo_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.subcategory_logo_key
          );
        }
        return sendResponse<ISubcategoryInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Sub Category Update Successfully !",
        });
      } else {
        throw new AppError(400, "Sub Category Update Failed !");
      }
    } else {
      const requestData = req.body;
      const subcategory_banner: string[] = requestData?.subcategory_banner ? requestData?.subcategory_banner : []; //if no file but still banner image then add or []
      const subcategory_banner_key: string[] = requestData?.subcategory_banner_key ? requestData?.subcategory_banner_key : [];
      let subcategory_slug = slugify(requestData?.subcategory_name);
      const findSubcategoryNameExit: boolean | null | undefined | any =
        await SubcategoryModel.exists({
          subcategory_slug,
        });
      if (
        findSubcategoryNameExit &&
        requestData?._id !== findSubcategoryNameExit?._id.toString()
      ) {
        throw new AppError(400, "This subcategory is already exists!");
      }
      // const findCategorySerialExit: boolean | null | undefined | any =
      //   await SubcategoryModel.exists({
      //     category_serial: requestData?.category_serial,
      //   });
      // if (
      //   findCategorySerialExit &&
      //   requestData?._id !== findCategorySerialExit?._id.toString()
      // ) {
      //   throw new AppError(400, "Serial Number Previously Added !");
      // }

      // Find the category that currently has the given newSerial
      const existingSubcategory = await SubcategoryModel.findOne({ category_id: requestData?.category_id, subcategory_serial: requestData?.subcategory_serial });


      // Find the category that is being updated
      const subcategoryToUpdate = await SubcategoryModel.findById(requestData?._id);


      if (!subcategoryToUpdate) {
        throw new Error("Sub Category to update not found.");
      }

      if (existingSubcategory) {
        // Swap serials if another category already has the newSerial
        await SubcategoryModel.findByIdAndUpdate(existingSubcategory._id, { subcategory_serial: subcategoryToUpdate.subcategory_serial });
      }

      // Update the requested category with the new serial
      await SubcategoryModel.findByIdAndUpdate(requestData?._id, { subcategory_serial: requestData?.subcategory_serial });

      const data = { ...requestData, subcategory_banner, subcategory_banner_key, subcategory_slug };
      const result: ISubcategoryInterface | any = await updateSubcategoryServices(
        data,
        requestData?._id
      );
      if (result?.modifiedCount > 0) {
        return sendResponse<ISubcategoryInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Sub Category Update Successfully !",
        });
      } else {
        throw new AppError(400, "Sub Category Update Failed !");
      }
    }
  } catch (error: any) {
    next(error);
  }
};

// delete A Sub category item
export const deleteASubcategoryInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subcategory_id = req.body._id;
    // const findSubcategoryInAttributeExist: boolean | null | undefined | any =
    //   await AttributeModel.exists({
    //     subcategory_id: subcategory_id,
    //   });
    // if (findSubcategoryInAttributeExist) {
    //   throw new AppError(400, "Already Added In Attribute!");
    // }
    const findCategoryInSubcategoryExist: boolean | null | undefined | any =
      await CategoryModel.exists({
        subcategory_id: subcategory_id,
      });
    if (findCategoryInSubcategoryExist) {
      throw new AppError(400, "Already Added In Subcategory!");
    }
    // const findCategoryInChildCategoryExist: boolean | null | undefined | any =
    //   await ChildSubcategoryModel.exists({
    //     category_id: category_id,
    //   });
    // if (findCategoryInChildCategoryExist) {
    //   throw new AppError(400, "Already Added In ChildCategory !");
    // }

    const result = await deleteSubcategoryServices(subcategory_id);
    if (result?.deletedCount > 0) {
      if (req.body?.subcategory_logo_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.subcategory_logo_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Sub Category Delete successfully !",
      });
    } else {
      throw new AppError(400, "Sub Category delete failed !");
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
