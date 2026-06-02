// src/helpers/hashHelper.ts
import bcrypt from "bcrypt";

export const hashPassword = async (plainPassword: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
};

export const comparePassword = async (plainPassword: string, hashed: string) => {
    return await bcrypt.compare(plainPassword, hashed);
};
