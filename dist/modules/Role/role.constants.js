"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPermissions = void 0;
var AdminPermissions;
(function (AdminPermissions) {
    // Dashboard
    AdminPermissions["DASHBOARD_SHOW"] = "dashboard_permission";
    // Role permissions
    AdminPermissions["ROLE_VIEW"] = "is_role_view";
    AdminPermissions["ROLE_CREATE"] = "is_role_create";
    AdminPermissions["ROLE_UPDATE"] = "is_role_update";
    AdminPermissions["ROLE_DELETE"] = "is_role_delete";
})(AdminPermissions || (exports.AdminPermissions = AdminPermissions = {}));
