import { Request, Response, NextFunction, RequestHandler } from "express";
import AppError from "../../errors/AppError";
import sendResponse from "../../utils/sendResponse";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import httpStatus from 'http-status';
import catchAsync from "../../utils/catchAsync";
import { AddressModel } from "./address.model";
import { AddressServices } from "./address.service";


const postAddress: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const userId = req.user?._id
    console.log(userId, 'user from addres controlller');
    const addressData = {
        ...req.body,
        user_id: userId
    }
    const result = await AddressServices.postAddressService(addressData);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Address created successfully",
        data: result,
    });
};

const getAddress = catchAsync(async (req, res) => {
    const result = await AddressServices.getAddressService();

    if (result.length === 0) {
        throw new AppError(404, "No data found");
    }



    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Address info retrieved successfully',
        data: result,
    });

});

const updateAddress: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const requestData = req.body;
        const addressId = requestData?._id;

        // ========== Update ==========
        const result = await AddressServices.updateAddressService(addressId, requestData);


        if (result) {
            return sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: "Address info Updated Successfully!",
                data: result
            });
        } else {
            throw new AppError(400, "Address info Update Failed!");
        }
    } catch (error) {
        next(error);
    }
};


const deleteAddress = catchAsync(async (req, res, next) => {
    const { _id } = req.params
    const result = await AddressServices.deleteAddressService(_id);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Address deleted successfully !",
    });
});

// Address by user id
const findAddressesByUserId = catchAsync(async (req, res) => {
    const { user_id } = req.params;
    const result = await AddressServices.findAddressesByUserIdServices(user_id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Address by user id retrieved successfully',
        data: result,
    });

});

export const AddressController = {
    postAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    findAddressesByUserId
};