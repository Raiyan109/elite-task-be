import { ProjectModel } from "../Project/project.model";
import { TaskModel } from "../Task/task.model";

const getDashboardOverviewService = async () => {
    const now = new Date();

    // 🔹 1. Total Projects
    const totalProjects = await ProjectModel.countDocuments();

    // 🔹 2. Total Tasks
    const totalTasks = await TaskModel.countDocuments();

    // 🔹 3. Completed Tasks
    const completedTasks = await TaskModel.countDocuments({
        task_status: "completed",
    });

    // 🔹 4. Pending Tasks
    const pendingTasks = await TaskModel.countDocuments({
        task_status: { $ne: "completed" },
    });

    // 🔹 5. Overdue Tasks
    const overdueTasks = await TaskModel.countDocuments({
        task_status: { $ne: "completed" },
        task_dueDate: { $lt: now },
    });

    return {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
    };
};

const getProjectSummaryService = async () => {
  const now = new Date();

  const result = await ProjectModel.aggregate([
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
        totalTasks: { $size: "$tasks" },

        completedTasks: {
          $size: {
            $filter: {
              input: "$tasks",
              as: "task",
              cond: { $eq: ["$$task.task_status", "completed"] },
            },
          },
        },

        pendingTasks: {
          $size: {
            $filter: {
              input: "$tasks",
              as: "task",
              cond: { $ne: ["$$task.task_status", "completed"] },
            },
          },
        },

        completionPercentage: {
          $cond: [
            { $gt: [{ $size: "$tasks" }, 0] },
            {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: "$tasks",
                          as: "task",
                          cond: {
                            $eq: ["$$task.task_status", "completed"],
                          },
                        },
                      },
                    },
                    { $size: "$tasks" },
                  ],
                },
                100,
              ],
            },
            0,
          ],
        },

        isOverdue: {
          $lt: ["$project_deadline", now],
        },
      },
    },

    {
      $project: {
        project_name: 1,
        totalTasks: 1,
        completedTasks: 1,
        pendingTasks: 1,
        completionPercentage: 1,
        project_deadline: 1,
        isOverdue: 1,
      },
    },
  ]);

  return result;
};

export const ProgressTrackingServices = {
    getDashboardOverviewService,
    getProjectSummaryService,
}