import { Service } from "typedi";
import { Dataset, IDataset } from "../models/Dataset";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";
import { DATASET_STATUS } from "../constants";
import { MetadataDto } from "../dtos/MetadataDto";
import { AiService } from "./aiService";
import { FileService, ProcessedFileData } from "./FileService";
interface VersionInfo {
  versionNumber: number;
  filePath: string;
  fileSize: number;
  fileType: string;
  originalFilename: string;
  uploadDate: Date;
  rowCount: number;
  columns: any[];
}

@Service()
export class DatasetService {
  constructor(private aiService: AiService, private fileService: FileService) {}

  async createDataset(file: Express.Multer.File): Promise<IDataset> {
    try {
      this.fileService.validateFile(file);
      const filePath = this.fileService.saveFile(file);

      const processedData = await this.fileService.processFile(
        filePath,
        file.originalname
      );

      const dataset = await this.saveDataset(processedData);

      this.triggerMetadataGeneration(dataset);

      return dataset;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new version of an existing dataset
   */
  async createNewVersion(
    id: string,
    file: Express.Multer.File
  ): Promise<IDataset> {
    try {
      const existingDataset = await Dataset.findById(id);
      if (!existingDataset) {
        throw new ApiError(404, "Dataset not found");
      }

      if (existingDataset.status !== DATASET_STATUS.APPROVED) {
        throw new ApiError(400, "Only approved datasets can have new versions");
      }

      this.fileService.validateFile(file);
      const filePath = this.fileService.saveFile(file);

      const processedData = await this.fileService.processFile(
        filePath,
        file.originalname
      );

      const versionInfo: VersionInfo = {
        versionNumber: (existingDataset.versions?.length || 0) + 1,
        filePath: existingDataset.filePath,
        fileSize: existingDataset.fileSize,
        fileType: existingDataset.fileType,
        originalFilename: existingDataset.originalFilename,
        uploadDate: existingDataset.uploadDate,
        rowCount: existingDataset.rowCount,
        columns: existingDataset.columns,
      };

      const updatedDataset = await Dataset.findByIdAndUpdate(
        id,
        {
          $set: {
            filename: processedData.filename,
            originalFilename: processedData.originalFilename,
            fileSize: processedData.fileSize,
            fileType: processedData.fileType,
            uploadDate: new Date(),
            rowCount: processedData.rowCount,
            columns: processedData.columns,
            filePath: processedData.filePath,
            currentVersion: (existingDataset.currentVersion || 1) + 1,
          },
          $push: {
            versions: versionInfo,
          },
        },
        { new: true }
      );

      if (!updatedDataset) {
        throw new ApiError(404, "Dataset not found after update");
      }

      logger.info(`New version created for dataset: ${id}`);
      return updatedDataset.toObject();
    } catch (error) {
      if (file && file.path) {
        this.fileService.deleteFile(file.path);
      }
      throw error;
    }
  }

  /**
   * Save dataset to database
   */
  private async saveDataset(data: ProcessedFileData): Promise<IDataset> {
    const dataset = new Dataset({
      ...data,
      status: DATASET_STATUS.PROCESSED,
    });

    await dataset.save();
    logger.info(`Dataset saved to database: ${dataset._id}`);
    return dataset.toObject();
  }

  /**
   * Trigger metadata generation using AI service
   */
  private async triggerMetadataGeneration(dataset: IDataset): Promise<void> {
    try {
      const sampleData = dataset.columns.map((col) => ({
        name: col.name,
        type: col.dataType,
        samples: col.sampleValues,
      }));

      // Convert sample data to string format with XML-like tags
      const datasetContent =
        `<filename>${dataset.originalFilename}</filename>\n\n` +
        `<data>${JSON.stringify(sampleData, null, 2)}</data>`;

      // Fire and forget - don't await
      this.aiService
        .generateDatasetMetadata(datasetContent)
        .then(async (metadata) => {
          await Dataset.findByIdAndUpdate(dataset._id, {
            $set: {
              metadata: metadata.object,
              status: DATASET_STATUS.METADATA_GENERATED,
            },
            $push: {
              metadata_history: {
                metadata: metadata.object,
                created_by: "AI",
                created_at: new Date(),
                comment: "",
              },
            },
          });
          logger.info(`Metadata generated for dataset: ${dataset._id}`);
        })
        .catch((error) => {
          logger.error(
            `Error generating metadata for dataset ${dataset._id}:`,
            error
          );
          Dataset.findByIdAndUpdate(dataset._id, {
            $set: { status: DATASET_STATUS.METADATA_FAILED },
          }).catch((err) =>
            logger.error(`Error updating dataset status: ${err.message}`)
          );
        });

      logger.info(`Triggered metadata generation for dataset: ${dataset._id}`);
    } catch (error: any) {
      logger.error(`Error triggering metadata generation: ${error.message}`);
    }
  }

  async getAllDatasets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categories?: string[]
  ): Promise<{ datasets: IDataset[]; total: number }> {
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (categories && categories.length > 0) {
      query.$or = categories.map((category) => ({
        $or: [
          { "metadata.category_en": category },
          { "metadata.category_ar": category },
        ],
      }));
    }

    const skip = (page - 1) * limit;
    const total = await Dataset.countDocuments(query);

    const sortCriteria: any = search
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    const datasets = await Dataset.find(
      query,
      search ? { score: { $meta: "textScore" } } : {}
    )
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    return {
      datasets: datasets.map((dataset) => dataset.toObject()),
      total,
    };
  }

  async getDatasetById(id: string): Promise<IDataset> {
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      throw new ApiError(404, "Dataset not found");
    }
    return dataset.toObject();
  }

  async updateMetadata(id: string, metadata: MetadataDto): Promise<IDataset> {
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      throw new ApiError(404, "Dataset not found");
    }

    try {
      let updateOperation: any = {
        $set: {
          metadata: metadata,
          status: metadata.status,
        },
      };

      const metadataHistory = dataset.metadata_history || [];

      if (
        metadata.status === DATASET_STATUS.CHANGES_REQUESTED &&
        metadataHistory.length > 0
      ) {
        const lastHistoryIndex = metadataHistory.length - 1;
        updateOperation.$set[`metadata_history.${lastHistoryIndex}.comment`] =
          metadata.comment;
      } else {
        const { role, comment, status, ...metadataFields } = metadata;
        updateOperation.$push = {
          metadata_history: {
            metadata: metadataFields,
            created_by: role,
            created_at: new Date(),
            comment: comment,
          },
        };
      }

      const updatedDataset = await Dataset.findByIdAndUpdate(
        id,
        updateOperation,
        { new: true }
      );

      if (!updatedDataset) {
        throw new ApiError(404, "Dataset not found after update");
      }

      return updatedDataset.toObject();
    } catch (error: any) {
      throw new ApiError(500, `Error updating metadata: ${error.message}`);
    }
  }

  async getDatasetFilters(): Promise<{
    statuses: string[];
    categories: string[];
  }> {
    try {
      const categoriesResult = await Dataset.distinct("metadata.category_en");
      const categories = categoriesResult.filter(
        (category) => category != null
      );
      const statuses = Object.values(DATASET_STATUS);

      return {
        categories,
        statuses,
      };
    } catch (error: any) {
      throw new ApiError(
        500,
        `Error fetching dataset filters: ${error.message}`
      );
    }
  }
}
