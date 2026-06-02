import { Response } from 'express';

type TAuthResponse = {
    statusCode: number;
    success: boolean;
    message?: string;
};

const sendAuthResponse = (res: Response, data: TAuthResponse) => {
    res.status(data?.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
    });
};

export default sendAuthResponse;