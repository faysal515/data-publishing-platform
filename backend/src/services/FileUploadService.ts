import { Service } from "typedi";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { ApiError } from "../utils/ApiError";
import { Dataset, IColumn, IDataset } from "../models/Dataset";
import logger from "../utils/logger";
import { generateDatasetMetadata } from "./aiService";
import { DATASET_STATUS } from "../constants";
import { MetadataDto } from "../dtos/MetadataDto";

@Service()
export class FileUploadService {
  private readonly uploadDir: string;
  private readonly allowedFileTypes = [".csv", ".xlsx", ".xls"];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      logger.info(`Created uploads directory at ${this.uploadDir}`);
    }
  }

  validateFile(file: Express.Multer.File): void {
    if (file.size > this.maxFileSize) {
      logger.warn(
        `File size validation failed: ${file.originalname} (${file.size} bytes)`
      );
      throw new ApiError(
        400,
        `File size exceeds the limit of ${this.maxFileSize / (1024 * 1024)}MB`
      );
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!this.allowedFileTypes.includes(fileExt)) {
      logger.warn(
        `File type validation failed: ${file.originalname} (${fileExt})`
      );
      throw new ApiError(
        400,
        `Invalid file type. Allowed types: ${this.allowedFileTypes.join(", ")}`
      );
    }

    logger.debug(
      `File validation passed: ${file.originalname} (${file.size} bytes, ${fileExt})`
    );
  }

  /**
   * Saves the file to disk and returns the file path
   */
  saveFile(file: Express.Multer.File): string {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, file.buffer);
    logger.info(`File saved: ${file.originalname} -> ${filePath}`);
    return filePath;
  }

  /**
   * Processes the file and extracts metadata
   */
  async processFile(
    filePath: string,
    originalFilename: string
  ): Promise<IDataset> {
    const fileExt = path.extname(filePath).toLowerCase();
    const fileSize = fs.statSync(filePath).size;
    const filename = path.basename(filePath);

    logger.info(
      `Processing file: ${originalFilename} (${fileExt}, ${fileSize} bytes)`
    );

    try {
      if (fileExt === ".csv") {
        return await this.processCSV(
          filePath,
          filename,
          originalFilename,
          fileSize
        );
      } else if (fileExt === ".xlsx" || fileExt === ".xls") {
        return await this.processExcel(
          filePath,
          filename,
          originalFilename,
          fileSize
        );
      } else {
        throw new ApiError(400, "Unsupported file format");
      }
    } catch (error: any) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted file after processing error: ${filePath}`);
      }

      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error processing file: ${error.message}`, { error });
      throw new ApiError(500, `Error processing file: ${error.message}`);
    }
  }

  private async triggerMetadataGeneration(dataset: IDataset): Promise<void> {
    try {
      // Get sample data for AI processing
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
      generateDatasetMetadata(datasetContent)
        .then(async (metadata) => {
          // Update dataset with generated metadata
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
          // Update status to indicate metadata generation failed
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

  /**
   * Process CSV file and extract metadata
   */
  private async processCSV(
    filePath: string,
    filename: string,
    originalFilename: string,
    fileSize: number
  ): Promise<IDataset> {
    logger.debug(`Processing CSV file: ${originalFilename}`);

    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      const columns: Record<string, Set<string>> = {};
      let rowCount = 0;
      let columnNames: string[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("headers", (headers) => {
          columnNames = headers;
          logger.debug(`CSV headers detected: ${headers.join(", ")}`);
          headers.forEach((header) => {
            columns[header] = new Set();
          });
        })
        .on("data", (row) => {
          rowCount++;

          if (rows.length < 100) {
            rows.push(row);
          }

          // Debug log for the first 5 rows
          if (rowCount <= 5) {
            logger.debug(`CSV Row ${rowCount} data: ${JSON.stringify(row)}`);
          }

          Object.keys(row).forEach((key) => {
            // Debug the condition evaluation
            logger.debug(
              `Checking column "${key}": exists=${!!columns[key]}, size=${
                columns[key]?.size || "N/A"
              }, value=${row[key] || "empty"}`
            );

            // Modified condition to handle empty strings and zero values
            if (
              columns[key] &&
              columns[key].size < 10 &&
              row[key] !== undefined &&
              row[key] !== null &&
              row[key] !== ""
            ) {
              columns[key].add(row[key]);
              // Debug log when adding sample values
              if (columns[key].size <= 3) {
                logger.debug(
                  `Added sample value for column "${key}": "${row[key]}"`
                );
              }
            } else if (
              columns[key] &&
              (row[key] === "" || row[key] === null || row[key] === undefined)
            ) {
              // Special debug for empty values
              logger.debug(
                `Skipped empty/null value for column "${key}": ${row[key]}`
              );
            }
          });
        })
        .on("end", async () => {
          try {
            logger.info(
              `CSV parsing complete: ${originalFilename} (${rowCount} rows)`
            );

            // Debug log for sample values collected for each column
            Object.keys(columns).forEach((colName) => {
              const values = Array.from(columns[colName] || []);
              logger.debug(
                `Column "${colName}" collected ${
                  values.length
                } sample values: ${JSON.stringify(values)}`
              );
            });

            const columnsMeta: IColumn[] = columnNames.map((name) => {
              const sampleValues = Array.from(columns[name] || []);
              const dataType = this.inferDataType(sampleValues);

              logger.debug(
                `Column "${name}": inferred type "${dataType}" from ${sampleValues.length} samples`
              );

              return {
                name,
                dataType,
                sampleValues: sampleValues.slice(0, 5), // Store up to 5 sample values
              };
            });

            // Log the final column metadata to verify sample values are included
            logger.debug(
              `Final column metadata: ${JSON.stringify(columnsMeta)}`
            );

            const dataset = new Dataset({
              filename,
              originalFilename,
              fileSize,
              fileType: "csv",
              rowCount,
              columns: columnsMeta,
              filePath,
              status: DATASET_STATUS.PROCESSED,
            });

            await dataset.save();
            logger.info(`Dataset saved to database: ${dataset._id}`);

            // Trigger metadata generation asynchronously
            this.triggerMetadataGeneration(dataset.toObject());

            resolve(dataset.toObject());
          } catch (error: any) {
            logger.error(`Error saving CSV dataset: ${error.message}`, {
              error,
            });
            reject(error);
          }
        })
        .on("error", (error) => {
          logger.error(`CSV parsing error: ${error.message}`, { error });
          reject(new ApiError(400, `Error parsing CSV: ${error.message}`));
        });
    });
  }

  /**
   * Process Excel file and extract metadata
   */
  private async processExcel(
    filePath: string,
    filename: string,
    originalFilename: string,
    fileSize: number
  ): Promise<IDataset> {
    logger.debug(`Processing Excel file: ${originalFilename}`);

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      logger.debug(`Excel sheet detected: ${sheetName}`);

      const rows = XLSX.utils.sheet_to_json(worksheet);
      const rowCount = rows.length;

      if (rowCount === 0) {
        throw new ApiError(400, "Excel file is empty");
      }

      logger.info(
        `Excel parsing complete: ${originalFilename} (${rowCount} rows)`
      );

      // Debug log for the first row
      logger.debug(`Excel first row data: ${JSON.stringify(rows[0])}`);

      const firstRow = rows[0] as Record<string, unknown>;
      const columnNames = Object.keys(firstRow);

      logger.debug(`Excel columns detected: ${columnNames.join(", ")}`);

      const columns: Record<string, Set<string>> = {};
      columnNames.forEach((name) => {
        columns[name] = new Set();
      });

      const rowsToProcess = rows.slice(0, 100);

      // Debug log for sample rows
      logger.debug(`Processing ${rowsToProcess.length} rows for sample values`);

      rowsToProcess.forEach((row, index) => {
        const typedRow = row as Record<string, unknown>;

        // Debug log for the first 5 rows
        if (index < 5) {
          logger.debug(
            `Excel Row ${index + 1} data: ${JSON.stringify(typedRow)}`
          );
        }

        Object.keys(typedRow).forEach((key) => {
          // Debug the condition evaluation
          const valueStr =
            typedRow[key] !== undefined ? String(typedRow[key]) : "undefined";
          logger.debug(
            `Checking Excel column "${key}": exists=${!!columns[key]}, size=${
              columns[key]?.size || "N/A"
            }, value=${valueStr}`
          );

          // Modified condition to handle empty strings and zero values
          if (
            columns[key] &&
            columns[key].size < 10 &&
            typedRow[key] !== undefined &&
            typedRow[key] !== null &&
            String(typedRow[key]) !== ""
          ) {
            const stringValue = String(typedRow[key]);
            columns[key].add(stringValue);

            // Debug log when adding sample values
            if (columns[key].size <= 3) {
              logger.debug(
                `Added sample value for column "${key}": "${stringValue}"`
              );
            }
          } else if (
            columns[key] &&
            (typedRow[key] === undefined ||
              typedRow[key] === null ||
              String(typedRow[key]) === "")
          ) {
            // Special debug for empty values
            logger.debug(
              `Skipped empty/null value for Excel column "${key}": ${typedRow[key]}`
            );
          }
        });
      });

      // Debug log for sample values collected for each column
      Object.keys(columns).forEach((colName) => {
        const values = Array.from(columns[colName] || []);
        logger.debug(
          `Column "${colName}" collected ${
            values.length
          } sample values: ${JSON.stringify(values)}`
        );
      });

      const columnsMeta: IColumn[] = columnNames.map((name) => {
        const sampleValues = Array.from(columns[name] || []);
        const dataType = this.inferDataType(sampleValues);

        logger.debug(
          `Column "${name}": inferred type "${dataType}" from ${sampleValues.length} samples`
        );

        return {
          name,
          dataType,
          sampleValues: sampleValues.slice(0, 5), // Store up to 5 sample values
        };
      });

      // Log the final column metadata to verify sample values are included
      logger.debug(
        `Final Excel column metadata: ${JSON.stringify(columnsMeta)}`
      );

      const dataset = new Dataset({
        filename,
        originalFilename,
        fileSize,
        fileType: path.extname(originalFilename).substring(1),
        rowCount,
        columns: columnsMeta,
        filePath,
        status: DATASET_STATUS.PROCESSED,
      });

      await dataset.save();
      logger.info(`Dataset saved to database: ${dataset._id}`);

      // Trigger metadata generation asynchronously
      this.triggerMetadataGeneration(dataset.toObject());

      return dataset.toObject();
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error processing Excel file: ${error.message}`, { error });
      throw new ApiError(400, `Error processing Excel file: ${error.message}`);
    }
  }

  /**
   * Infer the data type of a column based on sample values
   */
  private inferDataType(values: string[]): string {
    logger.debug(
      `Inferring data type from ${values.length} values: ${JSON.stringify(
        values
      )}`
    );

    if (values.length === 0) {
      logger.debug('No values provided, defaulting to "string" type');
      return "string";
    }

    const allNumbers = values.every(
      (value) => !isNaN(Number(value)) && value.trim() !== ""
    );
    if (allNumbers) {
      logger.debug('All values are numbers, setting type to "number"');
      return "number";
    }

    const dateRegex =
      /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    const allDates = values.every((value) => dateRegex.test(value));
    if (allDates) {
      logger.debug('All values match date pattern, setting type to "date"');
      return "date";
    }

    const booleanValues = ["true", "false", "yes", "no", "0", "1", "Y", "N"];
    const allBooleans = values.every((value) =>
      booleanValues.includes(value.toLowerCase())
    );
    if (allBooleans) {
      logger.debug('All values are boolean-like, setting type to "boolean"');
      return "boolean";
    }

    logger.debug(
      'Values do not match specific type patterns, defaulting to "string"'
    );
    return "string";
  }

  /**
   * Get all datasets with pagination
   * @param page Page number (1-indexed)
   * @param limit Number of items per page
   * @param search Search term
   * @param categories Array of category filters
   * @returns Object containing datasets array and total count
   */
  async getAllDatasets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categories?: string[]
  ): Promise<{ datasets: IDataset[]; total: number }> {
    logger.debug(
      `Fetching datasets with pagination: page ${page}, limit ${limit}, search: ${search}, categories: ${categories?.join(
        ", "
      )}`
    );

    // Build query
    const query: any = {};

    // Add text search if search term is provided
    if (search) {
      query.$text = { $search: search };
    }

    // Add categories filter if provided
    if (categories && categories.length > 0) {
      query.$or = categories.map((category) => ({
        $or: [
          { "metadata.category_en": category },
          { "metadata.category_ar": category },
        ],
      }));
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute count query for total
    logger.debug(`Counting datasets with query: ${JSON.stringify(query)}`);
    const total = await Dataset.countDocuments(query);

    // Execute find query with pagination
    // If using text search, sort by text score first, then creation date
    const sortCriteria: any = search
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    const datasets = await Dataset.find(
      query,
      search ? { score: { $meta: "textScore" } } : {} // Include text score in results if searching
    )
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    logger.debug(
      `Retrieved ${datasets.length} datasets (page ${page}, total ${total})`
    );

    return {
      datasets: datasets.map((dataset) => dataset.toObject()),
      total,
    };
  }

  /**
   * Get dataset by ID
   */
  async getDatasetById(id: string): Promise<IDataset> {
    logger.debug(`Fetching dataset by ID: ${id}`);
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      logger.warn(`Dataset not found: ${id}`);
      throw new ApiError(404, "Dataset not found");
    }
    return dataset.toObject();
  }

  /**
   * Delete dataset by ID
   */
  async deleteDataset(id: string): Promise<void> {
    logger.debug(`Deleting dataset: ${id}`);
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      logger.warn(`Dataset not found for deletion: ${id}`);
      throw new ApiError(404, "Dataset not found");
    }

    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
      logger.info(`Deleted file: ${dataset.filePath}`);
    }

    await Dataset.findByIdAndDelete(id);
    logger.info(`Dataset deleted from database: ${id}`);
  }

  /**
   * Update dataset metadata and add to history
   */
  async updateMetadata(id: string, metadata: MetadataDto): Promise<IDataset> {
    logger.debug(`Updating metadata for dataset: ${id}`);

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      logger.warn(`Dataset not found: ${id}`);
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

      // If status is changes_requested and there's existing history
      if (
        metadata.status === DATASET_STATUS.CHANGES_REQUESTED &&
        metadataHistory.length > 0
      ) {
        // Update the last history entry with the review comment
        const lastHistoryIndex = metadataHistory.length - 1;
        updateOperation.$set[`metadata_history.${lastHistoryIndex}.comment`] =
          metadata.comment;
      } else {
        // Add new history entry
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

      logger.info(`Metadata updated for dataset: ${id}`);
      return updatedDataset.toObject();
    } catch (error: any) {
      logger.error(`Error updating metadata: ${error.message}`, { error });
      throw new ApiError(500, `Error updating metadata: ${error.message}`);
    }
  }

  /**
   * Get dataset filters (statuses and categories)
   */
  async getDatasetFilters(): Promise<{
    statuses: string[];
    categories: string[];
  }> {
    logger.debug("Fetching dataset filters");

    try {
      // Get all unique categories from metadata
      const categoriesResult = await Dataset.distinct("metadata.category_en");
      const categories = categoriesResult.filter(
        (category) => category != null
      );

      // Get all statuses from constants
      const statuses = Object.values(DATASET_STATUS);

      logger.debug(
        `Found ${categories.length} categories and ${statuses.length} statuses`
      );

      return {
        categories,
        statuses,
      };
    } catch (error: any) {
      logger.error(`Error fetching dataset filters: ${error.message}`, {
        error,
      });
      throw new ApiError(
        500,
        `Error fetching dataset filters: ${error.message}`
      );
    }
  }
}
