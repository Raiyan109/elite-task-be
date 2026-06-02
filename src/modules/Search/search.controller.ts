import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import { SearchServices } from './search.service';
import sendResponse from '../../utils/sendResponse';


// POST: Create a new search
export const postSearch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const user = req.user;
    console.log(user, 'user from search controller');

    const payload = {
        ...req.body,
        user_id: user._id, // attach authenticated user id
    };

    const result = await SearchServices.postSearchService(payload);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'Search entry created successfully',
        data: result,
    });
};

// GET: Get search history for a user
export const getSearchesByUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { user_id } = req.params;

    const result = await SearchServices.getSearchesByUserService(user_id);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Search history fetched successfully',
        data: result,
    });
};
