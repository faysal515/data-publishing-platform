import { useEffect, useState } from "react";
import { Dataset, DatasetMetadata } from "../types/dataset";
import { DATASET_STATUS } from "../constants";

interface MetadataEditorProps {
  dataset: Dataset;
  onSave: (metadata: DatasetMetadata) => void;
  readOnly?: boolean;
}

export default function MetadataEditor({
  dataset,
  onSave,
  readOnly = false,
}: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<DatasetMetadata>(
    dataset.metadata || {}
  );
  const [isDirty, setIsDirty] = useState(false);

  // Load draft from local storage on mount
  useEffect(() => {
    const draftKey = `dataset_draft_${dataset._id}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setMetadata(parsedDraft);
        setIsDirty(true);
      } catch (error) {
        console.error("Error parsing draft:", error);
        // If there's an error parsing, remove the corrupted draft
        localStorage.removeItem(draftKey);
      }
    }
  }, [dataset._id]);

  // Save to local storage whenever metadata changes
  useEffect(() => {
    if (isDirty) {
      const draftKey = `dataset_draft_${dataset._id}`;
      localStorage.setItem(draftKey, JSON.stringify(metadata));
    }
  }, [metadata, dataset._id, isDirty]);

  const handleChange = (
    field: keyof DatasetMetadata,
    value: string | string[]
  ) => {
    if (readOnly) return;
    setIsDirty(true);
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    onSave(metadata);
    // Clear draft after successful save
    localStorage.removeItem(`dataset_draft_${dataset._id}`);
    setIsDirty(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(`dataset_draft_${dataset._id}`);
    setMetadata(dataset.metadata || {});
    setIsDirty(false);
  };

  const canSubmit =
    dataset.status !== DATASET_STATUS.UNDER_REVIEW &&
    dataset.status !== DATASET_STATUS.APPROVED;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* English Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              English Metadata
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={metadata.title_en || ""}
                onChange={(e) => handleChange("title_en", e.target.value)}
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Description
              </label>
              <textarea
                value={metadata.description_en || ""}
                onChange={(e) => handleChange("description_en", e.target.value)}
                disabled={readOnly}
                rows={4}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={metadata.category_en || ""}
                onChange={(e) => handleChange("category_en", e.target.value)}
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Subcategory
              </label>
              <input
                type="text"
                value={metadata.subcategory_en || ""}
                onChange={(e) => handleChange("subcategory_en", e.target.value)}
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
              />
            </div>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -ml-px">
          <div className="w-px h-full bg-gray-200"></div>
        </div>

        {/* Arabic Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 text-right">
              البيانات الوصفية العربية
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-right">
                العنوان
              </label>
              <input
                type="text"
                value={metadata.title_ar || ""}
                onChange={(e) => handleChange("title_ar", e.target.value)}
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm text-right bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-right">
                الوصف
              </label>
              <textarea
                value={metadata.description_ar || ""}
                onChange={(e) => handleChange("description_ar", e.target.value)}
                disabled={readOnly}
                rows={4}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm text-right bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-right">
                الفئة
              </label>
              <input
                type="text"
                value={metadata.category_ar || ""}
                onChange={(e) => handleChange("category_ar", e.target.value)}
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm text-right bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-right">
                الفئة الفرعية
              </label>
              <input
                type="text"
                value={metadata.subcategory_ar || ""}
                onChange={(e) => handleChange("subcategory_ar", e.target.value)}
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm text-right bg-white
                  ${
                    readOnly
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  }
                `}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="pt-6 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <input
            type="text"
            value={metadata.tags?.join(", ") || ""}
            onChange={(e) =>
              handleChange(
                "tags",
                e.target.value.split(",").map((tag) => tag.trim())
              )
            }
            disabled={readOnly}
            placeholder="Enter tags separated by commas"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
              ${
                readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }
            `}
          />
        </div>
      </div>

      {/* Form Controls */}
      {!readOnly && canSubmit && (
        <div className="pt-6 border-t border-gray-200">
          <div
            className={`${
              isDirty ? "bg-blue-50 border border-blue-200" : ""
            } px-4 py-3 rounded relative`}
          >
            {isDirty && (
              <p className="font-medium text-blue-700 mb-4">
                You have unsaved changes
              </p>
            )}
            <div className="flex justify-end space-x-4">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="bg-white text-gray-700 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Discard Changes
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isDirty ? "Save and Submit for Review" : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
