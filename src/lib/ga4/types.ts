export type Ga4SummaryMetrics = {
  activeUsersToday: number;
  activeUsers7Days: number;
  sessions7Days: number;
  pageViews7Days: number;
  newUsers7Days: number;
};

export type Ga4TopPage = {
  path: string;
  pageViews: number;
};

export type Ga4DashboardMetrics = {
  summary: Ga4SummaryMetrics;
  topPages: Ga4TopPage[];
  fetchedAt: string;
};

export type Ga4FetchResult =
  | { ok: true; data: Ga4DashboardMetrics }
  | { ok: false; reason: "not_configured" | "api_error"; message: string };
