import { NextFunction, Request, Response } from 'express';
import { BrandServices } from './brand.services';
import { IBrand } from './brand.interface';
import slugify from "slugify";
import { BrandModel } from './brand.model';
import * as fs from "fs";
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import sendResponse from '../../utils/sendResponse';


const postBrand = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // if (req.files && "brand_logo" in req.files && req.body) {

    // } else {
    //   throw new AppError(400, "Image Upload Failed");
    // }
    const requestData = req.body;
    let brand_slug = slugify(requestData?.brand_name);

    const findBrandNameExist = await BrandModel.exists({ brand_slug });

    if (findBrandNameExist) {
      try {
        if (req.files && "brand_logo" in req.files && req.files.brand_logo[0]?.path) {
          fs.unlinkSync(req.files.brand_logo[0].path);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
      throw new AppError(httpStatus.BAD_REQUEST, 'This brand already exists!');
    }

    // const findBrandSerialExist = await BrandModel.exists({
    //   brand_serial: requestData?.brand_serial,
    // });

    // if (findBrandSerialExist) {
    //   if (req.files?.brand_logo?.[0]?.path) {
    //     try {
    //       fs.unlinkSync(req.files.brand_logo[0].path);
    //     } catch (error) {
    //       console.error("Error deleting file:", error);
    //     }
    //   }
    //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
    // }



    // Get the highest brand_serial
    const lastBrand = await BrandModel.findOne().sort({ brand_serial: -1 });

    // Determine the new brand_serial
    const newBrandSerial = lastBrand ? lastBrand.brand_serial + 1 : 1;


    // get the brand image and upload
    let brand_logo;
    let brand_logo_key;
    if (req.files && "brand_logo" in req.files) {
      const brandImage = req.files["brand_logo"][0];
      const brand_logo_upload = await FileUploadHelper.uploadToSpaces(
        brandImage
      );
      brand_logo = brand_logo_upload?.Location;
      brand_logo_key = brand_logo_upload?.Key;
    }

    const data = { ...requestData, brand_logo, brand_logo_key, brand_slug, brand_serial: newBrandSerial };

    const result = await BrandServices.postBrandServices(data);

    if (result) {
      return sendResponse<IBrand>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Brand Added Successfully !",
        data: result
      });
    } else {
      throw new AppError(400, "Brand Added Failed !");
    }
  } catch (error: any) {
    next(error);
  }
});


const findAllBrand = catchAsync(async (req, res) => {
  const query = req.query
  const result = await BrandServices.findAllBrandsServices(query);

  // Check if the database collection is empty or no matching data is found
  if (!result || result.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'No data found.',
      data: [],
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Brands retrieved successfully',
    data: result,
  });
});

const findAllDashboardBrands = catchAsync(async (req, res) => {
  const query = req.query
  const result = await BrandServices.findAllDashboardBrandsServices(query);

  // Check if the database collection is empty or no matching data is found
  // if (!result || result?.data?.length === 0) {
  //   return sendResponse(res, {
  //     success: false,
  //     statusCode: httpStatus.NOT_FOUND,
  //     message: 'No data found.',
  //     data: [],
  //   });
  // }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard brands retrieved successfully',
    data: result?.data,
    pagination: result?.pagination,
    totalData: result?.total
  });
});


const findNestleAndUnileverBrands = catchAsync(async (req, res) => {
  const result = await BrandServices.findNestleAndUnileverBrandsServices();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Nestle and Unilever brands retrieved successfully',
    data: result,
  });
});

