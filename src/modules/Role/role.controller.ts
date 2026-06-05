/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";
import { RoleServices } from "./role.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/AppError";

const postRole: RequestHandler = async (
    req,
    res
): Promise<void> => {
    const result = await RoleServices.postRoleService(req.body);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Role created successfully",
        data: result,
    });
};

const getRoles = catchAsync(async (req, res) => {

    const query = req.query
    const { result, totalCount } = await RoleServices.getRoleService(query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Roles info retrieved successfully',
        data: result,
        totalData: totalCount
    });
});

const updateRole: RequestHandler = async (
    req,
    res,
    next
): Promise<any> => {
    try {
        const requestData = req.body;
        const rolesId = requestData?._id;

        // ========== Update ==========
        const result = await RoleServices.updateRoleService(rolesId, requestData);


        if (result) {
            return sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: "Roles info Updated Successfully!",
                data: result
            });
        } else {
            throw new AppError(400, "Roles info Update Failed!");
        }
    } catch (error) {
        next(error);
    }
};

const deleteRole = catchAsync(async (req, res) => {
    const _id = req?.body?._id
    await RoleServices.deleteRoleService(_id);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Roles deleted successfully !",
    });
});

export const RoleControllers = {
    postRole,
    getRoles,
    updateRole,
    deleteRole
}