import { RequestHandler } from "express";
import { TaskServices } from "./task.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createTask: RequestHandler = async (req, res, next) => {
    try {
        const user = req.user;

        const payload = {
            ...req.body,
            user_id: user._id,
        };

        const result = await TaskServices.createTaskService(payload);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Task created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllTasks: RequestHandler = async (req, res, next) => {
    try {
        const result = await TaskServices.getAllTasksService();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Tasks retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getSingleTask: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await TaskServices.getSingleTaskService(id);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Task retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateTask: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await TaskServices.updateTaskService(id, req.body);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Task updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteTask: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await TaskServices.deleteTaskService(id);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Task deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const assignTaskToMembers: RequestHandler = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { members } = req.body;

    const result = await TaskServices.assignTaskToMembersService(
      taskId,
      members
    );

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Task assigned successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMemberWiseTasks: RequestHandler = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const result = await TaskServices.getMemberWiseTasksService(memberId);

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Member tasks retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkloadSummary: RequestHandler = async (req, res, next) => {
  try {
    const result = await TaskServices.getWorkloadSummaryService();

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Workload summary fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TaskControllers = {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    deleteTask,
    assignTaskToMembers,
    getMemberWiseTasks,
    getWorkloadSummary,
};