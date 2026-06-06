import express from 'express';
import { DashboardControllers } from './dashboard.controller';


const router = express.Router();

router.get("/kpi", DashboardControllers.getKpi);
router.get("/tasks-by-priority", DashboardControllers.tasksByPriority);
router.get("/task-status", DashboardControllers.taskStatusDistribution);
router.get("/project-progress", DashboardControllers.projectProgressTrend);
router.get("/team-productivity", DashboardControllers.teamProductivity);
// router.get("/recent-activities", DashboardControllers.getRecentActivities);
router.get("/upcoming-deadlines", DashboardControllers.getUpcomingDeadlines);
router.get("/high-priority", DashboardControllers.getHighPriorityTasks);
// router.get("/workload", DashboardControllers.getWorkloadSummary);

export const DashboardRoutes = router;