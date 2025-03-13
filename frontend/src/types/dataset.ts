export interface Column {
  name: string;
  dataType: string;
  sampleValues: string[];
  _id: any; // We'll keep this as any since we don't need to use the buffer
}

export interface DatasetMetadata {
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  tags?: string[];
  category_en?: string;
  category_ar?: string;
  subcategory_en?: string;
  subcategory_ar?: string;
  status?: "approved" | "changes_requested" | "under_review";
  role?: "editor" | "admin" | "ai";
  comment?: string;
}

export interface MetadataHistoryEntry {
  comment: string;
  created_by: string;
  created_at: string;
}

export interface Dataset {
  _id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  rowCount: number;
  columns: string[];
  filePath: string;
  status: DatasetStatus;
  metadata: DatasetMetadata;
  ai_metadata: DatasetMetadata;
  metadata_history?: MetadataHistoryEntry[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type DatasetStatus =
  | "uploaded"
  | "processed"
  | "metadata_generated"
  | "metadata_failed"
  | "under_review"
  | "changes_requested"
  | "approved";
