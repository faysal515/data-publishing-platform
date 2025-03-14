import { useMemo } from "react";
import { DatasetStatus, DATASET_STATUS } from "../constants";

interface StatusJourneyProps {
  currentStatus: DatasetStatus;
  className?: string;
}

export function StatusJourney({
  currentStatus,
  className = "",
}: StatusJourneyProps) {
  // Memoize static arrays
  const statusFlow = useMemo(
    () =>
      [
        DATASET_STATUS.UPLOADED,
        DATASET_STATUS.PROCESSED,
        DATASET_STATUS.METADATA_GENERATED,
        DATASET_STATUS.UNDER_REVIEW,
        DATASET_STATUS.APPROVED,
      ] as const,
    []
  );

  const exceptionalStatuses = useMemo(
    () =>
      [
        DATASET_STATUS.METADATA_FAILED,
        DATASET_STATUS.CHANGES_REQUESTED,
      ] as const,
    []
  );

  // Memoize status display names mapping
  const statusDisplayNames = useMemo(
    () => ({
      [DATASET_STATUS.UPLOADED]: "Uploaded",
      [DATASET_STATUS.PROCESSED]: "Processed",
      [DATASET_STATUS.METADATA_GENERATED]: "Metadata Generated",
      [DATASET_STATUS.METADATA_FAILED]: "Metadata Failed",
      [DATASET_STATUS.UNDER_REVIEW]: "Under Review",
      [DATASET_STATUS.CHANGES_REQUESTED]: "Changes Requested",
      [DATASET_STATUS.APPROVED]: "Approved",
    }),
    []
  );

  // Extract SVG components for reusability
  const CheckIcon = () => (
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  );

  const ErrorIcon = () => (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  );

  // Memoize computed values
  const isExceptional = exceptionalStatuses.includes(currentStatus as any);
  const currentIndex = statusFlow.indexOf(currentStatus as any);

  // Extract status styles logic
  const getStatusStyles = (status: DatasetStatus, index: number) => {
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
    const isMetadataFailed =
      status === DATASET_STATUS.METADATA_GENERATED &&
      currentStatus === DATASET_STATUS.METADATA_FAILED;
    const isApproved =
      status === DATASET_STATUS.APPROVED &&
      currentStatus === DATASET_STATUS.APPROVED;

    return {
      isActive,
      isCompleted,
      isUpcoming,
      isMetadataFailed,
      isApproved,
      dotClasses: `
        w-6 h-6 rounded-full flex items-center justify-center
        ${isActive && !isApproved ? "bg-blue-500 text-white" : ""}
        ${isCompleted && !isMetadataFailed ? "bg-green-500 text-white" : ""}
        ${isMetadataFailed ? "bg-red-500 text-white" : ""}
        ${isUpcoming ? "bg-gray-200 text-gray-400" : ""}
        ${isApproved ? "bg-green-500 text-white" : ""}
      `,
      textClasses: `
        text-xs mt-1 text-center
        ${isActive && !isApproved ? "font-medium text-blue-600" : ""}
        ${isCompleted && !isMetadataFailed ? "font-medium text-green-600" : ""}
        ${isMetadataFailed ? "font-medium text-red-600" : ""}
        ${isUpcoming ? "text-gray-400" : ""}
        ${isApproved ? "font-medium text-green-600" : ""}
      `,
    };
  };

  // Calculate progress bar color
  const progressBarColor = useMemo(() => {
    if (currentStatus === DATASET_STATUS.METADATA_FAILED) return "bg-red-500";
    if (currentStatus === DATASET_STATUS.CHANGES_REQUESTED)
      return "bg-yellow-500";
    if (currentStatus === DATASET_STATUS.APPROVED) return "bg-green-500";
    return "bg-blue-500";
  }, [currentStatus]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {statusFlow.map((status, index) => {
          const styles = getStatusStyles(status, index);

          return (
            <div key={status} className="flex flex-col items-center">
              <div className={styles.dotClasses}>
                {styles.isCompleted ||
                styles.isMetadataFailed ||
                styles.isApproved ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {styles.isMetadataFailed ? <ErrorIcon /> : <CheckIcon />}
                  </svg>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span className={styles.textClasses}>
                {styles.isMetadataFailed
                  ? statusDisplayNames[DATASET_STATUS.METADATA_FAILED]
                  : statusDisplayNames[status]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-gray-200 rounded-full mt-1">
        <div
          className={`absolute h-1 rounded-full ${progressBarColor}`}
          style={{
            width:
              currentStatus === DATASET_STATUS.APPROVED
                ? "100%"
                : `${Math.max(
                    0,
                    (currentIndex / (statusFlow.length - 1)) * 100
                  )}%`,
          }}
        />
      </div>

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
            {statusDisplayNames[DATASET_STATUS.CHANGES_REQUESTED]}
          </span>
        </div>
      )}
    </div>
  );
}
