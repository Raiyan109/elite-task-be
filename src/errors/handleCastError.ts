import mongoose from 'mongoose';
import { TErrorMessages, TGenericErrorResponse } from '../Interface/error';
import httpStatus from 'http-status';

const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const errorMessages: TErrorMessages = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = httpStatus.BAD_REQUEST;

  return {
    statusCode,
    message: 'Cast Error',
    errorMessages,
  };
};

export default handleCastError;