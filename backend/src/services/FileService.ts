import { Service } from "typedi";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { ApiError } from "../utils/ApiError";
import { IColumn } from "../models/Dataset";
import logger from "../utils/logger";

export interface ProcessedFileData {
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  rowCount: number;
  columns: IColumn[];
  filePath: string;
}

@Service()
export class FileService {
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

  saveFile(file: Express.Multer.File): string {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, file.buffer);
    logger.info(`File saved: ${file.originalname} -> ${filePath}`);
    return filePath;
  }

  async processFile(
    filePath: string,
    originalFilename: string
  ): Promise<ProcessedFileData> {
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

  private async processCSV(
    filePath: string,
    filename: string,
    originalFilename: string,
    fileSize: number
  ): Promise<ProcessedFileData> {
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
          headers.forEach((header) => {
            columns[header] = new Set();
          });
        })
        .on("data", (row) => {
          rowCount++;

          if (rows.length < 100) {
            rows.push(row);
          }

          Object.keys(row).forEach((key) => {
            if (
              columns[key] &&
              columns[key].size < 10 &&
              row[key] !== undefined &&
              row[key] !== null &&
              row[key] !== ""
            ) {
              columns[key].add(row[key]);
            }
          });
        })
        .on("end", () => {
          try {
            logger.info(
              `CSV parsing complete: ${originalFilename} (${rowCount} rows)`
            );

            const columnsMeta: IColumn[] = columnNames.map((name) => {
              const sampleValues = Array.from(columns[name] || []);
              const dataType = this.inferDataType(sampleValues);

              return {
                name,
                dataType,
                sampleValues: sampleValues.slice(0, 5),
              };
            });

            resolve({
              filename,
              originalFilename,
              fileSize,
              fileType: "csv",
              rowCount,
              columns: columnsMeta,
              filePath,
            });
          } catch (error: any) {
            logger.error(`Error processing CSV data: ${error.message}`, {
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

  private async processExcel(
    filePath: string,
    filename: string,
    originalFilename: string,
    fileSize: number
  ): Promise<ProcessedFileData> {
    logger.debug(`Processing Excel file: ${originalFilename}`);

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);
      const rowCount = rows.length;

      if (rowCount === 0) {
        throw new ApiError(400, "Excel file is empty");
      }

      const firstRow = rows[0] as Record<string, unknown>;
      const columnNames = Object.keys(firstRow);
      const columns: Record<string, Set<string>> = {};
      columnNames.forEach((name) => {
        columns[name] = new Set();
      });

      const rowsToProcess = rows.slice(0, 100);
      rowsToProcess.forEach((row) => {
        const typedRow = row as Record<string, unknown>;
        Object.keys(typedRow).forEach((key) => {
          if (
            columns[key] &&
            columns[key].size < 10 &&
            typedRow[key] !== undefined &&
            typedRow[key] !== null &&
            String(typedRow[key]) !== ""
          ) {
            columns[key].add(String(typedRow[key]));
          }
        });
      });

      const columnsMeta: IColumn[] = columnNames.map((name) => {
        const sampleValues = Array.from(columns[name] || []);
        const dataType = this.inferDataType(sampleValues);

        return {
          name,
          dataType,
          sampleValues: sampleValues.slice(0, 5),
        };
      });

      return {
        filename,
        originalFilename,
        fileSize,
        fileType: path.extname(originalFilename).substring(1),
        rowCount,
        columns: columnsMeta,
        filePath,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error processing Excel file: ${error.message}`, { error });
      throw new ApiError(400, `Error processing Excel file: ${error.message}`);
    }
  }

  private inferDataType(values: string[]): string {
    if (values.length === 0) return "string";

    const allNumbers = values.every(
      (value) => !isNaN(Number(value)) && value.trim() !== ""
    );
    if (allNumbers) return "number";

    const dateRegex =
      /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    const allDates = values.every((value) => dateRegex.test(value));
    if (allDates) return "date";

    const booleanValues = ["true", "false", "yes", "no", "0", "1", "Y", "N"];
    const allBooleans = values.every((value) =>
      booleanValues.includes(value.toLowerCase())
    );
    if (allBooleans) return "boolean";

    return "string";
  }

  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    }
  }
}
