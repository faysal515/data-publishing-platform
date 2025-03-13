import { useState } from "react";
import { Dataset } from "../types/dataset";
import Link from "next/link";

interface DatasetListProps {
  datasets: Dataset[];
  isLoading?: boolean;
}

export default function DatasetList({ datasets, isLoading }: DatasetListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.metadata?.title_en
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      dataset.metadata?.title_ar
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Dataset List */}
      <div className="grid gap-4">
        {filteredDatasets.map((dataset) => (
          <Link
            href={`/datasets/${dataset._id}`}
            key={dataset._id}
            className="block border rounded-lg p-4 hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">
                  {dataset.metadata?.title_en || dataset.originalFilename}
                </h3>
                {dataset.metadata?.title_ar && (
                  <p className="text-gray-600 text-sm mt-1" dir="rtl">
                    {dataset.metadata.title_ar}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
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

            <div className="mt-2 text-sm text-gray-600">
              <span>{dataset.rowCount.toLocaleString()} rows</span>
              <span className="mx-2">•</span>
              <span>{(dataset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </Link>
        ))}

        {filteredDatasets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {datasets.length === 0
              ? "No datasets available"
              : "No datasets match your search"}
          </div>
        )}
      </div>
    </div>
  );
}
