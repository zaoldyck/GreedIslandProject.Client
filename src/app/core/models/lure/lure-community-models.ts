export interface LureCommunityNavItem {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
  queryParams?: Record<string, any>;
}
