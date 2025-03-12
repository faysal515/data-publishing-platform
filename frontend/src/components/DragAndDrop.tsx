import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { datasetService } from "../services/datasetService";
import { Dataset } from "../types/dataset";
import DatasetInfo from "./DatasetInfo";

export default function DragAndDrop() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await datasetService.uploadDataset(selectedFile);
      setUploadedDataset(response.data);
      setSelectedFile(null);
      toast.success(response.message);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message ||
          "Error uploading file. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Clear previous upload state
    setUploadedDataset(null);

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only CSV or Excel files");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });

  return (
    <>
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            w-full
            p-12
            border-2
            border-dashed
            rounded-lg
            transition-colors
            cursor-pointer
            flex
            flex-col
            items-center
            justify-center
            min-h-[300px]
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-gray-600">Uploading...</p>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-500 text-lg">Drop the file here</p>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M24 8v24m0-24L16 16m8-8l8 8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-lg text-gray-600 mb-2">
                  Drag and drop your file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV and Excel files (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>

        {selectedFile && !isUploading && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setUploadedDataset(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload File
              </button>
            </div>
          </div>
        )}
      </div>

      {uploadedDataset && <DatasetInfo dataset={uploadedDataset} />}
    </>
  );
}
