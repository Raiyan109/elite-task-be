import express from 'express';
import { ProgressTrackingControllers } from './progressTracking.controller';


const router = express.Router();

router.get("/overview", ProgressTrackingControllers.getDashboardOverview);
router.get("/projects", ProgressTrackingControllers.getProjectSummary);


export const ProgressTrackingRoutes = router;