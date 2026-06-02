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
exports.RoleControllers = void 0;
const role_service_1 = require("./role.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const postRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield role_service_1.RoleServices.postRoleService(req.body);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Role created successfully",
        data: result,
    });
});
const getRoles = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const { result, totalCount } = yield role_service_1.RoleServices.getRoleService(query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Roles info retrieved successfully',
        data: result,
        totalData: totalCount
    });
}));
const updateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestData = req.body;
        const rolesId = requestData === null || requestData === void 0 ? void 0 : requestData._id;
        // ========== Update ==========
        const result = yield role_service_1.RoleServices.updateRoleService(rolesId, requestData);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Roles info Updated Successfully!",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Roles info Update Failed!");
        }
    }
    catch (error) {
        next(error);
    }
});
const deleteRole = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield role_service_1.RoleServices.deleteRoleService(_id);
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Roles deleted successfully !",
    });
}));
exports.RoleControllers = {
    postRole,
    getRoles,
    updateRole,
    deleteRole
};
