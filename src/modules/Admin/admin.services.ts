import AppError from '../../errors/AppError';
import { IAdminInterface, IAdminLoginInterface } from './admin.interface';
import AdminModel from './admin.model';
import httpStatus from 'http-status';
// import config from '../../../config';
// import { createToken } from '../../../util/createToken';
// import QueryBuilder from '../../builder/QueryBuilder';
import bcrypt from 'bcrypt';
import { JwtPayload, SignOptions } from 'jsonwebtoken';

import config from '../../config';
import { createToken } from '../../utils/createToken';
import QueryBuilder from '../../builder/QueryBuilder';


// login as admin
const loginAdminServices = async (payload: IAdminLoginInterface) => {
    // checking if the admin is exist
    const admin = await AdminModel?.isAdminExistsByPhone(payload.admin_phone);

    if (!admin) {
        throw new AppError(httpStatus.NOT_FOUND, 'admin is not found');
    }

    if (admin?.admin_status === 'in-active') {
        throw new AppError(httpStatus.UNAUTHORIZED, 'This user is not allowed to login due to in-activity');
    }

    //checking if the password is correct
    if (!(await AdminModel?.isPasswordMatched(payload?.admin_password, admin?.admin_password)))
        throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

    //create token and sent to the  client
    const jwtPayload = {
        admin_phone: admin.admin_phone,
        admin_status: admin.admin_status,
        role: 'admin'
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        //config.jwt_access_expires_in as SignOptions['expiresIn'],
    );

    return {
        accessToken,
    };

};



// create an Admin
const registerAdminServices = async (payload: IAdminInterface) => {

    // checking if the admin is exist
    const admin = await AdminModel?.isAdminExistsByPhone(payload.admin_phone);


    if (admin) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Admin already exists!');
    }

    const result = await AdminModel.create(payload);

    //create token and sent to the  client
    const jwtPayload = {
        admin_phone: result.admin_phone,
        admin_status: result.admin_status,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        //config.jwt_access_expires_in as SignOptions['expiresIn']
    );

    return {
        result,
        accessToken,
    };

    //return result;

};

//get all admins
const getAllAdminsServices = async (queryParams: Record<string, unknown>) => {
    const modelQuery = AdminModel.find().select('-admin_password').sort({ _id: 1 }).populate('admin_role_id');

    const query = new QueryBuilder(modelQuery, queryParams)
        .search(['admin_name', 'admin_phone']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate()
    // .fields();

    const totalCount = await AdminModel.countDocuments(query.modelQuery.getFilter());

    const result = await query.modelQuery; // Execute the query

    return { result, totalCount };
};


// logged in admin info
const getAdminByIdServices = async (admin_phone: string) => {
    const result = await AdminModel.findOne({ admin_phone }).select('-admin_password').populate('admin_role_id');;
    return result;
};


//update an admin
const updateAdminServices = async (_id: string, payload: Partial<IAdminInterface>) => {
    const adminData = await AdminModel.findById(_id);

    if (!adminData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Admin does not exist!');
    }

    // if (adminData?.isDeleted === true) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Admin deleted!');
    // }

    // If the admin wants to update the password, hash it
    if (payload.admin_password) {
        payload.admin_password = await bcrypt.hash(
            payload.admin_password,
            Number(config.bcrypt_salt_rounds)
        );
    }

    const result = await AdminModel.findByIdAndUpdate(_id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

//delete an admin
const deleteAdminServices = async (_id: string) => {
    const adminData = await AdminModel.findById(_id);

    if (!adminData) {
        throw new AppError(httpStatus.NOT_FOUND, 'Admin does not exist!');
    }

    // if (adminData?.isDeleted === true) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Admin deleted!');
    // }

    const result = await AdminModel.deleteOne(
        { _id: _id },
        {
            runValidators: true,
        }
    );
    return result;
};

//change admin password
const changeAdminPasswordServices = async (
    admin: JwtPayload,
    payload: {
        oldPassword: string;
        newPassword: string;
    },
) => {

    const adminData = await AdminModel.isAdminExistsByPhone(admin?.admin_phone);


    if (!adminData) {
        throw new AppError(httpStatus.NOT_FOUND, 'This admin is not found');
    }

    const isOldPasswordCorrect = await bcrypt.compare(
        payload.oldPassword,
        adminData.admin_password,
    );

    if (!isOldPasswordCorrect) {
        throw new AppError(httpStatus.FORBIDDEN, 'Old password is not correct');
    }

    const isSamePassword = await bcrypt.compare(
        payload.newPassword,
        adminData.admin_password,
    );

    if (isSamePassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'New password cannot be same as old password',
        );
    }

    const newHashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await AdminModel.findOneAndUpdate(
        {
            admin_phone: admin.admin_phone,
            admin_status: admin.admin_status,
        },
        {
            admin_password: newHashedPassword,
            needsPasswordChange: false,
            passwordChangeAt: new Date(),
        },
        { new: true },
    );
    return { message: 'admin password has been changed successfully' };
};

export const AdminServices = {
    loginAdminServices,
    registerAdminServices,
    getAllAdminsServices,
    getAdminByIdServices,
    updateAdminServices,
    deleteAdminServices,
    changeAdminPasswordServices
};