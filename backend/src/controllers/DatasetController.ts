import {
  JsonController,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  Body,
  HttpError,
  QueryParams,
  Put,
} from "routing-controllers";
import { Service } from "typedi";
import { FileUploadService } from "../services/FileUploadService";
import { apiResponse } from "../utils/helpers";
import { ApiError } from "../utils/ApiError";
import multer from "multer";
import logger from "../utils/logger";
import { PaginationDto } from "../dtos/PaginationDto";
import { MetadataDto } from "../dtos/MetadataDto";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

@JsonController("/v1/datasets")
@Service()
export class DatasetController {
  constructor(private fileUploadService: FileUploadService) {}

  /**
   * Upload a new dataset file
   */
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

      this.fileUploadService.validateFile(file);

      const filePath = this.fileUploadService.saveFile(file);

      const dataset = await this.fileUploadService.processFile(
        filePath,
        file.originalname
      );

      logger.info(`File processed successfully: ${file.originalname}`);
      return apiResponse(dataset, "File uploaded and processed successfully");
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Unexpected error during file upload: ${error.message}`, {
        error,
      });
      throw new HttpError(500, `Error uploading file: ${error.message}`);
    }
  }

  /**
   * Get all datasets with pagination
   */
  @Get("/")
  async getAllDatasets(@QueryParams() paginationDto: PaginationDto) {
    logger.info(`Request to get datasets ${JSON.stringify(paginationDto)}`);

    try {
      const { datasets, total } = await this.fileUploadService.getAllDatasets(
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
      if (error instanceof ApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Error retrieving datasets: ${error.message}`, { error });
      throw new HttpError(500, `Error retrieving datasets: ${error.message}`);
    }
  }

  /**
   * Get dataset by ID
   */
  @Get("/:id")
  async getDatasetById(@Param("id") id: string) {
    logger.info(`Request to get dataset by ID: ${id}`);

    try {
      const dataset = await this.fileUploadService.getDatasetById(id);
      logger.debug(`Dataset found: ${id}`);
      return apiResponse(dataset, "Dataset retrieved successfully");
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Error retrieving dataset ${id}: ${error.message}`, {
        error,
      });
      throw new HttpError(500, `Error retrieving dataset: ${error.message}`);
    }
  }

  /**
   * Delete dataset by ID
   */
  @Delete("/:id")
  async deleteDataset(@Param("id") id: string) {
    logger.info(`Request to delete dataset: ${id}`);

    try {
      await this.fileUploadService.deleteDataset(id);
      logger.info(`Dataset deleted: ${id}`);
      return apiResponse(null, "Dataset deleted successfully");
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw new HttpError(error.status, error.message);
      }
      logger.error(`Error deleting dataset ${id}: ${error.message}`, { error });
      throw new HttpError(500, `Error deleting dataset: ${error.message}`);
    }
  }

  /**
   * Update dataset metadata
   */
  @Put("/:id/metadata")
  async updateMetadata(@Param("id") id: string, @Body() metadata: MetadataDto) {
    logger.info(`Request to update metadata for dataset: ${id}`);

    try {
      const dataset = await this.fileUploadService.updateMetadata(id, metadata);
      return apiResponse(dataset, "Metadata updated successfully");
    } catch (error: any) {
      if (error instanceof ApiError) {
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
