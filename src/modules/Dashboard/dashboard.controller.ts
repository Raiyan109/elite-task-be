import { RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import { DashboardServices } from "./dashboard.service";
import httpStatus from "http-status";

const getKpi: RequestHandler = async (req, res, next) => {
    try {
        const result = await DashboardServices.getKpiService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "KPI data fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const tasksByPriority: RequestHandler = async (req, res, next) => {
    try {
        const result = await DashboardServices.tasksByPriorityService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Tasks by priority fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


const taskStatusDistribution: RequestHandler = async (req, res, next) => {
    try {
        const result =
            await DashboardServices.taskStatusDistributionService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Task status distribution fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const projectProgressTrend: RequestHandler = async (req, res, next) => {
    try {
        const result =
            await DashboardServices.projectProgressTrendService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Project progress fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const teamProductivity: RequestHandler = async (req, res, next) => {
    try {
        const result =
            await DashboardServices.teamProductivityService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Team productivity fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// const getRecentActivities: RequestHandler = async (req, res, next) => {
//     try {
//         const result =
//             await DashboardServices.getRecentActivitiesService();

//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.OK,
//             message: "Recent activities fetched successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const getUpcomingDeadlines: RequestHandler = async (req, res, next) => {
    try {
        const result =
            await DashboardServices.getUpcomingDeadlinesService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Upcoming deadlines fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getHighPriorityTasks: RequestHandler = async (req, res, next) => {
    try {
        const result =
            await DashboardServices.getHighPriorityTasksService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "High priority tasks fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// const getWorkloadSummary: RequestHandler = async (req, res, next) => {
//     try {
//         const result =
//             await DashboardServices.getWorkloadSummaryService();

//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.OK,
//             message: "Workload summary fetched successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };


export const DashboardControllers = {
  getKpi,
  tasksByPriority,
  taskStatusDistribution,
  projectProgressTrend,
  teamProductivity,
//   getRecentActivities,
  getUpcomingDeadlines,
  getHighPriorityTasks,
//   getWorkloadSummary,
};