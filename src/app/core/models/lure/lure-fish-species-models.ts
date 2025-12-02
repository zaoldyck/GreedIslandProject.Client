export interface LureFishSpeciesSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string | null;
  tagIds?: number[] | null;
  tagMatchAll?: boolean; // 默认 true
}
