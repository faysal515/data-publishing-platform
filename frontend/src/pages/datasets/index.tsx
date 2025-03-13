import { useEffect, useState } from "react";
import { Dataset } from "../../types/dataset";
import DatasetList from "../../components/DatasetList";
import { datasetService } from "../../services/datasetService";
import Link from "next/link";
import { StatusBadge } from "../../components/StatusBadge";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setIsLoading(true);
        const response = await datasetService.getAllDatasets({
          page,
          limit: 10,
          search,
          categories: selectedCategories,
        });
        setDatasets(response.data.datasets);
        setTotalPages(Math.ceil(response.data.pagination.total / 10));
      } catch (err) {
        setError("Failed to load datasets");
        console.error("Error fetching datasets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, [page, search, selectedCategories]);

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when search changes
  };

  const handleCategoriesChange = (newCategories: string[]) => {
    setSelectedCategories(newCategories);
    setPage(1); // Reset to first page when categories change
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    handleCategoriesChange(newCategories);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Datasets</h1>
        <p className="text-gray-600 mt-2">Browse and manage dataset metadata</p>
      </div>

      {error ? (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Left sidebar with filters */}
          <div className="w-1/5 min-w-[200px]">
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search datasets..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Categories
              </h3>
              <div className="space-y-2">
                {[
                  {
                    id: "Agriculture",
                    label: { en: "Agriculture", ar: "الزراعة" },
                  },
                  {
                    id: "education",
                    label: { en: "Education", ar: "التعليم" },
                  },
                  { id: "economy", label: { en: "Economy", ar: "الاقتصاد" } },
                  {
                    id: "environment",
                    label: { en: "Environment", ar: "البيئة" },
                  },
                ].map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category.label.en}
                    </span>
                    <span className="text-sm text-gray-500" dir="rtl">
                      ({category.label.ar})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <div className="space-y-4">
              {/* Dataset List */}
              <div className="grid gap-4">
                {isLoading
                  ? [...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))
                  : datasets.map((dataset) => (
                      <Link
                        href={`/datasets/${dataset._id}`}
                        key={dataset._id}
                        className="block border rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              {dataset.metadata?.title_en ||
                                dataset.originalFilename}
                            </h3>
                            {dataset.metadata?.title_ar && (
                              <p
                                className="text-gray-600 text-sm mt-1"
                                dir="rtl"
                              >
                                {dataset.metadata.title_ar}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={dataset.status} size="xs" />
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <span>{dataset.rowCount.toLocaleString()} rows</span>
                          <span className="mx-2">•</span>
                          <span>
                            {(dataset.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                          {dataset.metadata?.category_en && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{dataset.metadata.category_en}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    ))}

                {!isLoading && datasets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No datasets match your criteria
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
