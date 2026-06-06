/* eslint-disable @typescript-eslint/no-explicit-any */
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

// const getAllTasksService = async () => {
//     const result = await TaskModel.find()
//         .populate("project_id", "project_name")
//         .populate("user_id", "user_name user_email")
//         .populate("assignedMembers", "user_name user_email")
//         .sort({ createdAt: -1 });

//     return result;
// };

const getAllTasksService = async (query: Record<string, any>) => {
    const {
        search,
        status,
        priority,
        projectId,
        assignedMember,
        deadline,
        sortBy,
        sortOrder,
        page = 1,
        limit = 10,
    } = query;

    const filter: any = {};

    // 🔍 SEARCH (title + description)
    if (search) {
        filter.$or = [
            { task_title: { $regex: search, $options: "i" } },
            { task_description: { $regex: search, $options: "i" } },
        ];
    }

    // 📌 FILTER: status
    if (status) {
        filter.task_status = status;
    }

    // 📌 FILTER: priority
    if (priority) {
        filter.task_priority = priority;
    }

    // 📌 FILTER: project
    if (projectId) {
        filter.project_id = projectId;
    }

    // 👤 FILTER: assigned member
    if (assignedMember) {
        filter.assignedMembers = assignedMember;
    }

    // ⏰ FILTER: deadline status
    const now = new Date();

    if (deadline === "upcoming") {
        filter.task_dueDate = { $gte: now };
    }

    if (deadline === "overdue") {
        filter.task_dueDate = { $lt: now };
        filter.task_status = { $ne: "completed" };
    }

    // 📊 SORTING
    let sortCondition: any = { createdAt: -1 };

    if (sortBy === "latest") {
        sortCondition = { createdAt: -1 };
    }

    if (sortBy === "deadline") {
        sortCondition = { task_dueDate: sortOrder === "asc" ? 1 : -1 };
    }

    if (sortBy === "priority") {
        sortCondition = { task_priority: sortOrder === "asc" ? 1 : -1 };
    }

    if (sortBy === "updated") {
        sortCondition = { updatedAt: -1 };
    }

    // 📄 PAGINATION
    const skip = (Number(page) - 1) * Number(limit);

    const result = await TaskModel.find(filter)
        .populate("project_id", "project_name")
        .populate("user_id", "user_name user_email")
        .populate("assignedMembers", "user_name user_email")
        .sort(sortCondition)
        .skip(skip)
        .limit(Number(limit));

    const total = await TaskModel.countDocuments(filter);

    return {
        data: result,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
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

const assignTaskToMembersService = async (
    taskId: string,
    memberIds: string[]
) => {
    const task = await TaskModel.findById(taskId);

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    // ❌ rule: completed task cannot be modified
    if (task.task_status === "completed") {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Completed tasks cannot be reassigned."
        );
    }

    task.assignedMembers = memberIds as any;

    await task.save();

    return task;
};

const getMemberWiseTasksService = async (memberId: string) => {
    const tasks = await TaskModel.find({
        assignedMembers: memberId,
    })
        .populate("project_id", "project_name")
        .sort({ createdAt: -1 });

    return tasks;
};

const getWorkloadSummaryService = async () => {
    const result = await TaskModel.aggregate([
        {
            $unwind: "$assignedMembers",
        },
        {
            $group: {
                _id: "$assignedMembers",

                totalTasks: { $sum: 1 },

                completedTasks: {
                    $sum: {
                        $cond: [{ $eq: ["$task_status", "completed"] }, 1, 0],
                    },
                },

                pendingTasks: {
                    $sum: {
                        $cond: [
                            { $ne: ["$task_status", "completed"] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "member",
            },
        },
        {
            $unwind: "$member",
        },
        {
            $project: {
                memberId: "$_id",
                memberName: "$member.user_name",
                memberEmail: "$member.user_email",
                totalTasks: 1,
                completedTasks: 1,
                pendingTasks: 1,
            },
        },
    ]);

    return result;
};

export const TaskServices = {
    createTaskService,
    getAllTasksService,
    getSingleTaskService,
    updateTaskService,
    deleteTaskService,
    assignTaskToMembersService,
    getMemberWiseTasksService,
    getWorkloadSummaryService,
};