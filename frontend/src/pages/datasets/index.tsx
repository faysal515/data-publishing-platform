import { useEffect, useState } from "react";
import { Dataset } from "../../types/dataset";
import { DatasetStatus } from "../../constants";
import DatasetList from "../../components/DatasetList";
import { datasetService } from "../../services/datasetService";

interface Filters {
  categories: string[];
  statuses: string[];
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    statuses: [],
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await datasetService.getDatasetFilters();
        if (response.data) {
          setFilters(response.data);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

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

        // Filter datasets by status client-side if any statuses are selected
        let filteredDatasets = response.data.datasets;
        if (selectedStatuses.length > 0) {
          filteredDatasets = filteredDatasets.filter((dataset: Dataset) =>
            selectedStatuses.includes(dataset.status)
          );
        }

        setDatasets(filteredDatasets);
        setTotalPages(Math.ceil(response.data.pagination.total / 10));
      } catch (err) {
        setError("Failed to load datasets");
        console.error("Error fetching datasets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, [page, search, selectedCategories, selectedStatuses]);

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when search changes
  };

  const handleCategoriesChange = (newCategories: string[]) => {
    setSelectedCategories(newCategories);
    setPage(1); // Reset to first page when categories change
  };

  const handleStatusesChange = (newStatuses: string[]) => {
    setSelectedStatuses(newStatuses);
    setPage(1); // Reset to first page when statuses change
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
        <>
          <DatasetList
            datasets={datasets}
            isLoading={isLoading}
            onSearch={handleSearch}
            onCategoriesChange={handleCategoriesChange}
            onStatusesChange={handleStatusesChange}
            search={search}
            selectedCategories={selectedCategories}
            selectedStatuses={selectedStatuses}
            categories={filters.categories}
            statuses={filters.statuses}
          />

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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
