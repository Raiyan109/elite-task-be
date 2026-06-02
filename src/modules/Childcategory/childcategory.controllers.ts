import { NextFunction, Request, RequestHandler, Response } from "express";
import * as fs from "fs";
import httpStatus from 'http-status'
import slugify from "slugify";

import { IChildcategoryInterface, childcategorySearchableField } from "./childcategory.interface";
import ChildcategoryModel from "./childcategory.model";
import { deleteChildcategoryServices, findAllDashboardChildcategoryServices, findAllChildcategoryServices, postChildcategoryServices, updateChildcategoryServices } from "./childcategory.services";
import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import sendResponse from "../../utils/sendResponse";
import CategoryModel from "../Category/category.model";

// Add A Category
export const postChildcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IChildcategoryInterface | any> => {
  if (!req.files || !("childcategory_logo" in req.files)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Logo is required',
    });
  }
  try {
    // if (req.files && "childcategory_logo" in req.files && req.body) {
    const requestData = req.body;
    let childcategory_slug = slugify(requestData?.childcategory_name);

    const findChildcategoryNameExit: boolean | null | undefined | any =
      await ChildcategoryModel.exists({
        childcategory_slug,
      });
    if (findChildcategoryNameExit) {
      fs.unlinkSync(req.files.childcategory_logo[0].path);
      throw new AppError(400, "This childcategory is already exists!");
    }

    // Get the highest category_serial
    const lastChildcategory = await ChildcategoryModel.findOne({ subcategory_id: requestData?.subcategory_id }).sort({ childcategory_serial: -1 });

    // Determine the new category_serial
    const newChildcategorySerial = lastChildcategory ? lastChildcategory.childcategory_serial + 1 : 1;

    // get the childcategory image and upload
    let childcategory_logo;
    let childcategory_logo_key;
    if (req.files && "childcategory_logo" in req.files) {
      const childcategoryImage = req.files["childcategory_logo"][0];
      const childcategory_logo_upload = await FileUploadHelper.uploadToSpaces(
        childcategoryImage
      );
      childcategory_logo = childcategory_logo_upload?.Location;
      childcategory_logo_key = childcategory_logo_upload?.Key;
    }

    // Upload banners (optional)
    let childcategory_banner: string[] = [];
    let childcategory_banner_key: string[] = [];

    if ("childcategory_banner" in req.files) {
      const childcategoryBanner = req.files["childcategory_banner"];
      for (const file of childcategoryBanner) {
        const upload = await FileUploadHelper.uploadToSpaces(file);
        childcategory_banner.push(upload?.Location);
        childcategory_banner_key.push(upload?.Key);
      }
    }
    const data = {
      ...requestData,
      childcategory_logo,
      childcategory_logo_key,
      childcategory_banner,
      childcategory_banner_key,
      childcategory_slug, childcategory_serial: newChildcategorySerial
    };
    const result: IChildcategoryInterface | {} = await postChildcategoryServices(data);

    if (result) {
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Child Category Added Successfully !",
        data: result
      });
    } else {
      throw new AppError(400, "Child Category Added Failed !");
    }
    // } else {
    //   throw new AppError(400, "Image Upload Failed");
    // }
  } catch (error: any) {
    next(error);
  }
};

// Find All Category
export const findAllChildcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IChildcategoryInterface | any> => {
  try {
    const { searchTerm, ...filterData } = req.query;
    const result: IChildcategoryInterface[] | any = await findAllChildcategoryServices(searchTerm);
    return sendResponse<IChildcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Child Category Found Successfully !",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find All dashboard Category
export const findAllDashboardChildcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IChildcategoryInterface | any> => {
  try {
    const { page, limit, searchTerm, subcategory_id } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result: IChildcategoryInterface[] | any =
      await findAllDashboardChildcategoryServices(limitNumber, skip, searchTerm, subcategory_id);
    const andCondition = [];
    if (searchTerm) {
      andCondition.push({
        $or: childcategorySearchableField.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: "i",
          },
        })),
      });
    }
    const whereCondition =
      andCondition.length > 0 ? { $and: andCondition } : {};
    const total = await ChildcategoryModel.countDocuments(whereCondition);
    return sendResponse<IChildcategoryInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Child Category Found Successfully !",
      data: result,
      totalData: total,
    });
  } catch (error: any) {
    next(error);
  }
};

