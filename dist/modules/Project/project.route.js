"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const project_controller_1 = require("./project.controller");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("admin", "project_manager"), project_controller_1.ProjectControllers.createProject)
    .get((0, auth_1.auth)("admin", "project_manager", "team_member"), project_controller_1.ProjectControllers.getAllProjects);
router
    .route("/:id")
    .get((0, auth_1.auth)("admin", "project_manager", "team_member"), project_controller_1.ProjectControllers.getSingleProject)
    .patch((0, auth_1.auth)("admin", "project_manager"), project_controller_1.ProjectControllers.updateProject)
    .delete((0, auth_1.auth)("admin", "project_manager"), project_controller_1.ProjectControllers.deleteProject);
exports.ProjectRoutes = router;
