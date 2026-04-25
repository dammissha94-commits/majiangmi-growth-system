import Link from "next/link";

import {
  getActiveCircleCount,
  getCampaignCount,
  getCampaignParticipantCount,
  getCouponRedemptionCount,
  getFirstActiveStore,
  getInactiveMembers7Days,
  getNewMembershipCount,
  getRepeatMemberCount,
  getResultCardShareCount,
  getTodayGameCount,
  getTodayReservationCount,
} from "@/lib/services/dashboard_service";

export const dynamic = "force-dynamic";

type DashboardData = {
  active_circle_count: number;
  campaign_count: number;
  campaign_participant_count: number;
  coupon_redemption_count: number;
  inactive_member_count: number;
  new_membership_count: number;
  repeat_member_count: number;
  result_card_share_count: number;
  today_game_count: number;
  today_reservation_count: number;
};

type DashboardMetric = {
  helper: string;
  label: string;
  suffix: string;
  value: number;
};

export default async function AdminDashboardPage() {
  const dashboard = await loadDashboardData();

  if (dashboard.status === "empty") {
    return <DashboardShell>{renderEmptyState()}</DashboardShell>;
  }

  if (dashboard.status === "error") {
    return <DashboardShell>{renderErrorState()}</DashboardShell>;
  }

  const metrics = buildMetrics(dashboard.data);
  const suggestions = buildSuggestions(dashboard.data);

  return (
    <DashboardShell>
      <header className="rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">数据复盘</p>
        <h1 className="mt-3 text-3xl font-semibold">门店经营看板</h1>
        <p className="mt-3 text-xl font-semibold text-[#fff8ea]">
          {dashboard.store_name}
        </p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          汇总会员、预约、开局、圈子、卡券、战绩海报与活动表现。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article
            className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
            key={metric.label}
          >
            <p className="text-sm text-[#5d756d]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold">
              {metric.value}
              <span className="ml-1 text-base font-medium text-[#5d756d]">
                {metric.suffix}
              </span>
            </p>
            <p className="mt-3 text-sm leading-6 text-[#4d665e]">
              {metric.helper}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">建议动作</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {suggestions.map((suggestion) => (
            <div
              className="rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium leading-6"
              key={suggestion}
            >
              {suggestion}
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

async function loadDashboardData(): Promise<
  | { status: "empty" }
  | { status: "error" }
  | { data: DashboardData; status: "ready"; store_name: string }
> {
  try {
    const store = await getFirstActiveStore();

    if (!store) {
      return { status: "empty" };
    }

    const [
      todayReservationCount,
      todayGameCount,
      newMembershipCount,
      repeatMemberCount,
      activeCircleCount,
      resultCardShareCount,
      couponRedemptionCount,
      inactiveMembers,
      campaignCount,
      campaignParticipantCount,
    ] = await Promise.all([
      getTodayReservationCount(store.id),
      getTodayGameCount(store.id),
      getNewMembershipCount(store.id),
      getRepeatMemberCount(store.id),
      getActiveCircleCount(store.id),
      getResultCardShareCount(store.id),
      getCouponRedemptionCount(store.id),
      getInactiveMembers7Days(store.id),
      getCampaignCount(store.id),
      getCampaignParticipantCount(store.id),
    ]);

    return {
      data: {
        active_circle_count: activeCircleCount,
        campaign_count: campaignCount,
        campaign_participant_count: campaignParticipantCount,
        coupon_redemption_count: couponRedemptionCount,
        inactive_member_count: inactiveMembers.length,
        new_membership_count: newMembershipCount,
        repeat_member_count: repeatMemberCount,
        result_card_share_count: resultCardShareCount,
        today_game_count: todayGameCount,
        today_reservation_count: todayReservationCount,
      },
      status: "ready",
      store_name: store.name,
    };
  } catch {
    return { status: "error" };
  }
}

function buildMetrics(data: DashboardData): DashboardMetric[] {
  return [
    {
      helper: "今日已创建的预约记录",
      label: "今日预约数",
      suffix: "桌",
      value: data.today_reservation_count,
    },
    {
      helper: "今日已创建的开局记录",
      label: "今日开局数",
      suffix: "局",
      value: data.today_game_count,
    },
    {
      helper: "今日新增门店会员",
      label: "新增会员数",
      suffix: "人",
      value: data.new_membership_count,
    },
    {
      helper: "到店次数不少于 2 次的会员",
      label: "老客复购数",
      suffix: "人",
      value: data.repeat_member_count,
    },
    {
      helper: "近 7 天有活跃记录的熟人圈",
      label: "活跃圈子数",
      suffix: "个",
      value: data.active_circle_count,
    },
    {
      helper: "战绩海报累计分享次数",
      label: "战绩海报分享数",
      suffix: "次",
      value: data.result_card_share_count,
    },
    {
      helper: "已核销的门店卡券",
      label: "卡券核销数",
      suffix: "张",
      value: data.coupon_redemption_count,
    },
    {
      helper: "近 7 天未到店的会员",
      label: "7天未到店用户数",
      suffix: "人",
      value: data.inactive_member_count,
    },
    {
      helper: "当前门店活动记录",
      label: "活动数量",
      suffix: "个",
      value: data.campaign_count,
    },
    {
      helper: "活动报名参与记录",
      label: "活动报名人数",
      suffix: "人",
      value: data.campaign_participant_count,
    },
  ];
}

function buildSuggestions(data: DashboardData): string[] {
  const suggestions: string[] = [];

  if (data.inactive_member_count > 0) {
    suggestions.push("建议发放老客召回券");
  }

  if (data.today_reservation_count === 0) {
    suggestions.push("建议发布今日预约提醒");
  }

  if (data.active_circle_count > 0) {
    suggestions.push("建议重点维护高活跃熟人圈");
  }

  if (data.coupon_redemption_count === 0) {
    suggestions.push("建议检查卡券是否被有效触达");
  }

  if (data.result_card_share_count > 0) {
    suggestions.push("建议继续引导玩家分享战绩海报");
  }

  if (suggestions.length === 0) {
    suggestions.push("建议保持当前运营节奏，持续观察复购变化");
  }

  return suggestions;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/admin">
          返回老板首页
        </Link>
        {children}
      </div>
    </main>
  );
}

function renderEmptyState() {
  return (
    <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-8">
      <p className="text-sm font-semibold text-[#9b7428]">数据复盘</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实经营指标。
      </p>
    </section>
  );
}

function renderErrorState() {
  return (
    <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-8">
      <p className="text-sm font-semibold text-[#9b7428]">数据复盘</p>
      <h1 className="mt-3 text-3xl font-semibold">数据读取失败</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        请检查 Supabase 环境变量与测试数据配置后重试。
      </p>
    </section>
  );
}
