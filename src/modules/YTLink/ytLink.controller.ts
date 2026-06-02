import { NextFunction, Request, Response } from 'express';
import { YTLinkService } from './ytLink.service';
import { YTLinkModel } from './ytLink.model';
import * as fs from "fs";
import { IYTLink } from './ytLink.interface';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import sendResponse from '../../utils/sendResponse';


const createYTLink = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
   const requestData = req.body;
      const ytLink = requestData?.ytLink_link;
      const findYTLinkNameExist = await YTLinkModel.exists({ ytLink });

      
      // Get the highest ytLink_serial
      const lastYTLink = await YTLinkModel.findOne().sort({ ytLink_serial: -1 });

      // Determine the new ytLink_serial
      const newYTLinkSerial = lastYTLink ? lastYTLink.ytLink_serial + 1 : 1;

      const data = { ...requestData, ytLink_serial: newYTLinkSerial };

      const result = await YTLinkService.createYTLinkServices(data);

      if (result) {
        return sendResponse<IYTLink>(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: "YTLink Added Successfully !",
          data: result
        });
      } else {
        throw new AppError(400, "YTLink Added Failed !");
      }
  } catch (error: any) {
    next(error);
  }
});


const findYTLinks = catchAsync(async (req, res) => {
  const query = req.query
  const result = await YTLinkService.findYTLinksServices(query);

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
    message: 'YTLinks retrieved successfully',
    data: result,
  });
});

const findAllDashboardYTLinks = catchAsync(async (req, res) => {
  const query = req.query
  const {result, totalCount} = await YTLinkService.findAllDashboardYTLinkServices(query);

  // Check if the database collection is empty or no matching data is found
  // if (!result || result.length === 0) {
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
    message: 'Dashboard ytLinks retrieved successfully',
    data: result,
    totalData: totalCount
  });
});

const updateYTLink = catchAsync(async (req, res, next) => {
  try {
    if (req.files && "ytLink_image" in req.files && req.body) {
      const requestData = req.body;

      // const findYTLinkNameExist = await YTLinkModel.exists({ ytLink_title: requestData?.ytLink_title });
      // if (findYTLinkNameExist) {
      //   if (req.files?.ytLink_image?.[0]?.path) {
      //     try {
      //       fs.unlinkSync(req.files.ytLink_image[0].path);
      //     } catch (error) {
      //       console.error("Error deleting file:", error);
      //     }
      //   }
      //   throw new AppError(httpStatus.BAD_REQUEST, 'This ytLink already exists!');
      // }

      // const findBrandSerialExist = await YTLinkModel.exists({
      //   ytLink_serial: requestData?.ytLink_serial,
      // });
      // if (findBrandSerialExist) {
      //   if (req.files?.ytLink_image?.[0]?.path) {
      //     try {
      //       fs.unlinkSync(req.files.ytLink_image[0].path);
      //     } catch (error) {
      //       console.error("Error deleting file:", error);
      //     }
      //   }
      //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
      // }


      // Find the ytLink that currently has the given newSerial
      const existingYTLink = await YTLinkModel.findOne({ ytLink_serial: requestData?.ytLink_serial });

      //console.log("hello",existingYTLink);


      // Find the ytLink that is being updated
      const ytLinkToUpdate = await YTLinkModel.findById(requestData?._id);

      //console.log(ytLinkToUpdate);


      if (!ytLinkToUpdate) {
        throw new Error("ytLink to update not found.");
      }

      if (existingYTLink) {
        // Swap serials if another ytLink already has the newSerial
        await YTLinkModel.findByIdAndUpdate(existingYTLink._id, { ytLink_serial: ytLinkToUpdate.ytLink_serial });
      }

      // Update the requested ytLink with the new serial
      await YTLinkModel.findByIdAndUpdate(requestData?._id, { ytLink_serial: requestData?.ytLink_serial });

      // get the ytLink image and upload
      let ytLink_image;
      let ytLink_image_key;
      if (req.files && "ytLink_image" in req.files) {
        const ytLinkImage = req.files["ytLink_image"][0];
        const ytLink_image_upload = await FileUploadHelper.uploadToSpaces(
          ytLinkImage
        );
        ytLink_image = ytLink_image_upload?.Location;
        ytLink_image_key = ytLink_image_upload?.Key;
      }
      const data = { ...requestData, ytLink_image, ytLink_image_key };
      const result: IYTLink | any = await YTLinkService.updateYTLinkServices(data, requestData?._id
      );

      if (result) {
        if (requestData?.ytLink_image_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.ytLink_image_key
          );
        }
        return sendResponse<IYTLink>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "YTLink Updated Successfully !",
        });
      } else {
        throw new AppError(httpStatus.BAD_REQUEST, "YTLink Update Failed !");
      }
    } else {
      const requestData = req.body;

      // const findYTLinkNameExist = await YTLinkModel.exists({ ytLink_title: requestData?.ytLink_title });
      // if (findYTLinkNameExist && requestData?._id !== findYTLinkNameExist?._id.toString()) {
      //   throw new AppError(httpStatus.BAD_REQUEST, 'Already added!');
      // }


      // Find the ytLink that currently has the given newSerial
      const existingYTLink = await YTLinkModel.findOne({ ytLink_serial: requestData?.ytLink_serial });

      // Find the ytLink that is being updated
      const ytLinkToUpdate = await YTLinkModel.findById(requestData?._id);

      //console.log(ytLinkToUpdate);


      if (!ytLinkToUpdate) {
        throw new Error("ytLink to update not found.");
      }

      if (existingYTLink) {
        // Swap serials if another ytLink already has the newSerial
        await YTLinkModel.findByIdAndUpdate(existingYTLink._id, { ytLink_serial: ytLinkToUpdate.ytLink_serial });
      }

      // Update the requested ytLink with the new serial
      await YTLinkModel.findByIdAndUpdate(requestData?._id, { ytLink_serial: requestData?.ytLink_serial });

      const result: IYTLink | any = await YTLinkService.updateYTLinkServices(requestData, requestData?._id
      );
      if (result) { // ✅ Check if result is not null
        return sendResponse<IYTLink>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "YTLink Updated Successfully !",
        });
      } else {
        throw new AppError(400, "YTLink Updated Failed !");
      }

    }
  } catch (error: any) {
    next(error);
  }
});

const deleteYTLinkInfo = catchAsync(async (req, res, next) => {
  try {
    // const { _id } = req.params
    const result = await YTLinkService.deleteYTLinkServices(req.body._id);
    if (result) {
      if (req.body?.ytLink_image_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.ytLink_image_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "YTLink deleted successfully !",
      });
    } else {
      throw new AppError(400, "YTLink delete failed !");
    }
  } catch (error: any) {
    next(error);
  }
});

export const YTLinkController = {
  createYTLink,
  findYTLinks,
  findAllDashboardYTLinks,
  updateYTLink,
  deleteYTLinkInfo
};