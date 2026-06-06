import AppError from "../../errors/AppError";
import { ITask } from "./task.interface";
import httpStatus from "http-status";
import { TaskModel } from "./task.model";

const createTaskService = async (payload: ITask): Promise<ITask> => {
    const { task_title, project_id, task_dueDate } = payload;

    // ❌ 1. Prevent past deadline
    const today = new Date();
    if (new Date(task_dueDate) < today) {
        throw new AppError(httpStatus.BAD_REQUEST, "Please select a valid deadline.");
    }

    // ❌ 2. Prevent duplicate task title inside same project
    const existingTask = await TaskModel.findOne({
        task_title,
        project_id,
    });

    if (existingTask) {
        throw new AppError(
            httpStatus.CONFLICT,
            "This task already exists in the project."
        );
    }

    const result = await TaskModel.create(payload);
    return result;
};

const getAllTasksService = async () => {
    const result = await TaskModel.find()
        .populate("project_id", "project_name")
        .populate("user_id", "user_name user_email")
        .populate("assignedMembers", "user_name user_email")
        .sort({ createdAt: -1 });

    return result;
};

const getSingleTaskService = async (id: string) => {
    const result = await TaskModel.findById(id)
        .populate("project_id")
        .populate("user_id")
        .populate("assignedMembers");

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    return result;
};

const updateTaskService = async (
    id: string,
    payload: Partial<ITask>
): Promise<ITask | null> => {
    const task = await TaskModel.findById(id);

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    // ❌ 1. Prevent completed task reassignment
    if (task.task_status === "completed" && payload.assignedMembers) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Completed tasks cannot be reassigned."
        );
    }

    // ❌ 2. Prevent past date update
    if (payload.task_dueDate) {
        if (new Date(payload.task_dueDate) < new Date()) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Please select a valid deadline."
            );
        }
    }

    // ❌ 3. Prevent duplicate title in same project
    if (payload.task_title) {
        const duplicate = await TaskModel.findOne({
            task_title: payload.task_title,
            project_id: task.project_id,
            _id: { $ne: id },
        });

        if (duplicate) {
            throw new AppError(
                httpStatus.CONFLICT,
                "This task already exists in the project."
            );
        }
    }

    const result = await TaskModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

const deleteTaskService = async (id: string) => {
    const result = await TaskModel.findByIdAndDelete(id);

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    return result;
};

export const TaskServices = {
    createTaskService,
    getAllTasksService,
    getSingleTaskService,
    updateTaskService,
    deleteTaskService,
};