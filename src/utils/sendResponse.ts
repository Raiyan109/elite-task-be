import { Response } from 'express';

type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
    totalData?: number;
    pagination?: {
    currentPage: number;
    limit: number;
    totalPage: number;
    // total: number;
  };
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data?.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
        data: data.data,
        totalData: data.totalData,
        pagination: data.pagination,
    });
};

export default sendResponse;