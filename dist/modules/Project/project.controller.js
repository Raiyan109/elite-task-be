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
exports.ProjectControllers = void 0;
const project_service_1 = require("./project.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const createProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const payload = Object.assign(Object.assign({}, req.body), { user_id: user._id });
        const result = yield project_service_1.ProjectServices.createProjectService(payload);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.CREATED,
            message: "Project created successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
const getAllProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield project_service_1.ProjectServices.getAllProjectsService();
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Projects retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
const getSingleProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield project_service_1.ProjectServices.getSingleProjectService(id);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Project retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
const updateProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield project_service_1.ProjectServices.updateProjectService(id, req.body);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Project updated successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
const deleteProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield project_service_1.ProjectServices.deleteProjectService(id);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Project deleted successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.ProjectControllers = {
    createProject,
    getAllProjects,
    getSingleProject,
    updateProject,
    deleteProject,
};