const updateBrand = catchAsync(async (req, res, next) => {
  try {
    if (req.files && "brand_logo" in req.files && req.body) {
      const requestData = req.body;

      const findBrandNameExist = await BrandModel.exists({ brand_slug: requestData?.brand_slug });
      if (findBrandNameExist) {
        if (req.files?.brand_logo?.[0]?.path) {
          try {
            fs.unlinkSync(req.files.brand_logo[0].path);
          } catch (error) {
            console.error("Error deleting file:", error);
          }
        }
        throw new AppError(httpStatus.BAD_REQUEST, 'This brand already exists!');
      }

      // const findBrandSerialExist = await BrandModel.exists({
      //   brand_serial: requestData?.brand_serial,
      // });
      // if (findBrandSerialExist) {
      //   if (req.files?.brand_logo?.[0]?.path) {
      //     try {
      //       fs.unlinkSync(req.files.brand_logo[0].path);
      //     } catch (error) {
      //       console.error("Error deleting file:", error);
      //     }
      //   }
      //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
      // }


      // Find the brand that currently has the given newSerial
      const existingBrand = await BrandModel.findOne({ brand_serial: requestData?.brand_serial });

      //console.log("hello",existingbrand);


      // Find the brand that is being updated
      const brandToUpdate = await BrandModel.findById(requestData?._id);

      //console.log(brandToUpdate);


      if (!brandToUpdate) {
        throw new Error("brand to update not found.");
      }

      if (existingBrand) {
        // Swap serials if another brand already has the newSerial
        await BrandModel.findByIdAndUpdate(existingBrand._id, { brand_serial: brandToUpdate.brand_serial });
      }

      // Update the requested brand with the new serial
      await BrandModel.findByIdAndUpdate(requestData?._id, { brand_serial: requestData?.brand_serial });

      // get the brand image and upload
      let brand_logo;
      let brand_logo_key;
      if (req.files && "brand_logo" in req.files) {
        const brandImage = req.files["brand_logo"][0];
        const brand_logo_upload = await FileUploadHelper.uploadToSpaces(
          brandImage
        );
        brand_logo = brand_logo_upload?.Location;
        brand_logo_key = brand_logo_upload?.Key;
      }
      const data = { ...requestData, brand_logo, brand_logo_key };
      const result: IBrand | any = await BrandServices.updateBrandServices(data, requestData?._id
      );

      if (result) {
        if (requestData?.brand_logo_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.brand_logo_key
          );
        }
        return sendResponse<IBrand>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Brand Update Successfully !",
        });
      } else {
        throw new AppError(httpStatus.BAD_REQUEST, "Brand Update Failed !");
      }
    } else {
      const requestData = req.body;

      const findBrandNameExist = await BrandModel.exists({ brand_slug: requestData?.brand_slug });
      if (findBrandNameExist && requestData?._id !== findBrandNameExist?._id.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Already added!');
      }

      // const findBrandSerialExist = await BrandModel.exists({
      //   brand_serial: requestData?.brand_serial,
      // });
      // if (findBrandSerialExist && requestData?._id !== findBrandSerialExist?._id.toString()) {
      //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
      // }

      // Find the brand that currently has the given newSerial
      const existingBrand = await BrandModel.findOne({ brand_serial: requestData?.brand_serial });

      //console.log("hello",existingbrand);


      // Find the brand that is being updated
      const brandToUpdate = await BrandModel.findById(requestData?._id);

      //console.log(brandToUpdate);


      if (!brandToUpdate) {
        throw new Error("brand to update not found.");
      }

      if (existingBrand) {
        // Swap serials if another brand already has the newSerial
        await BrandModel.findByIdAndUpdate(existingBrand._id, { brand_serial: brandToUpdate.brand_serial });
      }

      // Update the requested brand with the new serial
      await BrandModel.findByIdAndUpdate(requestData?._id, { brand_serial: requestData?.brand_serial });

      const result: IBrand | any = await BrandServices.updateBrandServices(requestData, requestData?._id
      );
      if (result) { // ✅ Check if result is not null
        return sendResponse<IBrand>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Brand Updated Successfully !",
        });
      } else {
        throw new AppError(400, "Brand Updated Failed !");
      }

    }
  } catch (error: any) {
    next(error);
  }
});


const deleteABrandInfo = catchAsync(async (req, res, next) => {
  try {
    const brand_id = req.body._id
    const result = await BrandServices.deleteBrandServices(brand_id);
    if (result) {
      if (req.body?.brand_logo_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.brand_logo_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Brand deleted successfully !",
      });
    } else {
      throw new AppError(400, "Brand delete failed !");
    }
  } catch (error: any) {
    next(error);
  }
});

// const updateBrandSequence = catchAsync(async (req, res) => {
//   const { brandId } = req.params;
//   const { sequence } = req.body;

//   if (sequence === undefined || isNaN(sequence)) {
//     return sendResponse(res, {
//       success: false,
//       statusCode: httpStatus.BAD_REQUEST,
//       message: 'Invalid sequence value',
//     });
//   }

//   const updatedBrand = await BrandServices.updateBrandSequenceInDB(brandId, Number(sequence));

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: 'Brand sequence updated successfully',
//     data: updatedBrand,
//   });
// });


// //get single Brand item
// export const getSingleBrand = catchAsync(async (req, res) => {
//   const { _id } = req.body;
//   const result = await getSingleBrandServices(_id);
//   //console.log(result);

//   sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: 'Brand retrieved successfully',
//       data: result,
//   });

// });

export const BrandController = {
  postBrand,
  findAllBrand,
  findAllDashboardBrands,
  findNestleAndUnileverBrands,
  updateBrand,
  deleteABrandInfo,
};