import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { DashboardMetric, DashboardSummary, Membership } from "@/types/domain";

export async function getTodayReservationCount(
  store_id: string,
): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store_id)
    .eq("reservation_date", today);

  if (error) {
    throw new Error(`get_today_reservation_count_failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getTodayGameCount(store_id: string): Promise<number> {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { count, error } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store_id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) {
    throw new Error(`get_today_game_count_failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getNewMembershipCount(
  store_id: string,
): Promise<number> {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store_id)
    .gte("created_at", start.toISOString());

  if (error) {
    throw new Error(`get_new_membership_count_failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getRepeatMemberCount(
  store_id: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store_id)
    .gte("visit_count", 2);

  if (error) {
    throw new Error(`get_repeat_member_count_failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getActiveCircleCount(
  store_id: string,
): Promise<number> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count, error } = await supabase
    .from("circles")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store_id)
    .eq("status", "active")
    .gte("last_active_at", sevenDaysAgo.toISOString());

  if (error) {
    throw new Error(`get_active_circle_count_failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getCouponRedemptionCount(
  store_id: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("coupon_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store_id)
    .eq("status", "used");

  if (error) {
    throw new Error(`get_coupon_redemption_count_failed: ${error.message}`);
  }

  return count ?? 0;
}

export async function getInactiveMembers7Days(
  store_id: string,
): Promise<Membership[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("store_id", store_id)
    .or(`last_visit_at.is.null,last_visit_at.lt.${sevenDaysAgo.toISOString()}`)
    .order("last_visit_at", { ascending: true, nullsFirst: true });

  if (error) {
    throw new Error(`get_inactive_members_7_days_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getStoreDashboardSummary(
  store_id: string,
): Promise<DashboardSummary> {
  const [
    newMemberships,
    returningUsers,
    activeCircles,
    couponRedemptions,
  ] = await Promise.all([
    getNewMembershipCount(store_id),
    getRepeatMemberCount(store_id),
    getActiveCircleCount(store_id),
    getCouponRedemptionCount(store_id),
  ]);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .select("share_count")
    .eq("store_id", store_id);

  if (error) {
    throw new Error(`get_store_dashboard_summary_failed: ${error.message}`);
  }

  const resultCardShares = (data ?? []).reduce(
    (total, item) => total + Number(item.share_count ?? 0),
    0,
  );

  const metrics: DashboardMetric[] = [
    {
      key: "new_memberships",
      label: "新增会员",
      value: newMemberships,
      helper_text: "今日新增会员数",
    },
    {
      key: "returning_users",
      label: "复购用户",
      value: returningUsers,
      helper_text: "到店次数不少于 2 次的会员数",
    },
    {
      key: "active_circles",
      label: "活跃圈子",
      value: activeCircles,
      helper_text: "近 7 天有活跃记录的圈子数",
    },
    {
      key: "result_card_shares",
      label: "战绩海报分享",
      value: resultCardShares,
      helper_text: "战绩海报累计分享次数",
    },
    {
      key: "coupon_redemptions",
      label: "卡券核销",
      value: couponRedemptions,
      helper_text: "已核销卡券数",
    },
    {
      key: "campaign_conversions",
      label: "活动转化",
      value: 0,
      helper_text: "活动转化统计待接入",
    },
  ];

  return {
    store_id,
    generated_at: new Date().toISOString(),
    metrics,
  };
}
