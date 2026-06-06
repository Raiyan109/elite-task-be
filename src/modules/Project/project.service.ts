/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errors/AppError";
import { IProject } from "./project.interface";
import { ProjectModel } from "./project.model";
import httpStatus from "http-status";

const createProjectService = async (payload: IProject): Promise<IProject> => {
    const result = await ProjectModel.create(payload);
    return result;
};

const getAllProjectsService = async () => {
    const result = await ProjectModel.find()
        .populate("user_id", "user_name user_email")
        .populate("members", "user_name user_email")
        .sort({ createdAt: -1 });

    return result;
};

const getSingleProjectService = async (id: string) => {
    const result = await ProjectModel.findById(id)
        .populate("user_id", "user_name user_email")
        .populate("members", "user_name user_email");

    //   if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    //   }

    return result;
};

const updateProjectService = async (
    id: string,
    payload: Partial<IProject>
): Promise<IProject | null> => {
    const result = await ProjectModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    //   if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    //   }

    return result;
};

const deleteProjectService = async (id: string) => {
    const result = await ProjectModel.findByIdAndDelete(id);

    //   if (!result) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    //   }

    return result;
};

const addMembersToProjectService = async (
    projectId: string,
    memberIds: string[]
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    }

    // avoid duplicates
    const existingMemberIds = Array.isArray(project.members)
        ? project.members.map((m) => m.toString())
        : [];

    const updatedMembers = Array.from(
        new Set([
            ...existingMemberIds,
            ...memberIds,
        ])
    );

    project.members = updatedMembers as any;

    await project.save();

    return project;
};

export const ProjectServices = {
    createProjectService,
    getAllProjectsService,
    getSingleProjectService,
    updateProjectService,
    deleteProjectService,
    addMembersToProjectService,
};