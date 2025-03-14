import mongoose, { Document, Schema } from "mongoose";
import { DATASET_STATUS, DatasetStatus } from "../constants";

// Define the column information interface
export interface IColumn {
  name: string;
  dataType: string;
  sampleValues?: string[];
}

// Define the metadata interface
interface IMetadata {
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  tags?: string[];
  category_en?: string;
  category_ar?: string;
  subcategory_en?: string;
  subcategory_ar?: string;
}

// Define the metadata history entry interface
interface IMetadataHistoryEntry {
  metadata: IMetadata;
  created_by: string;
  created_at: Date;
  comment?: string;
}

// Define the version history entry interface
interface IVersionHistoryEntry {
  versionNumber: number;
  filePath: string;
  fileSize: number;
  fileType: string;
  originalFilename: string;
  uploadDate: Date;
  rowCount: number;
  columns: IColumn[];
}

// Define the dataset interface
export interface IDataset extends Document {
  _id: mongoose.Types.ObjectId;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  rowCount: number;
  columns: IColumn[];
  filePath: string;
  status: DatasetStatus;
  metadata?: IMetadata;
  metadata_history?: IMetadataHistoryEntry[];
  versions?: IVersionHistoryEntry[];
  currentVersion?: number;
}

// Create the schema
const DatasetSchema = new Schema<IDataset>(
  {
    filename: { type: String, required: true },
    originalFilename: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    rowCount: { type: Number, required: true },
    columns: [
      {
        name: { type: String, required: true },
        dataType: { type: String, required: true },
        sampleValues: [{ type: String }],
      },
    ],
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(DATASET_STATUS),
      default: DATASET_STATUS.UPLOADED,
    },
    metadata: {
      title_en: { type: String },
      title_ar: { type: String },
      description_en: { type: String },
      description_ar: { type: String },
      tags: [{ type: String }],
      category_en: { type: String },
      category_ar: { type: String },
      subcategory_en: { type: String },
      subcategory_ar: { type: String },
    },
    metadata_history: [
      {
        metadata: {
          title_en: { type: String },
          title_ar: { type: String },
          description_en: { type: String },
          description_ar: { type: String },
          tags: [{ type: String }],
          category_en: { type: String },
          category_ar: { type: String },
          subcategory_en: { type: String },
          subcategory_ar: { type: String },
        },
        created_by: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        comment: { type: String },
      },
    ],
    versions: [
      {
        versionNumber: { type: Number, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number, required: true },
        fileType: { type: String, required: true },
        originalFilename: { type: String, required: true },
        uploadDate: { type: Date, required: true },
        rowCount: { type: Number, required: true },
        columns: [
          {
            name: { type: String, required: true },
            dataType: { type: String, required: true },
            sampleValues: [{ type: String }],
          },
        ],
      },
    ],
    currentVersion: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Helper function to convert any _id to string
        const convertId = (obj: any) => {
          if (obj && obj._id) {
            if (obj._id.buffer) {
              obj._id = obj._id.toString("hex");
            } else {
              obj._id = obj._id.toString();
            }
          }
          return obj;
        };

        // Convert main document _id
        ret = convertId(ret);

        // Convert column _ids
        if (ret.columns && Array.isArray(ret.columns)) {
          ret.columns = ret.columns.map(convertId);
        }

        // Convert versions array and nested columns
        if (ret.versions && Array.isArray(ret.versions)) {
          ret.versions = ret.versions.map((version) => {
            // Convert version _id
            version = convertId(version);

            // Convert columns within version
            if (version.columns && Array.isArray(version.columns)) {
              version.columns = version.columns.map(convertId);
            }

            return version;
          });
        }

        // Convert metadata_history entries
        if (ret.metadata_history && Array.isArray(ret.metadata_history)) {
          ret.metadata_history = ret.metadata_history.map(convertId);
        }

        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        // Helper function to convert any _id to string
        const convertId = (obj: any) => {
          if (obj && obj._id) {
            if (obj._id.buffer) {
              obj._id = obj._id.toString("hex");
            } else {
              obj._id = obj._id.toString();
            }
          }
          return obj;
        };

        // Convert main document _id
        ret = convertId(ret);

        // Convert column _ids
        if (ret.columns && Array.isArray(ret.columns)) {
          ret.columns = ret.columns.map(convertId);
        }

        // Convert versions array and nested columns
        if (ret.versions && Array.isArray(ret.versions)) {
          ret.versions = ret.versions.map((version) => {
            // Convert version _id
            version = convertId(version);

            // Convert columns within version
            if (version.columns && Array.isArray(version.columns)) {
              version.columns = version.columns.map(convertId);
            }

            return version;
          });
        }

        // Convert metadata_history entries
        if (ret.metadata_history && Array.isArray(ret.metadata_history)) {
          ret.metadata_history = ret.metadata_history.map(convertId);
        }

        return ret;
      },
    },
  }
);

// Add text indexes for searchable fields
DatasetSchema.index({
  "metadata.title_en": "text",
  "metadata.title_ar": "text",
  "metadata.description_en": "text",
  "metadata.description_ar": "text",
  "metadata.tags": "text",
  originalFilename: "text",
  fileType: "text",
});

// Add regular indexes for category fields for exact matching
DatasetSchema.index({ "metadata.category_en": 1 });
DatasetSchema.index({ "metadata.category_ar": 1 });

// Create and export the model
export const Dataset = mongoose.model<IDataset>("Dataset", DatasetSchema);
