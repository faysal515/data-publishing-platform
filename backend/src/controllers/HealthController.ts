import { JsonController, Get } from "routing-controllers";
import { Service } from "typedi";
import { apiResponse } from "../utils/helpers";
import logger from "../utils/logger";

@JsonController("/v1")
@Service()
export class DataController {
  constructor() {}

  @Get("/hello")
  getHello() {
    logger.info("Hello endpoint called");
    return apiResponse(
      { message: "Hello World" },
      "Hello endpoint called successfully"
    );
  }
}
