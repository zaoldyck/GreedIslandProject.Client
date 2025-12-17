
export interface PagedResult<T> {
  items: T[];
  page: number;        // 1-based
  pageSize: number;
  totalCount: number;
  totalPages: number;  // 来自后端计算属性
  hasNext: boolean;    // 来自后端计算属性
  hasPrev: boolean;    // 来自后端计算属性
}
