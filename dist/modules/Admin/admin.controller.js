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
exports.AdminControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const admin_model_1 = __importDefault(require("./admin.model"));
const admin_services_1 = require("./admin.services");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// login an admin
const loginAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultController = yield admin_services_1.AdminServices.loginAdminServices(req.body);
    const { accessToken } = resultController;
    const adminLoginInfo = yield admin_model_1.default.find({ admin_phone: req.body.admin_phone }).select('-admin_password');
    const cookieOptions = {
        secure: config_1.default.node_env === 'production' ? true : false,
        httpOnly: true,
    };
    res.cookie('token', accessToken);
    res.status(http_status_1.default.OK).json({
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Admin logged in successfully',
        token: accessToken,
        data: adminLoginInfo
    });
}));
// Logout
const logoutAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Admin logged out successfully',
    });
}));
// create an admin
const registerAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_services_1.AdminServices.registerAdminServices(req.body);
    const token = result.accessToken;
    // Set token in HTTP-only cookie
    res.cookie('admin_token', `Bearer ${token}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Admin registered successfully',
        data: result.result,
        token: token
    });
}));
//get all admins
const getAllAdmins = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const { result, totalCount } = yield admin_services_1.AdminServices.getAllAdminsServices(query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All admins retrieved successfully',
        data: result,
        totalData: totalCount
    });
}));
// logged in admin info
const getAdminById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield admin_services_1.AdminServices.getAdminByIdServices(user === null || user === void 0 ? void 0 : user.admin_phone);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Logged-In admin retrieved successfully',
        data: result,
    });
}));
// update admin
const updateAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const admin_id = req.body._id;
    // admin profile upload
    let admin_profile;
    let admin_profile_key;
    if (req.files && "admin_profile" in req.files) {
        const adminImage = req.files["admin_profile"][0];
        const admin_profile_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(adminImage);
        admin_profile = admin_profile_upload === null || admin_profile_upload === void 0 ? void 0 : admin_profile_upload.Location;
        admin_profile_key = admin_profile_upload === null || admin_profile_upload === void 0 ? void 0 : admin_profile_upload.Key;
    }
    const data = Object.assign(Object.assign({}, req.body), { admin_profile, admin_profile_key });
    const result = yield admin_services_1.AdminServices.updateAdminServices(admin_id, data);
    if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.admin_profile_key) {
        yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.admin_profile_key);
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Admin updated successfully',
    });
}));
//delete admin
const deleteAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { _id } = req.params;
    const result = yield admin_services_1.AdminServices.deleteAdminServices(_id);
    if ((result === null || result === void 0 ? void 0 : result.deletedCount) > 0) {
        if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.admin_profile_key) {
            yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.admin_profile_key);
        }
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: 200,
            message: 'Admin deleted successfully',
            data: result,
        });
    }
    else {
        throw new AppError_1.default(400, "Admin delete failed !");
    }
}));
//change admin  password
const changeAdminPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield admin_services_1.AdminServices.changeAdminPasswordServices(req.user, req.body);
    console.log(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result,
    });
}));
exports.AdminControllers = {
    loginAdmin,
    registerAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeAdminPassword,
    logoutAdmin
};
