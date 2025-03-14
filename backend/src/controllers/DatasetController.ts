import {
  JsonController,
  Get,
  Post,
  Param,
  UploadedFile,
  Body,
  HttpError,
  QueryParams,
  Put,
  HttpCode,
} from "routing-controllers";
import { Service } from "typedi";
import { DatasetService } from "../services/DatasetService";
import { apiResponse } from "../utils/helpers";
import { ApiError } from "../utils/ApiError";
import multer from "multer";
import logger from "../utils/logger";
import { SearchAndFilterDto } from "../dtos/SearchDto";
import { MetadataDto } from "../dtos/MetadataDto";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

@JsonController("/v1/datasets")
@Service()
export class DatasetController {
  constructor(private datasetService: DatasetService) {}

  @Post("/upload")
  async uploadDataset(
    @UploadedFile("file", { options: upload }) file: Express.Multer.File
  ) {
    logger.info(`Upload request received: ${file?.originalname || "No file"}`);

    try {
      if (!file) {
        logger.warn("Upload request without file");
        throw new ApiError(400, "No file uploaded");
      }

      const dataset = await this.datasetService.createDataset(file);

      logger.info(`File processed successfully: ${file.originalname}`);
      return apiResponse(dataset, "File uploaded and processed successfully");
    } catch (error: any) {
      if (error instanceof ApiError || error.isApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Unexpected error during file upload: ${error.message}`, {
        error,
      });
      throw new HttpError(500, `Error uploading file: ${error.message}`);
    }
  }

  /**
   * Upload a new version of an existing dataset
   */
  @Post("/:id/version")
  @HttpCode(200)
  async uploadNewVersion(
    @Param("id") id: string,
    @UploadedFile("file", { options: upload }) file: Express.Multer.File
  ) {
    logger.info(
      `New version upload request received for dataset ${id}: ${
        file?.originalname || "No file"
      }`
    );

    try {
      if (!file) {
        logger.warn("Upload request without file");
        throw new ApiError(400, "No file uploaded");
      }

      const dataset = await this.datasetService.createNewVersion(id, file);

      logger.info(`New version processed successfully: ${file.originalname}`);
      return apiResponse(
        dataset,
        "New version uploaded and processed successfully"
      );
    } catch (error: any) {
      logger.error(`Error during version upload: ${error.message}`, {
        error,
      });

      // Use a direct response instead of throwing HttpError
      if (error instanceof ApiError || error.isApiError) {
        return {
          success: false,
          message: error.message,
          status: error.status,
        };
      }

      return {
        success: false,
        message: `Error uploading new version: ${error.message}`,
        status: 500,
      };
    }
  }

  @Get("/")
  async getAllDatasets(@QueryParams() paginationDto: SearchAndFilterDto) {
    logger.info(`Request to get datasets ${JSON.stringify(paginationDto)}`);

    try {
      const { datasets, total } = await this.datasetService.getAllDatasets(
        paginationDto.page,
        paginationDto.limit,
        paginationDto.search,
        paginationDto.categories
      );

      logger.debug(
        `Returning ${datasets.length} datasets (page ${
          paginationDto.page
        } of ${Math.ceil(total / paginationDto.limit)})`
      );

      return apiResponse(
        {
          datasets,
          pagination: {
            total,
            page: paginationDto.page,
            limit: paginationDto.limit,
            pages: Math.ceil(total / paginationDto.limit),
          },
        },
        "Datasets retrieved successfully"
      );
    } catch (error: any) {
      if (error instanceof ApiError || error.isApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Error retrieving datasets: ${error.message}`, { error });
      throw new HttpError(500, `Error retrieving datasets: ${error.message}`);
    }
  }

  @Get("/filters")
  async getDatasetFilters() {
    logger.info("Request to get dataset filters");

    try {
      const filters = await this.datasetService.getDatasetFilters();
      return apiResponse(filters, "Dataset filters retrieved successfully");
    } catch (error: any) {
      if (error instanceof ApiError || error.isApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Error retrieving dataset filters: ${error.message}`, {
        error,
      });
      throw new HttpError(
        500,
        `Error retrieving dataset filters: ${error.message}`
      );
    }
  }

  @Get("/:id")
  async getDatasetById(@Param("id") id: string) {
    logger.info(`Request to get dataset by ID: ${id}`);

    try {
      const dataset = await this.datasetService.getDatasetById(id);
      logger.debug(`Dataset found: ${id}`);
      return apiResponse(dataset, "Dataset retrieved successfully");
    } catch (error: any) {
      if (error instanceof ApiError || error.isApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Error retrieving dataset ${id}: ${error.message}`, {
        error,
      });
      throw new HttpError(500, `Error retrieving dataset: ${error.message}`);
    }
  }

  @Put("/:id/metadata")
  async updateMetadata(@Param("id") id: string, @Body() metadata: MetadataDto) {
    logger.info(`Request to update metadata for dataset: ${id}`);

    try {
      const dataset = await this.datasetService.updateMetadata(id, metadata);
      return apiResponse(dataset, "Metadata updated successfully");
    } catch (error: any) {
      if (error instanceof ApiError || error.isApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(
        `Error updating metadata for dataset ${id}: ${error.message}`,
        {
          error,
        }
      );
      throw new HttpError(500, `Error updating metadata: ${error.message}`);
    }
  }
}
