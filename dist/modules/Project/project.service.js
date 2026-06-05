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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectServices = void 0;
const project_model_1 = require("./project.model");
const createProjectService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.ProjectModel.create(payload);
    return result;
});
const getAllProjectsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.ProjectModel.find()
        .populate("user_id", "user_name user_email")
        .populate("members", "user_name user_email")
        .sort({ createdAt: -1 });
    return result;
});
const getSingleProjectService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.ProjectModel.findById(id)
        .populate("user_id", "user_name user_email")
        .populate("members", "user_name user_email");
    //   if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    //   }
    return result;
});
const updateProjectService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.ProjectModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    //   if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    //   }
    return result;
});
const deleteProjectService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield project_model_1.ProjectModel.findByIdAndDelete(id);
    //   if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    //   }
    return result;
});
exports.ProjectServices = {
    createProjectService,
    getAllProjectsService,
    getSingleProjectService,
    updateProjectService,
    deleteProjectService,
};
