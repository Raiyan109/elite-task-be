import mongoose from "mongoose";
import { IRole } from "./role.interface";

const RoleSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      enum: ["admin", "project_manager", "team_member"],
    },

    description: {
      type: String,
    },

    permissions: {
      project: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },

      task: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        assign: { type: Boolean, default: false },
        status_change: { type: Boolean, default: false },
      },

      team: {
        add_member: { type: Boolean, default: false },
        view_members: { type: Boolean, default: false },
      },

      dashboard: {
        view: { type: Boolean, default: false },
      },

      activity_log: {
        view: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const RoleModel = mongoose.model<IRole>("roles", RoleSchema);