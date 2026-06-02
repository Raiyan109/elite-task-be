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
exports.AddressController = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const address_service_1 = require("./address.service");
const postAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    console.log(userId, 'user from addres controlller');
    const addressData = Object.assign(Object.assign({}, req.body), { user_id: userId });
    const result = yield address_service_1.AddressServices.postAddressService(addressData);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Address created successfully",
        data: result,
    });
});
const getAddress = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield address_service_1.AddressServices.getAddressService();
    if (result.length === 0) {
        throw new AppError_1.default(404, "No data found");
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Address info retrieved successfully',
        data: result,
    });
}));
const updateAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestData = req.body;
        const addressId = requestData === null || requestData === void 0 ? void 0 : requestData._id;
        // ========== Update ==========
        const result = yield address_service_1.AddressServices.updateAddressService(addressId, requestData);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Address info Updated Successfully!",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Address info Update Failed!");
        }
    }
    catch (error) {
        next(error);
    }
});
const deleteAddress = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const result = yield address_service_1.AddressServices.deleteAddressService(_id);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Address deleted successfully !",
    });
}));
// Address by user id
const findAddressesByUserId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const result = yield address_service_1.AddressServices.findAddressesByUserIdServices(user_id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Address by user id retrieved successfully',
        data: result,
    });
}));
exports.AddressController = {
    postAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    findAddressesByUserId
};
