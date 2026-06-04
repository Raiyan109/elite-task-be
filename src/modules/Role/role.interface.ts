export type TRoleName =
  | "admin"
  | "project_manager"
  | "team_member";

export interface IRole {
  _id?: string;

  name: TRoleName;

  description?: string;

  permissions: {
    project: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };

    task: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      assign: boolean;
      status_change: boolean;
    };

    team: {
      add_member: boolean;
      view_members: boolean;
    };

    dashboard: {
      view: boolean;
    };

    activity_log: {
      view: boolean;
    };
  };

  createdAt?: Date;
  updatedAt?: Date;
}