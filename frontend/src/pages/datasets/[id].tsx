import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dataset, VersionHistoryEntry } from "../../types/dataset";
import { datasetService } from "../../services/datasetService";
import MetadataEditor from "../../components/MetadataEditor";
import { StatusBadge } from "../../components/StatusBadge";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import DragAndDrop from "../../components/DragAndDrop";
import { DATASET_STATUS } from "../../constants";

export default function DatasetDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { role } = useAuth();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [showVersionUpload, setShowVersionUpload] = useState(false);

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
    if (!dataset?._id || !role) return;

    try {
      setIsSaving(true);
      const response = await datasetService.updateMetadata(dataset._id, {
        ...metadata,
        status: DATASET_STATUS.UNDER_REVIEW,
        role: role,
        // comment: "Metadata updated and submitted for review",
      });
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

  const handleApprove = async () => {
    if (!dataset?._id || !role) return;
    if (role === "admin" && !reviewComment.trim()) {
      toast.error("Please provide a comment for approval");
      return;
    }

    try {
      setIsSaving(true);
      const response = await datasetService.updateMetadata(dataset._id, {
        ...dataset.metadata,
        status: DATASET_STATUS.APPROVED,
        role: role,
        comment: reviewComment.trim() || "Metadata approved",
      });
      setDataset(response.data);
      setReviewComment("");
      toast.success("Dataset approved successfully");
    } catch (error: any) {
      console.error("Error approving dataset:", error);
      toast.error("Error approving dataset. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!dataset?._id || !role) return;
    if (!reviewComment.trim()) {
      toast.error("Please provide a comment for the requested changes");
      return;
    }

    try {
      setIsSaving(true);
      const response = await datasetService.updateMetadata(dataset._id, {
        ...dataset.metadata,
        status: DATASET_STATUS.CHANGES_REQUESTED,
        role: role,
        comment: reviewComment,
      });
      setDataset(response.data);
      setReviewComment("");
      toast.success("Changes requested successfully");
    } catch (error: any) {
      console.error("Error requesting changes:", error);
      toast.error("Error requesting changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVersionUploadSuccess = (updatedDataset: Dataset) => {
    setDataset(updatedDataset);
    setShowVersionUpload(false);
    toast.success("New version uploaded successfully");
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
          <div className="flex items-center space-x-4">
            <StatusBadge status={dataset.status} />
            {dataset.status === DATASET_STATUS.APPROVED && (
              <button
                onClick={() => setShowVersionUpload(!showVersionUpload)}
                className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showVersionUpload
                    ? "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500"
                    : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                }`}
              >
                {showVersionUpload ? "Cancel" : "Upload New Version"}
              </button>
            )}
          </div>
        </div>

        {showVersionUpload && dataset.status === DATASET_STATUS.APPROVED && (
          <div className="mb-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Upload New Version</h2>
            </div>
            <div className="px-6 py-4">
              <DragAndDrop
                uploadType="version"
                datasetId={dataset._id}
                onUploadSuccess={handleVersionUploadSuccess}
                minHeight="200px"
                showPreview={false}
              />
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Dataset Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-3 gap-6">
              {/* First Column */}
              <div className="space-y-4 text-sm">
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
                {dataset.currentVersion && (
                  <div>
                    <span className="font-medium">Version:</span>{" "}
                    <span className="inline-flex items-center">
                      {dataset.currentVersion}
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Latest
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Second Column */}
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Row Count:</span>{" "}
                  {dataset.rowCount.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Upload Date:</span>{" "}
                  {new Date(dataset.uploadDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <StatusBadge status={dataset.status} size="xs" />
                </div>
              </div>

              {/* Third Column - Review History */}
              <div className="border-l pl-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Review History
                </h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {dataset?.metadata_history &&
                  dataset.metadata_history.length > 0 ? (
                    [...dataset.metadata_history]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((history, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg text-sm"
                        >
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>By {history.created_by}</span>
                            <span>
                              {new Date(
                                history.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{history.comment}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No review history yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Metadata Editor</h2>
          </div>
          <div className="px-6 py-4">
            {role === "editor" ? (
              <>
                <MetadataEditor
                  dataset={dataset}
                  onSave={handleSaveMetadata}
                  readOnly={false}
                />
                {isSaving && (
                  <div className="mt-4 text-blue-600">Saving changes...</div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <MetadataEditor
                  dataset={dataset}
                  onSave={handleSaveMetadata}
                  readOnly={true}
                />
                {dataset.status !== DATASET_STATUS.APPROVED && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Review Actions</h3>
                    <div className="space-y-4">
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Enter review comments here..."
                        className="w-full px-3 py-2 border rounded-md"
                        rows={4}
                      />
                      <div className="flex space-x-4">
                        <button
                          onClick={handleApprove}
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={handleRequestChanges}
                          disabled={isSaving || !reviewComment.trim()}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
