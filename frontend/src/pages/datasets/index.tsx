import { useEffect, useState } from "react";
import { Dataset } from "../../types/dataset";
import DatasetList from "../../components/DatasetList";
import { datasetService } from "../../services/datasetService";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await datasetService.getAllDatasets();
        setDatasets(response.data.datasets);
      } catch (err) {
        setError("Failed to load datasets");
        console.error("Error fetching datasets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasets();
  }, []);

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
        <DatasetList datasets={datasets} isLoading={isLoading} />
      )}
    </div>
  );
}
