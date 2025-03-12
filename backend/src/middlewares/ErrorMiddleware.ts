import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Service } from "typedi";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

@Middleware({ type: "after" })
@Service()
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: any, response: any, next: (err?: any) => any) {
    const isProduction = process.env.NODE_ENV === "production";

    // Log the error
    if (error instanceof ApiError) {
      logger.warn(`API Error: ${error.message}`, {
        status: error.status,
        details: error.details,
        path: request.path,
        method: request.method,
      });

      response.status(error.status).json({
        success: false,
        error: {
          message: error.message,
          details: error.details,
          ...(isProduction ? {} : { stack: error.stackTrace }),
        },
      });
    } else {
      // For unexpected errors, log with more details
      logger.error(`Unhandled Error: ${error.message}`, {
        stack: error.stack,
        path: request.path,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
      });

      response.status(500).json({
        success: false,
        error: {
          message: "Internal Server Error",
          ...(isProduction ? {} : { stack: error.stack }),
        },
      });
    }
  }
}
