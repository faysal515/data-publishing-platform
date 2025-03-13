import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dataset } from "../../types/dataset";
import { datasetService } from "../../services/datasetService";
import MetadataEditor from "../../components/MetadataEditor";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function DatasetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;

      try {
        const response = await datasetService.getDatasetById(id as string);
        setDataset(response.data);
      } catch (err) {
        setError("Failed to load dataset");
        console.error("Error fetching dataset:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [id]);

  const handleSaveMetadata = async (metadata: Dataset["metadata"]) => {
    if (!dataset?._id) return;

    try {
      setIsSaving(true);
      const response = await datasetService.updateMetadata(
        dataset._id,
        metadata
      );
      setDataset(response.data);
      toast.success("Metadata saved successfully and sent for review");
    } catch (error: any) {
      console.error("Error saving metadata:", error);
      toast.error(
        error.response?.data?.error?.message ||
          "Error saving metadata. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">
            {error || "Dataset not found"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/datasets"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Datasets
          </Link>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              dataset.status === "metadata_generated"
                ? "bg-green-100 text-green-800"
                : dataset.status === "processed"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {dataset.status}
          </span>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Dataset Information</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">File Name:</span>{" "}
                {dataset.originalFilename}
              </div>
              <div>
                <span className="font-medium">File Type:</span>{" "}
                {dataset.fileType.toUpperCase()}
              </div>
              <div>
                <span className="font-medium">File Size:</span>{" "}
                {(dataset.fileSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div>
                <span className="font-medium">Row Count:</span>{" "}
                {dataset.rowCount.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Upload Date:</span>{" "}
                {new Date(dataset.uploadDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Metadata Editor</h2>
          </div>
          <div className="px-6 py-4">
            <MetadataEditor dataset={dataset} onSave={handleSaveMetadata} />
            {isSaving && (
              <div className="mt-4 text-blue-600">Saving changes...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
