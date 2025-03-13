import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Service } from "typedi";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";
import { ValidationError } from "class-validator";

@Middleware({ type: "after" })
@Service()
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: any, response: any, next: (err?: any) => any) {
    const isProduction = process.env.NODE_ENV === "production";

    // Handle validation errors
    if (error?.errors?.length && error.errors[0] instanceof ValidationError) {
      const validationErrors = error.errors.reduce(
        (acc: any, err: ValidationError) => {
          if (err.constraints) {
            acc[err.property] = Object.values(err.constraints);
          }
          return acc;
        },
        {}
      );

      logger.warn(`Validation Error`, {
        errors: validationErrors,
        path: request.path,
        method: request.method,
      });

      return response.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details: validationErrors,
        },
      });
    }

    // Handle API errors
    if (error instanceof ApiError) {
      logger.warn(`API Error: ${error.message}`, {
        status: error.status,
        details: error.details,
        path: request.path,
        method: request.method,
      });

      return response.status(error.status).json({
        success: false,
        error: {
          message: error.message,
          details: error.details,
          ...(isProduction ? {} : { stack: error.stackTrace }),
        },
      });
    }

    // For unexpected errors, log with more details
    logger.error(`Unhandled Error: ${error.message}`, {
      stack: error.stack,
      path: request.path,
      method: request.method,
      body: request.body,
      params: request.params,
      query: request.query,
    });

    return response.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error",
        ...(isProduction ? {} : { stack: error.stack }),
      },
    });
  }
}
