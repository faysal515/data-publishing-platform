import { useEffect, useState } from "react";
import { Dataset } from "../types/dataset";

interface MetadataEditorProps {
  dataset: Dataset;
  onSave?: (metadata: Dataset["metadata"]) => void;
}

export default function MetadataEditor({
  dataset,
  onSave,
}: MetadataEditorProps) {
  const [metadata, setMetadata] = useState(dataset.metadata);
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
    field: keyof Dataset["metadata"],
    value: string | string[],
    language?: "en" | "ar"
  ) => {
    setIsDirty(true);
    if (field === "tags") {
      setMetadata((prev) => ({
        ...prev,
        tags: Array.isArray(value) ? value : [value],
      }));
    } else {
      const fieldName = language
        ? (`${field}_${language}` as keyof Dataset["metadata"])
        : field;
      setMetadata((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave(metadata);
      // Clear draft after successful save
      localStorage.removeItem(`dataset_draft_${dataset._id}`);
      setIsDirty(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(`dataset_draft_${dataset._id}`);
    setMetadata(dataset.metadata);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      {isDirty && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
          <p className="font-medium">You have unsaved changes</p>
          <div className="mt-2 flex space-x-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
            >
              Save Changes
            </button>
            <button
              onClick={handleDiscardDraft}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (English)
          </label>
          <input
            type="text"
            value={metadata?.title_en || ""}
            onChange={(e) => handleChange("title", e.target.value, "en")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            العنوان (بالعربية)
          </label>
          <input
            type="text"
            value={metadata?.title_ar || ""}
            onChange={(e) => handleChange("title", e.target.value, "ar")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            dir="rtl"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (English)
          </label>
          <textarea
            value={metadata?.description_en || ""}
            onChange={(e) => handleChange("description", e.target.value, "en")}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            الوصف (بالعربية)
          </label>
          <textarea
            value={metadata?.description_ar || ""}
            onChange={(e) => handleChange("description", e.target.value, "ar")}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            dir="rtl"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category (English)
          </label>
          <input
            type="text"
            value={metadata?.category_en || ""}
            onChange={(e) => handleChange("category", e.target.value, "en")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            الفئة (بالعربية)
          </label>
          <input
            type="text"
            value={metadata?.category_ar || ""}
            onChange={(e) => handleChange("category", e.target.value, "ar")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            dir="rtl"
          />
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory (English)
          </label>
          <input
            type="text"
            value={metadata?.subcategory_en || ""}
            onChange={(e) => handleChange("subcategory", e.target.value, "en")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            الفئة الفرعية (بالعربية)
          </label>
          <input
            type="text"
            value={metadata?.subcategory_ar || ""}
            onChange={(e) => handleChange("subcategory", e.target.value, "ar")}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            dir="rtl"
          />
        </div>

        {/* Tags */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={metadata?.tags?.join(", ") || ""}
            onChange={(e) =>
              handleChange(
                "tags",
                e.target.value.split(",").map((tag) => tag.trim())
              )
            }
            placeholder="Enter tags separated by commas"
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
