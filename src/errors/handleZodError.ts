import { ZodError, ZodIssue } from "zod";
import { TErrorMessages, TGenericErrorResponse } from "../Interface/error";
import httpStatus from "http-status";


const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorMessages: TErrorMessages = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  const statusCode = httpStatus.BAD_REQUEST;

  return {
    statusCode,
    message: 'Validation Error',
    errorMessages,
  };
};

export default handleZodError;