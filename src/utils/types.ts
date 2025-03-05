
export interface BucketDetails {
  count: number;
  buckets: {
    name: string;
    public: boolean;
    created_at: string;
  }[];
  fileCount?: number;
  sampleFiles?: {
    name: string;
    size: string | number;
    created_at: string;
  }[];
  error?: string;
}
