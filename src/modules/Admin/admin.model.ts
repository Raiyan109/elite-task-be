import { Schema, model } from "mongoose";
import { IAdminInterface, IExtendedAdminInterface } from "./admin.interface";
import bcrypt from "bcrypt";
import config from "../../config/index";

// admin Schema
const adminSchema = new Schema<IAdminInterface, IExtendedAdminInterface>(
  {
    admin_password: {
      type: String,
    },
    admin_name: {
      type: String,
    },
    admin_phone: {
      type: String,
    },
    admin_address: {
      type: String,
    },
    admin_role_id: {
      type: Schema.Types.ObjectId,
      ref: "roles",
    },
    admin_profile: {
      type: String,
    },
    admin_profile_key: {
      type: String,
    },
    admin_status: {
      type: String,
      enum: ["active", "in-active"],
      default: "active",
    },
    admin_publisher_id: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    admin_updated_by: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
  },
  {
    timestamps: true,
  }
);


adminSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  if (!this.isModified('admin_password')) {
    return next();
  }


  const admin = this; // doc
  // hashing password and save into DB
  admin.admin_password = await bcrypt.hash(
    admin.admin_password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
adminSchema.post('save', function (doc, next) {
  doc.admin_password = '';
  next();
});

adminSchema.statics.isAdminExistsByPhone = async function (admin_phone: string) {
  return await AdminModel.findOne({ admin_phone, isDeleted: { $ne: true } });
};

adminSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

const AdminModel = model<IAdminInterface, IExtendedAdminInterface>("admins", adminSchema);

export default AdminModel;