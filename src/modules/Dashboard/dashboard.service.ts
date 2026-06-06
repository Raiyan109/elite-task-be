import { ProjectModel } from "../Project/project.model";
import { TaskModel } from "../Task/task.model";

const getKpiService = async () => {
    const now = new Date();

    const [totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks] =
        await Promise.all([
            ProjectModel.countDocuments(),

            TaskModel.countDocuments(),

            TaskModel.countDocuments({ task_status: "completed" }),

            TaskModel.countDocuments({ task_status: { $ne: "completed" } }),

            TaskModel.countDocuments({
                task_status: { $ne: "completed" },
                task_dueDate: { $lt: now },
            }),
        ]);

    return {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
    };
};

const tasksByPriorityService = async () => {
    return TaskModel.aggregate([
        {
            $group: {
                _id: "$task_priority",
                count: { $sum: 1 },
            },
        },
    ]);
};

const taskStatusDistributionService = async () => {
    return TaskModel.aggregate([
        {
            $group: {
                _id: "$task_status",
                count: { $sum: 1 },
            },
        },
    ]);
};

const projectProgressTrendService = async () => {
    return ProjectModel.aggregate([
        {
            $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "project_id",
                as: "tasks",
            },
        },
        {
            $addFields: {
                total: { $size: "$tasks" },
                completed: {
                    $size: {
                        $filter: {
                            input: "$tasks",
                            as: "t",
                            cond: { $eq: ["$$t.task_status", "completed"] },
                        },
                    },
                },
            },
        },
        {
            $project: {
                project_name: 1,
                progress: {
                    $cond: [
                        { $gt: ["$total", 0] },
                        {
                            $multiply: [
                                { $divide: ["$completed", "$total"] },
                                100,
                            ],
                        },
                        0,
                    ],
                },
            },
        },
    ]);
};

const teamProductivityService = async () => {
    return TaskModel.aggregate([
        { $unwind: "$assignedMembers" },

        {
            $group: {
                _id: "$assignedMembers",

                totalTasks: { $sum: 1 },

                completedTasks: {
                    $sum: {
                        $cond: [
                            { $eq: ["$task_status", "completed"] },
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
                as: "user",
            },
        },

        { $unwind: "$user" },

        {
            $project: {
                name: "$user.user_name",
                email: "$user.user_email",
                totalTasks: 1,
                completedTasks: 1,

                productivity: {
                    $cond: [
                        { $gt: ["$totalTasks", 0] },
                        {
                            $multiply: [
                                {
                                    $divide: ["$completedTasks", "$totalTasks"],
                                },
                                100,
                            ],
                        },
                        0,
                    ],
                },
            },
        },
    ]);
};

// const getRecentActivitiesService = async () => {
//   return ActivityLogModel.find()
//     .populate("user_id", "user_name")
//     .sort({ createdAt: -1 })
//     .limit(10);
// };

const getUpcomingDeadlinesService = async () => {
    const now = new Date();

    return TaskModel.find({
        task_dueDate: { $gte: now },
        task_status: { $ne: "completed" },
    })
        .sort({ task_dueDate: 1 })
        .limit(10)
        .populate("project_id", "project_name");
};

const getHighPriorityTasksService = async () => {
    return TaskModel.find({
        task_priority: "high",
        task_status: { $ne: "completed" },
    })
        .populate("project_id", "project_name")
        .sort({ task_dueDate: 1 });
};

export const DashboardServices = {
    getKpiService,
    tasksByPriorityService,
    taskStatusDistributionService,
    projectProgressTrendService,
    teamProductivityService,
    // getRecentActivitiesService,
    getUpcomingDeadlinesService,
    getHighPriorityTasksService,
};