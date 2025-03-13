export default {};

export const DATASET_STATUS = {
  UPLOADED: "uploaded",
  PROCESSED: "processed",
  METADATA_GENERATED: "metadata_generated",
  METADATA_FAILED: "metadata_failed",
  UNDER_REVIEW: "under_review",
  PUBLISHED: "published",
} as const;

export type DatasetStatus =
  (typeof DATASET_STATUS)[keyof typeof DATASET_STATUS];
