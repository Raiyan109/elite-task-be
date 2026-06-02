import jwt from 'jsonwebtoken';

export const createToken = (
    jwtPayload: { _id?: string; user_phone?: string; user_email?: string; admin_phone?: string; admin_status?: "active" | "in-active"; role?: string; },
    secret: string,
    // expiresIn: string | number,
    //expiresIn: SignOptions['expiresIn']
) => {
    // const signOptions: SignOptions = {
    //     expiresIn, // now it's typed correctly
    //   };
    // return jwt.sign(jwtPayload, secret, {
    //     expiresIn: expiresIn as string | number,
    // });
    return jwt.sign(jwtPayload, secret, /*signOptions*/);
};

