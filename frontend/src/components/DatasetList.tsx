import { useState, useEffect } from "react";
import { Dataset } from "../types/dataset";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

// Hardcoded categories for now
const CATEGORIES = [
  { id: "health", label: { en: "Healthcare", ar: "الرعاية الصحية" } },
  { id: "education", label: { en: "Education", ar: "التعليم" } },
  { id: "economy", label: { en: "Economy", ar: "الاقتصاد" } },
  { id: "environment", label: { en: "Environment", ar: "البيئة" } },
];

interface DatasetListProps {
  datasets: Dataset[];
  isLoading?: boolean;
  onSearch: (search: string) => void;
  onCategoriesChange: (categories: string[]) => void;
  search: string;
  selectedCategories: string[];
}

export default function DatasetList({
  datasets,
  isLoading,
  onSearch,
  onCategoriesChange,
  search,
  selectedCategories,
}: DatasetListProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearch]);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoriesChange(newCategories);
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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search datasets..."
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category.label.en}</span>
              <span className="text-sm text-gray-500" dir="rtl">
                ({category.label.ar})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dataset List */}
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
              <span>{(dataset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
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
            No datasets match your criteria
          </div>
        )}
      </div>
    </div>
  );
}
