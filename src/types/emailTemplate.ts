export type IVerifyEmail = {
    name: string;
    email: string;
    otp: number;
};

export type IResetPassword = {
    email: string;
    otp: number;
};