// Update A Category
export const updateChildcategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IChildcategoryInterface | any> => {
  try {
    if (req.files && ("childcategory_logo" in req.files || "childcategory_banner" in req.files) && req.body) {
      const requestData = req.body;
      let childcategory_slug = slugify(requestData?.childcategory_name);
      const findChildcategoryNameExit: boolean | null | undefined | any =
        await ChildcategoryModel.exists({
          childcategory_slug,
        });
      if (
        findChildcategoryNameExit &&
        requestData?._id !== findChildcategoryNameExit?._id.toString()
      ) {
        fs.unlinkSync(req.files.childcategory_logo[0].path);
        throw new AppError(400, "This childcategory is already exists!");
      }
      // const findCategorySerialExit: boolean | null | undefined | any =
      //   await ChildcategoryModel.exists({
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
      const existingChildcategory = await ChildcategoryModel.findOne({ subcategory_id: requestData?.subcategory_id, childcategory_serial: requestData?.childcategory_serial });

      //console.log("hello",existingChildcategory);


      // Find the category that is being updated
      const childcategoryToUpdate = await ChildcategoryModel.findById(requestData?._id);

      //console.log(childcategoryToUpdate);


      if (!childcategoryToUpdate) {
        throw new Error("Child Category to update not found.");
      }

      if (existingChildcategory) {
        // Swap serials if another category already has the newSerial
        await ChildcategoryModel.findByIdAndUpdate(existingChildcategory._id, { childcategory_serial: childcategoryToUpdate.childcategory_serial });
      }

      // Update the requested category with the new serial
      await ChildcategoryModel.findByIdAndUpdate(requestData?._id, { childcategory_serial: requestData?.childcategory_serial });

      // get the category image and upload
      let childcategory_logo;
      let childcategory_logo_key;
      if (req.files && "childcategory_logo" in req.files) {
        const childcategoryImage = req.files["childcategory_logo"][0];
        const childcategory_logo_upload = await FileUploadHelper.uploadToSpaces(
          childcategoryImage
        );
        childcategory_logo = childcategory_logo_upload?.Location;
        childcategory_logo_key = childcategory_logo_upload?.Key;
      }

      // Handle banner uploads
      // let childcategory_banner = childcategoryToUpdate.childcategory_banner || [];
      // let childcategory_banner_key = childcategoryToUpdate.childcategory_banner_key || [];

      // if ("childcategory_banner" in req.files) {
      //   const bannerFiles = req.files["childcategory_banner"];
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
      //   if (Array.isArray(requestData?.childcategory_banner_key)) {
      //     for (const oldKey of requestData.childcategory_banner_key) {
      //       await FileUploadHelper.deleteFromSpaces(oldKey);
      //     }
      //   }

      //   childcategory_banner = newBannerUrls;
      //   childcategory_banner_key = newBannerKeys;
      // }

      // Handle banner uploads - MODIFIED SECTION
      let childcategory_banner = [];
      let childcategory_banner_key = [];

      // Process existing banners
      if (req.body.childcategory_banner) {
        // Ensure we always work with an array
        const existingBanners = Array.isArray(req.body.childcategory_banner)
          ? req.body.childcategory_banner
          : [req.body.childcategory_banner];

        childcategory_banner = existingBanners.filter((b: string[]) => typeof b === 'string');

        // Process keys - ensure we have an array
        const existingKeys = Array.isArray(req.body.childcategory_banner_key)
          ? req.body.childcategory_banner_key
          : req.body.childcategory_banner_key ? [req.body.childcategory_banner_key] : [];

        // Match keys with banners
        childcategory_banner_key = existingKeys.slice(0, childcategory_banner.length);
      }

      // Process new banner files
      if (req.files?.childcategory_banner) {
        const bannerFiles = Array.isArray(req.files["childcategory_banner"])
          ? req.files["childcategory_banner"]
          : [req.files["childcategory_banner"]];

        for (const file of bannerFiles) {
          const upload = await FileUploadHelper.uploadToSpaces(file);
          childcategory_banner.push(upload?.Location);
          childcategory_banner_key.push(upload?.Key);
          fs.existsSync(file.path) && fs.unlinkSync(file.path);
        }
      }


      const data = {
        ...requestData,
        childcategory_logo,
        childcategory_logo_key,
        childcategory_banner,
        childcategory_banner_key,
        childcategory_slug
      };
      const result: IChildcategoryInterface | any = await updateChildcategoryServices(
        data,
        requestData?._id
      );
      if (result?.modifiedCount > 0) {
        if (requestData?.childcategory_logo_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.childcategory_logo_key
          );
        }
        return sendResponse<IChildcategoryInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Child Category Update Successfully !",
        });
      } else {
        throw new AppError(400, "Child Category Update Failed !");
      }
    } else {
      const requestData = req.body;
      const childcategory_banner: string[] = requestData?.childcategory_banner ? requestData?.childcategory_banner : []; //if no file but still banner image then add or []
      const childcategory_banner_key: string[] = requestData?.childcategory_banner_key ? requestData?.childcategory_banner_key : [];
      let childcategory_slug = slugify(requestData?.childcategory_name);
      const findChildcategoryNameExit: boolean | null | undefined | any =
        await ChildcategoryModel.exists({
          childcategory_slug,
        });
      if (
        findChildcategoryNameExit &&
        requestData?._id !== findChildcategoryNameExit?._id.toString()
      ) {
        throw new AppError(400, "This childcategory is already exists!");
      }
      // const findCategorySerialExit: boolean | null | undefined | any =
      //   await ChildcategoryModel.exists({
      //     category_serial: requestData?.category_serial,
      //   });
      // if (
      //   findCategorySerialExit &&
      //   requestData?._id !== findCategorySerialExit?._id.toString()
      // ) {
      //   throw new AppError(400, "Serial Number Previously Added !");
      // }

      // Find the category that currently has the given newSerial
      const existingChildcategory = await ChildcategoryModel.findOne({ subcategory_id: requestData?.subcategory_id, childcategory_serial: requestData?.childcategory_serial });


      // Find the category that is being updated
      const childcategoryToUpdate = await ChildcategoryModel.findById(requestData?._id);


      if (!childcategoryToUpdate) {
        throw new Error("Child Category to update not found.");
      }

      if (existingChildcategory) {
        // Swap serials if another category already has the newSerial
        await ChildcategoryModel.findByIdAndUpdate(existingChildcategory._id, { childcategory_serial: childcategoryToUpdate.childcategory_serial });
      }

      // Update the requested category with the new serial
      await ChildcategoryModel.findByIdAndUpdate(requestData?._id, { childcategory_serial: requestData?.childcategory_serial });

      const data = { ...requestData, childcategory_banner, childcategory_banner_key, childcategory_slug };
      const result: IChildcategoryInterface | any = await updateChildcategoryServices(
        data,
        requestData?._id
      );
      if (result?.modifiedCount > 0) {
        return sendResponse<IChildcategoryInterface>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Child Category Update Successfully !",
        });
      } else {
        throw new AppError(400, "Child Category Update Failed !");
      }
    }
  } catch (error: any) {
    next(error);
  }
};

// delete A Category item
export const deleteAChildcategoryInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const childcategory_id = req.body._id;
    // const findChildcategoryInAttributeExist: boolean | null | undefined | any =
    //   await AttributeModel.exists({
    //     childcategory_id: childcategory_id,
    //   });
    // if (findChildcategoryInAttributeExist) {
    //   throw new AppError(400, "Already Added In Attribute!");
    // }
    const findCategoryInChildcategoryExist: boolean | null | undefined | any =
      await CategoryModel.exists({
        childcategory_id: childcategory_id,
      });
    if (findCategoryInChildcategoryExist) {
      throw new AppError(400, "Already Added In Childcategory!");
    }
    // const findCategoryInChildCategoryExist: boolean | null | undefined | any =
    //   await ChildChildcategoryModel.exists({
    //     category_id: category_id,
    //   });
    // if (findCategoryInChildCategoryExist) {
    //   throw new AppError(400, "Already Added In ChildCategory !");
    // }

    const result = await deleteChildcategoryServices(childcategory_id);
    if (result?.deletedCount > 0) {
      if (req.body?.childcategory_logo_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.childcategory_logo_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Child Category Delete successfully !",
      });
    } else {
      throw new AppError(400, "Child Category delete failed !");
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
