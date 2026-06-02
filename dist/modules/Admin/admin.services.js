"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const admin_model_1 = __importDefault(require("./admin.model"));
const http_status_1 = __importDefault(require("http-status"));
// import config from '../../../config';
// import { createToken } from '../../../util/createToken';
// import QueryBuilder from '../../builder/QueryBuilder';
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const createToken_1 = require("../../utils/createToken");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// login as admin
const loginAdminServices = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the admin is exist
    const admin = yield (admin_model_1.default === null || admin_model_1.default === void 0 ? void 0 : admin_model_1.default.isAdminExistsByPhone(payload.admin_phone));
    if (!admin) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'admin is not found');
    }
    if ((admin === null || admin === void 0 ? void 0 : admin.admin_status) === 'in-active') {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'This user is not allowed to login due to in-activity');
    }
    //checking if the password is correct
    if (!(yield (admin_model_1.default === null || admin_model_1.default === void 0 ? void 0 : admin_model_1.default.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.admin_password, admin === null || admin === void 0 ? void 0 : admin.admin_password))))
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched');
    //create token and sent to the  client
    const jwtPayload = {
        admin_phone: admin.admin_phone,
        admin_status: admin.admin_status,
        role: 'admin'
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.jwt_access_secret);
    return {
        accessToken,
    };
});
// create an Admin
const registerAdminServices = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the admin is exist
    const admin = yield (admin_model_1.default === null || admin_model_1.default === void 0 ? void 0 : admin_model_1.default.isAdminExistsByPhone(payload.admin_phone));
    if (admin) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Admin already exists!');
    }
    const result = yield admin_model_1.default.create(payload);
    //create token and sent to the  client
    const jwtPayload = {
        admin_phone: result.admin_phone,
        admin_status: result.admin_status,
    };
    const accessToken = (0, createToken_1.createToken)(jwtPayload, config_1.default.jwt_access_secret);
    return {
        result,
        accessToken,
    };
    //return result;
});
//get all admins
const getAllAdminsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = admin_model_1.default.find().select('-admin_password').sort({ _id: 1 }).populate('admin_role_id');
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['admin_name', 'admin_phone']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const totalCount = yield admin_model_1.default.countDocuments(query.modelQuery.getFilter());
    const result = yield query.modelQuery; // Execute the query
    return { result, totalCount };
});
// logged in admin info
const getAdminByIdServices = (admin_phone) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_model_1.default.findOne({ admin_phone }).select('-admin_password').populate('admin_role_id');
    ;
    return result;
});
//update an admin
const updateAdminServices = (_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const adminData = yield admin_model_1.default.findById(_id);
    if (!adminData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Admin does not exist!');
    }
    // if (adminData?.isDeleted === true) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Admin deleted!');
    // }
    // If the admin wants to update the password, hash it
    if (payload.admin_password) {
        payload.admin_password = yield bcrypt_1.default.hash(payload.admin_password, Number(config_1.default.bcrypt_salt_rounds));
    }
    const result = yield admin_model_1.default.findByIdAndUpdate(_id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
//delete an admin
const deleteAdminServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const adminData = yield admin_model_1.default.findById(_id);
    if (!adminData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Admin does not exist!');
    }
    // if (adminData?.isDeleted === true) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Admin deleted!');
    // }
    const result = yield admin_model_1.default.deleteOne({ _id: _id }, {
        runValidators: true,
    });
    return result;
});
//change admin password
const changeAdminPasswordServices = (admin, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const adminData = yield admin_model_1.default.isAdminExistsByPhone(admin === null || admin === void 0 ? void 0 : admin.admin_phone);
    if (!adminData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This admin is not found');
    }
    const isOldPasswordCorrect = yield bcrypt_1.default.compare(payload.oldPassword, adminData.admin_password);
    if (!isOldPasswordCorrect) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Old password is not correct');
    }
    const isSamePassword = yield bcrypt_1.default.compare(payload.newPassword, adminData.admin_password);
    if (isSamePassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New password cannot be same as old password');
    }
    const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield admin_model_1.default.findOneAndUpdate({
        admin_phone: admin.admin_phone,
        admin_status: admin.admin_status,
    }, {
        admin_password: newHashedPassword,
        needsPasswordChange: false,
        passwordChangeAt: new Date(),
    }, { new: true });
    return { message: 'admin password has been changed successfully' };
});
exports.AdminServices = {
    loginAdminServices,
    registerAdminServices,
    getAllAdminsServices,
    getAdminByIdServices,
    updateAdminServices,
    deleteAdminServices,
    changeAdminPasswordServices
};
