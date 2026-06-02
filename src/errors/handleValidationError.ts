import mongoose from 'mongoose';
import { TErrorMessages, TGenericErrorResponse } from '../Interface/error';
import httpStatus from 'http-status';


const handleValidationError = (
    err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
    const errorMessages: TErrorMessages = Object.values(err.errors).map(
        (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
            return {
                path: val?.path,
                message: val?.message,
            };
        },
    );

    const statusCode = httpStatus.BAD_REQUEST;

    return {
        statusCode,
        message: 'Validation Error',
        errorMessages,
    };
};

export default handleValidationError;