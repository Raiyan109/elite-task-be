import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { RoleRoutes } from '../modules/Role/role.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;