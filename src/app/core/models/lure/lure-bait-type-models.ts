export interface LureBaitTypeSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string | null;
  tagIds?: number[] | null;
  matchMode?: string;
}
