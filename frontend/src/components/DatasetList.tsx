import { useState, useEffect } from "react";
import { Dataset } from "../types/dataset";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

interface DatasetListProps {
  datasets: Dataset[];
  isLoading?: boolean;
  onSearch: (search: string) => void;
  onCategoriesChange: (categories: string[]) => void;
  onStatusesChange: (statuses: string[]) => void;
  search: string;
  selectedCategories: string[];
  selectedStatuses: string[];
  categories: string[];
  statuses: string[];
}

export default function DatasetList({
  datasets,
  isLoading,
  onSearch,
  onCategoriesChange,
  onStatusesChange,
  search,
  selectedCategories,
  selectedStatuses,
  categories,
  statuses,
}: DatasetListProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // wait 300ms before calling onSearch
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearch]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoriesChange(newCategories);
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    onStatusesChange(newStatuses);
  };

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

  return (
    <div className="flex gap-6">
      <div className="w-1/5 min-w-[200px]">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search datasets..."
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>

          <h3 className="text-sm font-medium text-gray-700 mb-2 mt-6">
            Status
          </h3>
          <div className="space-y-2">
            {statuses.map((status) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {status.replace(/_/g, " ")}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="space-y-4">
          <div className="grid gap-4">
            {datasets.map((dataset) => (
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
                  <StatusBadge status={dataset.status} size="xs" />
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <span>{dataset.rowCount.toLocaleString()} rows</span>
                  <span className="mx-2">•</span>
                  <span>{(dataset.fileSize / 1024).toFixed(2)} KB</span>
                  {dataset.metadata?.category_en && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{dataset.metadata.category_en}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}

            {datasets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Start uploading datasets to get started or Your search have no
                results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
