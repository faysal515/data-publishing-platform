export interface Column {
  name: string;
  dataType: string;
  sampleValues: string[];
  _id: any; // We'll keep this as any since we don't need to use the buffer
}

export interface Dataset {
  filename: string;
  originalFilename: string;
  fileSize: number;
  fileType: string;
  rowCount: number;
  columns: Column[];
  filePath: string;
  status:
    | "uploaded"
    | "processed"
    | "metadata_generated"
    | "under_review"
    | "published";
  metadata: {
    title?: string;
    description?: string;
    tags: string[];
    category?: string;
    titleAr?: string;
    descriptionAr?: string;
    tagsAr: string[];
    categoryAr?: string;
  };
  versions: string[];
  _id: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
