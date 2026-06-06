import express from 'express';
import { auth } from '../../middlewares/auth';
import { TaskControllers } from './task.controller';

const router = express.Router();

router
    .route("/")
    .post(auth("admin", "project_manager"), TaskControllers.createTask)
    .get(auth("admin", "project_manager", "team_member"), TaskControllers.getAllTasks);

router
    .route("/workload-summary")
    .get(auth("admin", "project_manager"), TaskControllers.getWorkloadSummary);

router
    .route("/:id")
    .get(auth("admin", "project_manager", "team_member"), TaskControllers.getSingleTask)
    .patch(auth("admin", "project_manager"), TaskControllers.updateTask)
    .delete(auth("admin", "project_manager"), TaskControllers.deleteTask);

router
    .route("/assign-members/:taskId")
    .post(auth("admin", "project_manager"), TaskControllers.assignTaskToMembers);

router
    .route("/member/:memberId")
    .get(auth("admin", "project_manager", "team_member"), TaskControllers.getMemberWiseTasks);



export const TaskRoutes = router;