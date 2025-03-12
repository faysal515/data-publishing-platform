import mongoose, { Document, Schema } from "mongoose";

// Define the column information interface
export interface IColumn {
  name: string;
  dataType: string;
  sampleValues?: string[];
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
  status:
    | "uploaded"
    | "processed"
    | "metadata_generated"
    | "under_review"
    | "published";
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
    titleAr?: string;
    descriptionAr?: string;
    tagsAr?: string[];
    categoryAr?: string;
  };
  versions?: mongoose.Types.ObjectId[];
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
      enum: [
        "uploaded",
        "processed",
        "metadata_generated",
        "under_review",
        "published",
      ],
      default: "uploaded",
    },
    metadata: {
      title: { type: String },
      description: { type: String },
      tags: [{ type: String }],
      category: { type: String },
      titleAr: { type: String },
      descriptionAr: { type: String },
      tagsAr: [{ type: String }],
      categoryAr: { type: String },
    },
    versions: [{ type: Schema.Types.ObjectId, ref: "Dataset" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Convert main document _id
        if (ret._id && ret._id.buffer) {
          ret._id = ret._id.toString("hex");
        } else if (ret._id) {
          ret._id = ret._id.toString();
        }

        // Convert column _ids
        if (ret.columns && Array.isArray(ret.columns)) {
          ret.columns = ret.columns.map((column) => {
            if (column._id && column._id.buffer) {
              column._id = column._id.toString("hex");
            } else if (column._id) {
              column._id = column._id.toString();
            }
            return column;
          });
        }
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        // Convert main document _id
        if (ret._id && ret._id.buffer) {
          ret._id = ret._id.toString("hex");
        } else if (ret._id) {
          ret._id = ret._id.toString();
        }

        // Convert column _ids
        if (ret.columns && Array.isArray(ret.columns)) {
          ret.columns = ret.columns.map((column) => {
            if (column._id && column._id.buffer) {
              column._id = column._id.toString("hex");
            } else if (column._id) {
              column._id = column._id.toString();
            }
            return column;
          });
        }
        return ret;
      },
    },
  }
);

// Create and export the model
export const Dataset = mongoose.model<IDataset>("Dataset", DatasetSchema);
