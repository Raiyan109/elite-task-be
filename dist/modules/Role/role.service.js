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
exports.RoleServices = exports.deleteRoleService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const role_model_1 = require("./role.model");
const http_status_1 = __importDefault(require("http-status"));
// Create Roles
const postRoleService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // const existingRoles = await RoleModel.findOne({ admin_role: payload.admin_role });
    // if (existingRoles) {
    //     throw new AppError(httpStatus.BAD_REQUEST, 'You already added this role!');
    // }
    const result = yield role_model_1.RoleModel.create(payload);
    return result;
});
const getRoleService = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = role_model_1.RoleModel.find().sort({ _id: 1 });
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['admin_role']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const totalCount = yield role_model_1.RoleModel.countDocuments(query.modelQuery.getFilter());
    const result = yield query.modelQuery; // Execute the query
    return { result, totalCount };
});
const updateRoleService = (roleId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const setFields = {};
    const unsetFields = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value === null || value === undefined) {
            unsetFields[key] = "";
        }
        else {
            setFields[key] = value;
        }
    }
    const result = yield role_model_1.RoleModel.findByIdAndUpdate({ _id: roleId }, Object.assign(Object.assign({}, (Object.keys(setFields).length > 0 ? { $set: setFields } : {})), (Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {})), {
        new: true,
        runValidators: true,
    });
    return result;
});
// delete Roles info
const deleteRoleService = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const RoleInfo = yield role_model_1.RoleModel.findById({ _id: _id });
    if (!RoleInfo) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Role does not exist!');
    }
    const result = yield role_model_1.RoleModel.findByIdAndDelete({ _id: _id });
    return result;
});
exports.deleteRoleService = deleteRoleService;
exports.RoleServices = {
    postRoleService,
    getRoleService,
    updateRoleService,
    deleteRoleService: exports.deleteRoleService
};
