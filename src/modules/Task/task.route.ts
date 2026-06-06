import express from 'express';
import { auth } from '../../middlewares/auth';
import { TaskControllers } from './task.controller';

const router = express.Router();

router
    .route("/")
    .post(auth("admin", "project_manager"), TaskControllers.createTask)
    .get(auth("admin", "project_manager", "team_member"), TaskControllers.getAllTasks);

router
    .route("/:id")
    .get(auth("admin", "project_manager", "team_member"), TaskControllers.getSingleTask)
    .patch(auth("admin", "project_manager"), TaskControllers.updateTask)
    .delete(auth("admin", "project_manager"), TaskControllers.deleteTask);

export const TaskRoutes = router;