import { BetaAnalyticsDataClient } from "@google-analytics/data";
import {
  getGa4PropertyId,
  getGa4ServiceAccountCredentials,
  isGa4Configured,
} from "./config";
import type { Ga4DashboardMetrics, Ga4FetchResult } from "./types";

function parseMetricValue(
  rows: { metricValues?: { value?: string | null }[] | null }[] | null | undefined,
  index: number
): number {
  const value = rows?.[0]?.metricValues?.[index]?.value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRowMetricValue(
  row: { metricValues?: { value?: string | null }[] | null } | null | undefined,
  index: number
): number {
  const value = row?.metricValues?.[index]?.value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createAnalyticsClient(): BetaAnalyticsDataClient | null {
  const credentials = getGa4ServiceAccountCredentials();
  if (!credentials) return null;

  return new BetaAnalyticsDataClient({ credentials });
}

export async function getGa4DashboardMetrics(): Promise<Ga4FetchResult> {
  if (!isGa4Configured()) {
    return {
      ok: false,
      reason: "not_configured",
      message:
        "GA4_PROPERTY_ID와 GA4_SERVICE_ACCOUNT_JSON(또는 GA4_SERVICE_ACCOUNT_PATH) 환경 변수를 설정해 주세요. 서비스 계정 이메일을 GA4 속성 → 속성 액세스 관리에서 뷰어로 추가해야 합니다.",
    };
  }

  const propertyId = getGa4PropertyId();
  const client = createAnalyticsClient();
  if (!propertyId || !client) {
    return {
      ok: false,
      reason: "not_configured",
      message: "GA4 인증 정보를 읽을 수 없습니다. JSON 형식과 파일 경로를 확인해 주세요.",
    };
  }

  const property = `properties/${propertyId}`;

  try {
    const [summary7Days, summaryToday, topPagesReport] = await Promise.all([
      client.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "newUsers" },
        ],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
      }),
      client.runReport({
        property,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [
          {
            metric: { metricName: "screenPageViews" },
            desc: true,
          },
        ],
        limit: 5,
      }),
    ]);

    const summaryRows = summary7Days[0]?.rows;
    const todayRows = summaryToday[0]?.rows;
    const topPageRows = topPagesReport[0]?.rows ?? [];

    const data: Ga4DashboardMetrics = {
      summary: {
        activeUsersToday: parseMetricValue(todayRows, 0),
        activeUsers7Days: parseMetricValue(summaryRows, 0),
        sessions7Days: parseMetricValue(summaryRows, 1),
        pageViews7Days: parseMetricValue(summaryRows, 2),
        newUsers7Days: parseMetricValue(summaryRows, 3),
      },
      topPages: topPageRows.map((row) => ({
        path: row.dimensionValues?.[0]?.value ?? "(unknown)",
        pageViews: parseRowMetricValue(row, 0),
      })),
      fetchedAt: new Date().toISOString(),
    };

    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "GA4 데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.";

    return {
      ok: false,
      reason: "api_error",
      message,
    };
  }
}
