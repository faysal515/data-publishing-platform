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
}

export interface Dataset {
  _id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  rowCount: number;
  columns: Array<{
    name: string;
    dataType: string;
    sampleValues: string[];
    _id: string;
  }>;
  filePath: string;
  status: string;
  metadata?: DatasetMetadata;
  ai_metadata?: DatasetMetadata;
  metadata_history: Array<{
    metadata: DatasetMetadata;
    created_by: string;
    created_at: string;
    comment?: string;
  }>;
  versions: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
