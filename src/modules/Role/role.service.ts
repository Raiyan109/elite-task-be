/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { IRole } from "./role.interface";
import { RoleModel } from "./role.model";
import httpStatus from 'http-status'

// Create Roles
const postRoleService = async (
    payload: IRole
): Promise<IRole> => {

    // const existingRoles = await RoleModel.findOne({ admin_role: payload.admin_role });


    // if (existingRoles) {
    //     throw new AppError(httpStatus.BAD_REQUEST, 'You already added this role!');
    // }

    const result = await RoleModel.create(payload);
    return result;
};

const getRoleService = async (queryParams: Record<string, unknown>) => {

    const modelQuery = RoleModel.find().sort({ _id: 1 });

    const query = new QueryBuilder(modelQuery, queryParams)
        .search(['admin_role']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate()
    // .fields();

    const totalCount = await RoleModel.countDocuments(query.modelQuery.getFilter());

    const result = await query.modelQuery; // Execute the query

    return { result, totalCount };
};

const updateRoleService = async (
    roleId: string,
    payload: Partial<IRole>
): Promise<any> => {
    const setFields: Record<string, any> = {};
    const unsetFields: Record<string, any> = {};

    for (const [key, value] of Object.entries(payload)) {
        if (value === null || value === undefined) {
            unsetFields[key] = "";
        } else {
            setFields[key] = value;
        }
    }

    const result = await RoleModel.findByIdAndUpdate(
        { _id: roleId },
        {
            ...(Object.keys(setFields).length > 0 ? { $set: setFields } : {}),
            ...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
        },
        {
            new: true,
            runValidators: true,
        }
    );

    return result;
};

// delete Roles info
export const deleteRoleService = async (_id: string): Promise<IRole | any> => {

    const RoleInfo = await RoleModel.findById({ _id: _id });

    if (!RoleInfo) {
        throw new AppError(httpStatus.NOT_FOUND, 'Role does not exist!');
    }
    const result = await RoleModel.findByIdAndDelete({ _id: _id }
    );
    return result;
};


export const RoleServices = {
    postRoleService,
    getRoleService,
    updateRoleService,
    deleteRoleService
}