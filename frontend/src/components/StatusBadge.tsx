import { DatasetStatus } from "../types/dataset";

interface StatusBadgeProps {
  status: DatasetStatus;
  size?: "sm" | "xs";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const getStatusStyles = (status: DatasetStatus) => {
    switch (status) {
      case "uploaded":
        return "bg-blue-100 text-blue-800";
      case "processed":
        return "bg-indigo-100 text-indigo-800";
      case "metadata_generated":
        return "bg-green-100 text-green-800";
      case "metadata_failed":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "changes_requested":
        return "bg-orange-100 text-orange-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    xs: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      className={`rounded-full font-medium inline-flex items-center ${
        sizeStyles[size]
      } ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  );
}
