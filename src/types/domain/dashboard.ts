export type DashboardMetricKey =
  | "new_memberships"
  | "returning_users"
  | "active_circles"
  | "result_card_shares"
  | "coupon_redemptions"
  | "campaign_conversions";

export interface DashboardMetric {
  key: DashboardMetricKey;
  label: string;
  value: number;
  helper_text: string;
}

export interface DashboardSummary {
  store_id: string;
  generated_at: string;
  metrics: DashboardMetric[];
}
