export interface Job {
  _id: string;
  post_url: string;
  author: string;
  images: string[];
  job_markdown: string;
  job_plain_text: string;
  title: string;
  company: string;
  location: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  job_type: string;
  location_type: string;
  tags: string[];
  skills: string[];
  created_at: string;
  source_group_id: string;
  status: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: Job[];
    pagination: Pagination;
  };
}
