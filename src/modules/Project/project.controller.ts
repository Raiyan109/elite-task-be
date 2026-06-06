
import { ProjectServices } from "./project.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { RequestHandler } from "express";

const createProject: RequestHandler = async (req, res, next) => {
    try {
        const user = req.user;

        const payload = {
            ...req.body,
            user_id: user._id,
        };

        const result = await ProjectServices.createProjectService(payload);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Project created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllProjects: RequestHandler = async (req, res, next) => {
    try {
        const result = await ProjectServices.getAllProjectsService(req.query);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Projects retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getSingleProject: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await ProjectServices.getSingleProjectService(id);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Project retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateProject: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await ProjectServices.updateProjectService(id, req.body);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Project updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteProject: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await ProjectServices.deleteProjectService(id);

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Project deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const addMembersToProject: RequestHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { members } = req.body;

        const result = await ProjectServices.addMembersToProjectService(
            projectId,
            members
        );

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Members added to project successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const ProjectControllers = {
    createProject,
    getAllProjects,
    getSingleProject,
    updateProject,
    deleteProject,
    addMembersToProject,
};