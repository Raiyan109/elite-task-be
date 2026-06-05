"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/User/user.route");
const role_route_1 = require("../modules/Role/role.route");
const project_route_1 = require("../modules/Project/project.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/auth',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/role',
        route: role_route_1.RoleRoutes,
    },
    {
        path: '/project',
        route: project_route_1.ProjectRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
