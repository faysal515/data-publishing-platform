import { Dataset } from "../types/dataset";

interface DatasetInfoProps {
  dataset: Dataset;
}

export default function DatasetInfo({ dataset }: DatasetInfoProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Dataset Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">File Details</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Original Name:</span>{" "}
              {dataset.originalFilename}
            </p>
            <p>
              <span className="font-medium">File Type:</span>{" "}
              {dataset.fileType.toUpperCase()}
            </p>
            <p>
              <span className="font-medium">Size:</span>{" "}
              {formatFileSize(dataset.fileSize)}
            </p>
            <p>
              <span className="font-medium">Row Count:</span> {dataset.rowCount}
            </p>
            <p>
              <span className="font-medium">Status:</span> {dataset.status}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Columns</h3>
          <div className="space-y-4">
            {dataset.columns.map((column) => (
              <div key={column.name} className="border-b border-gray-100 pb-2">
                <p className="font-medium">{column.name}</p>
                <p className="text-sm text-gray-600">Type: {column.dataType}</p>
                {column.sampleValues.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Sample: {column.sampleValues.slice(0, 3).join(", ")}
                    {column.sampleValues.length > 3 ? "..." : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
