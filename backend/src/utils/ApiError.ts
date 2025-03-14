export class ApiError extends Error {
  public status: number;
  public details?: any;
  public stackTrace?: string;
  public isApiError: boolean = true;

  constructor(
    status: number,
    message: string,
    details?: any,
    includeStackTrace: boolean = false
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);

    if (includeStackTrace && this.stack) {
      this.stackTrace = this.stack;
    }
  }
}
