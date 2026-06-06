import { RequestHandler } from "express";
import { ProgressTrackingServices } from "./progressTracking.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getDashboardOverview: RequestHandler = async (req, res, next) => {
    try {
        const result = await ProgressTrackingServices.getDashboardOverviewService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Dashboard overview fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getProjectSummary: RequestHandler = async (req, res, next) => {
  try {
    const result = await ProgressTrackingServices.getProjectSummaryService();

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Project summary fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ProgressTrackingControllers = {
    getDashboardOverview,
    getProjectSummary,
};