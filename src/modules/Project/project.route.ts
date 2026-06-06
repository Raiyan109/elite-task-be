import express from 'express';
import { auth } from '../../middlewares/auth';
import { ProjectControllers } from './project.controller';

const router = express.Router();

router
    .route("/")
    .post(auth("admin", "project_manager"), ProjectControllers.createProject)
    .get(auth("admin", "project_manager", "team_member"), ProjectControllers.getAllProjects);

router
    .route("/:id")
    .get(auth("admin", "project_manager", "team_member"), ProjectControllers.getSingleProject)
    .patch(auth("admin", "project_manager"), ProjectControllers.updateProject)
    .delete(auth("admin", "project_manager"), ProjectControllers.deleteProject);

router
    .route("/add-members/:projectId")
    .post(auth("admin", "project_manager"), ProjectControllers.addMembersToProject);

export const ProjectRoutes = router;