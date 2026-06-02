/* eslint-disable  @typescript-eslint/no-explicit-any */

import httpStatus from "http-status";
import { TErrorMessages, TGenericErrorResponse } from "../Interface/error";


const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value within double quotes using regex
  const match = err.message.match(/"([^"]*)"/);

  // The extracted value will be in the first capturing group
  const extractedMessage = match && match[1];

  const errorMessages: TErrorMessages = [
    {
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = httpStatus.BAD_REQUEST;

  return {
    statusCode,
    message: 'Duplicate Entry',
    errorMessages,
  };
};

export default handleDuplicateError;