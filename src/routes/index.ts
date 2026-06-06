import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { RoleRoutes } from '../modules/Role/role.route';
import { ProjectRoutes } from '../modules/Project/project.route';
import { TaskRoutes } from '../modules/Task/task.route';
import { ProgressTrackingRoutes } from '../modules/ProgressTracking/progressTracking.route';
import { DashboardRoutes } from '../modules/Dashboard/dashboard.route';

const router = Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: UserRoutes,
    },
    {
        path: '/role',
        route: RoleRoutes,
    },
    {
        path: '/project',
        route: ProjectRoutes,
    },
    {
        path: '/task',
        route: TaskRoutes,
    },
    {
        path: '/progress',
        route: ProgressTrackingRoutes,
    },
    {
        path: '/dashboard',
        route: DashboardRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;