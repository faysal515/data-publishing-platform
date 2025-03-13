import axios from "axios";
import { ApiResponse, Dataset } from "../types/dataset";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL environment variable is not defined"
  );
}

export const datasetService = {
  async uploadDataset(file: File): Promise<ApiResponse<Dataset>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post<ApiResponse<Dataset>>(
      `${API_BASE_URL}/datasets/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async getAllDatasets(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      categories?: string[];
    } = {}
  ) {
    const { page = 1, limit = 10, search, categories } = params;
    const queryParams = new URLSearchParams();

    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (search) {
      queryParams.append("search", search);
    }

    if (categories && categories.length > 0) {
      categories.forEach((category) =>
        queryParams.append("categories", category)
      );
    }

    const response = await axios.get(
      `${API_BASE_URL}/datasets?${queryParams.toString()}`
    );
    return response.data;
  },

  async getDatasetById(id: string): Promise<ApiResponse<Dataset>> {
    const response = await axios.get<ApiResponse<Dataset>>(
      `${API_BASE_URL}/datasets/${id}`
    );

    return response.data;
  },

  async updateMetadata(
    id: string,
    metadata: Dataset["metadata"]
  ): Promise<ApiResponse<Dataset>> {
    const response = await axios.put<ApiResponse<Dataset>>(
      `${API_BASE_URL}/datasets/${id}/metadata`,
      metadata
    );

    return response.data;
  },
};
