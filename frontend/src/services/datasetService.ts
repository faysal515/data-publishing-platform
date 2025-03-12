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
};
