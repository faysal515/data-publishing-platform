import { DatasetStatus, DATASET_STATUS } from "../constants";

interface StatusJourneyProps {
  currentStatus: DatasetStatus;
  className?: string;
}

export function StatusJourney({
  currentStatus,
  className = "",
}: StatusJourneyProps) {
  // Define the normal flow of statuses
  const statusFlow = [
    DATASET_STATUS.UPLOADED,
    DATASET_STATUS.PROCESSED,
    DATASET_STATUS.METADATA_GENERATED,
    DATASET_STATUS.UNDER_REVIEW,
    DATASET_STATUS.APPROVED,
  ] as const;

  // Define exceptional statuses that break the normal flow
  const exceptionalStatuses = [
    DATASET_STATUS.METADATA_FAILED,
    DATASET_STATUS.CHANGES_REQUESTED,
  ] as const;

  // Check if current status is exceptional
  const isExceptional = exceptionalStatuses.includes(currentStatus as any);

  // Get the current status index in the flow
  const currentIndex = statusFlow.indexOf(currentStatus as any);

  // Get a friendly display name for each status
  const getStatusDisplayName = (status: DatasetStatus): string => {
    switch (status) {
      case DATASET_STATUS.UPLOADED:
        return "Uploaded";
      case DATASET_STATUS.PROCESSED:
        return "Processed";
      case DATASET_STATUS.METADATA_GENERATED:
        return "Metadata Generated";
      case DATASET_STATUS.METADATA_FAILED:
        return "Metadata Failed";
      case DATASET_STATUS.UNDER_REVIEW:
        return "Under Review";
      case DATASET_STATUS.CHANGES_REQUESTED:
        return "Changes Requested";
      case DATASET_STATUS.APPROVED:
        return "Approved";
      default:
        return status;
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {statusFlow.map((status, index) => {
          // Determine if this status is active, completed, or upcoming
          const isActive = status === currentStatus;
          const isCompleted =
            currentIndex > index ||
            (isExceptional &&
              status === DATASET_STATUS.METADATA_GENERATED &&
              currentStatus === DATASET_STATUS.METADATA_FAILED) ||
            (isExceptional &&
              status === DATASET_STATUS.UNDER_REVIEW &&
              currentStatus === DATASET_STATUS.CHANGES_REQUESTED);
          const isUpcoming = !isActive && !isCompleted;

          // Special case for metadata failed status
          const isMetadataFailed =
            status === DATASET_STATUS.METADATA_GENERATED &&
            currentStatus === DATASET_STATUS.METADATA_FAILED;

          // Special case for approved status
          const isApproved =
            status === DATASET_STATUS.APPROVED &&
            currentStatus === DATASET_STATUS.APPROVED;

          return (
            <div key={status} className="flex flex-col items-center">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${isActive && !isApproved ? "bg-blue-500 text-white" : ""}
                  ${
                    isCompleted && !isMetadataFailed
                      ? "bg-green-500 text-white"
                      : ""
                  }
                  ${isMetadataFailed ? "bg-red-500 text-white" : ""}
                  ${isUpcoming ? "bg-gray-200 text-gray-400" : ""}
                  ${isApproved ? "bg-green-500 text-white" : ""}
                `}
              >
                {isCompleted || isMetadataFailed || isApproved ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {isMetadataFailed ? (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  isActive && !isApproved ? "font-medium text-blue-600" : ""
                } ${
                  isCompleted && !isMetadataFailed
                    ? "font-medium text-green-600"
                    : ""
                } ${isMetadataFailed ? "font-medium text-red-600" : ""} ${
                  isUpcoming ? "text-gray-400" : ""
                } ${isApproved ? "font-medium text-green-600" : ""}`}
              >
                {isMetadataFailed
                  ? getStatusDisplayName(DATASET_STATUS.METADATA_FAILED)
                  : getStatusDisplayName(status)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-gray-200 rounded-full mt-1">
        <div
          className={`absolute h-1 rounded-full ${
            currentStatus === DATASET_STATUS.METADATA_FAILED
              ? "bg-red-500"
              : currentStatus === DATASET_STATUS.CHANGES_REQUESTED
              ? "bg-yellow-500"
              : currentStatus === DATASET_STATUS.APPROVED
              ? "bg-green-500"
              : "bg-blue-500"
          }`}
          style={{
            width: `${
              currentStatus === DATASET_STATUS.APPROVED
                ? "100%"
                : `${Math.max(
                    0,
                    (currentIndex / (statusFlow.length - 1)) * 100
                  )}%`
            }`,
          }}
        />
      </div>

      {/* Remove the exceptional status display since we're now showing it inline */}
      {currentStatus === DATASET_STATUS.CHANGES_REQUESTED && (
        <div className="mt-4 flex items-center">
          <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center mr-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-yellow-600">
            {getStatusDisplayName(DATASET_STATUS.CHANGES_REQUESTED)}
          </span>
        </div>
      )}
    </div>
  );
}
