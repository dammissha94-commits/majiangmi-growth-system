import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listCirclesWithMembersByStore,
  type CircleWithDetails,
} from "@/lib/services/circle_service";
import {
  listCouponsWithRedemptionsByStore,
  type CouponWithRedemptions,
} from "@/lib/services/coupon_service";
import {
  listReservationsWithDetailsByStore,
  type ReservationWithDetails,
} from "@/lib/services/reservation_service";
import {
  getLatestResultCardDetailsByStore,
  type PlayerResultCardDetails,
} from "@/lib/services/result_card_service";

export const dynamic = "force-dynamic";

type PlayerOverviewData = {
  active_coupons: CouponWithRedemptions[];
  circles: CircleWithDetails[];
  latest_result_card: PlayerResultCardDetails | null;
  store_name: string;
  today_reservations: ReservationWithDetails[];
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

type Shortcut = {
  description: string;
  href: string;
  title: string;
};

const shortcuts: Shortcut[] = [
  {
    description: "查看常约牌友、活跃圈子与最近开局。",
    href: "/player/circles",
    title: "我的熟人圈",
  },
  {
    description: "选择圈子与 4 名玩家，准备记录娱乐积分。",
    href: "/player/games/new",
    title: "快速开局",
  },
  {
    description: "查看门店可用权益，安排下一次到店。",
    href: "/player/coupons",
    title: "我的卡券",
  },
  {
    description: "选择包厢、日期与时段，生成预约草稿。",
    href: "/player/reservations/new",
    title: "预约下一局",
  },
  {
    description: "查看最新娱乐积分海报，邀请好友下一局。",
    href: "/player/results/test",
    title: "最新战绩海报",
  },
  {
    description: "查看招募中活动，选择圈子报名参与。",
    href: "/player/campaigns",
    title: "门店活动",
  },
];

export default async function PlayerPage() {
  const pageData = await loadPlayerOverviewData();

  if (pageData.status === "empty") {
    return <PlayerShell>{renderNoStoreState()}</PlayerShell>;
  }

  const metrics = buildMetrics(pageData.data);
  const tips = buildTips(pageData.data);
  const recommendedCircles = sortRecommendedCircles(pageData.data.circles).slice(
    0,
    3,
  );
  const couponPreview = pageData.data.active_coupons.slice(0, 3);
  const reservationPreview = pageData.data.today_reservations.slice(0, 3);
  const latestResultCard = pageData.data.latest_result_card;
  const mvpResult = latestResultCard?.results.find((result) => result.is_mvp);

  return (
    <PlayerShell>
      {/* Hero */}
      <section className="bg-[#12332a] px-5 pb-10 pt-8 text-[#fff8ea]">
        <div className="mx-auto max-w-6xl">
          <Link
            className="text-sm text-[#f1dba5]/70 transition hover:text-[#f1dba5]"
            href="/"
          >
            麻将迷
          </Link>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            玩家中心
          </h1>
          <p className="mt-2 text-lg font-medium text-[#f1dba5]">
            {pageData.data.store_name}
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#c8bca8]">
            从熟人圈到下一局预约，把每一次到店沉淀成可分享、可复购的休闲体验。
          </p>
          <span className="mt-5 inline-block rounded-full border border-[#d3a443]/40 bg-[#173f35] px-4 py-1.5 text-xs font-medium text-[#f1dba5]">
            娱乐积分，仅作休闲记录
          </span>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                className="rounded-2xl bg-[#173f35] px-4 py-4"
                key={metric.label}
              >
                <p className="text-xs text-[#c8bca8]">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold">
                  {metric.value}
                  <span className="ml-1 text-sm font-normal text-[#c8bca8]">
                    {metric.suffix}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9b7428]">
          快速操作
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link
              className="group flex items-start justify-between gap-4 rounded-2xl border border-[#dbc99e] bg-[#fff8ea] p-5 transition hover:border-[#b7892c]"
              href={shortcut.href}
              key={shortcut.title}
            >
              <div>
                <p className="font-semibold text-[#12332a]">{shortcut.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-[#5d756d]">
                  {shortcut.description}
                </p>
              </div>
              <span className="mt-0.5 shrink-0 text-[#d3a443] opacity-50 transition group-hover:opacity-100">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Data Overview */}
      <div className="mx-auto max-w-6xl space-y-5 px-5 pb-12">
        {/* 推荐熟人圈 */}
        <DataCard title="推荐熟人圈">
          {recommendedCircles.length === 0 ? (
            <EmptyState>暂无熟人圈数据。</EmptyState>
          ) : (
            <div className="space-y-2">
              {recommendedCircles.map((circle) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f1e6] px-4 py-3"
                  key={circle.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#12332a]">
                      {circle.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#5d756d]">
                      圈主：{circle.owner?.display_name ?? "未命名用户"}
                      {" · "}
                      {circle.member_count} 人 · {circle.game_count} 局
                    </p>
                  </div>
                  {circle.member_count >= 4 ? (
                    <span className="shrink-0 rounded-full bg-[#d3a443] px-2.5 py-1 text-xs font-semibold text-[#12332a]">
                      可开局
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </DataCard>

        <div className="grid gap-5 md:grid-cols-2">
          {/* 可用卡券预览 */}
          <DataCard title="可用卡券">
            {couponPreview.length === 0 ? (
              <EmptyState>暂无可用卡券。</EmptyState>
            ) : (
              <div className="space-y-2">
                {couponPreview.map((coupon) => (
                  <div
                    className="rounded-xl bg-[#f7f1e6] px-4 py-3"
                    key={coupon.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[#12332a]">
                        {coupon.name}
                      </p>
                      <span className="shrink-0 rounded-full border border-[#dbc99e] bg-[#fff8ea] px-2 py-0.5 text-xs text-[#9b7428]">
                        {formatCouponType(coupon.coupon_type)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#5d756d]">
                      {formatDateTime(coupon.valid_from)} —{" "}
                      {formatDateTime(coupon.valid_to)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DataCard>

          {/* 今日预约预览 */}
          <DataCard title="今日预约">
            {reservationPreview.length === 0 ? (
              <EmptyState>今日暂无预约。</EmptyState>
            ) : (
              <div className="space-y-2">
                {reservationPreview.map((reservation) => (
                  <div
                    className="rounded-xl bg-[#f7f1e6] px-4 py-3"
                    key={reservation.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[#12332a]">
                        {reservation.room?.name ?? "未命名包厢"}
                      </p>
                      <span className="shrink-0 rounded-full border border-[#dbc99e] bg-[#fff8ea] px-2 py-0.5 text-xs text-[#5d756d]">
                        {reservation.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#5d756d]">
                      {reservation.start_time} — {reservation.end_time}
                      {reservation.circle ? ` · ${reservation.circle.name}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DataCard>
        </div>

        {/* 最新战绩海报 */}
        <DataCard title="最新战绩海报">
          {latestResultCard ? (
            <div className="rounded-xl bg-[#f7f1e6] p-4">
              <p className="font-medium text-[#12332a]">
                {latestResultCard.result_card.card_title}
              </p>
              <p className="mt-1 text-xs text-[#5d756d]">
                {latestResultCard.circle?.name ?? "未关联圈子"}
                {" · "}分享 {latestResultCard.result_card.share_count} 次
                {" · "}MVP：{mvpResult?.user?.display_name ?? "暂无"}
              </p>
              <p className="mt-4 rounded-lg bg-[#12332a] px-3 py-2.5 text-xs font-medium text-[#f1dba5]">
                娱乐积分，仅作休闲记录。
              </p>
            </div>
          ) : (
            <EmptyState>暂无战绩海报数据。</EmptyState>
          )}
        </DataCard>

        {/* 今日建议 */}
        <DataCard title="今日建议">
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div
                className="flex items-start gap-3 rounded-xl bg-[#f7f1e6] px-4 py-3"
                key={tip}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#12332a] text-xs font-semibold text-[#f1dba5]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[#12332a]">{tip}</p>
              </div>
            ))}
          </div>
        </DataCard>
      </div>
    </PlayerShell>
  );
}

async function loadPlayerOverviewData(): Promise<
  | { status: "empty" }
  | { data: PlayerOverviewData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const [circles, coupons, reservations, latestResultCard] = await Promise.all([
    listCirclesWithMembersByStore(store.id),
    listCouponsWithRedemptionsByStore(store.id),
    listReservationsWithDetailsByStore(store.id),
    getLatestResultCardDetailsByStore(store.id),
  ]);
  const activeCoupons = coupons.filter((coupon) => coupon.status === "active");
  const todayDate = getTodayDateString();
  const todayReservations = reservations.filter(
    (reservation) => reservation.reservation_date === todayDate,
  );

  return {
    data: {
      active_coupons: activeCoupons,
      circles,
      latest_result_card: latestResultCard,
      store_name: store.name,
      today_reservations: todayReservations,
    },
    status: "ready",
  };
}

function buildMetrics(data: PlayerOverviewData): Metric[] {
  return [
    { label: "熟人圈数量", suffix: "个", value: data.circles.length },
    { label: "可用卡券数量", suffix: "张", value: data.active_coupons.length },
    {
      label: "今日预约数量",
      suffix: "场",
      value: data.today_reservations.length,
    },
    {
      label: "最新战绩海报",
      suffix: "张",
      value: data.latest_result_card ? 1 : 0,
    },
  ];
}

function buildTips(data: PlayerOverviewData): string[] {
  const hasReadyCircle = data.circles.some(
    (circle) => circle.member_count >= 4,
  );
  const hasTimeSlotCoupon = data.active_coupons.some(
    (coupon) => coupon.coupon_type === "time_slot",
  );
  const tips: string[] = [];

  if (hasReadyCircle) {
    tips.push("熟人圈人数完整，可直接开局");
  }

  if (hasTimeSlotCoupon) {
    tips.push("可优先用于工作日或空置时段预约");
  }

  if (data.today_reservations.length > 0) {
    tips.push("今日已有预约，请提前确认到店时间");
  }

  if (data.latest_result_card) {
    tips.push("可分享战绩海报邀请好友下一局");
  }

  if (tips.length === 0) {
    tips.push("可先查看熟人圈和可用卡券，再安排下一局");
  }

  return tips;
}

function sortRecommendedCircles(
  circles: CircleWithDetails[],
): CircleWithDetails[] {
  return [...circles].sort((first, second) => {
    const firstReady = first.member_count >= 4 ? 1 : 0;
    const secondReady = second.member_count >= 4 ? 1 : 0;

    if (secondReady !== firstReady) {
      return secondReady - firstReady;
    }

    return second.game_count - first.game_count;
  });
}

function getTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(new Date());
}

function formatCouponType(couponType: string): string {
  const labels: Record<string, string> = {
    campaign: "活动券",
    snack: "小食券",
    store_service: "门店服务券",
    tea: "茶水券",
    time_slot: "时段券",
  };

  return labels[couponType] ?? couponType;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "未设置";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PlayerShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#12332a]">{children}</main>
  );
}

function DataCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9b7428]">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-[#f7f1e6] px-4 py-3 text-sm text-[#5d756d]">
      {children}
    </p>
  );
}

function renderNoStoreState() {
  return (
    <section className="bg-[#12332a] px-5 py-8 text-[#fff8ea]">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm text-[#f1dba5]" href="/">
          麻将迷
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">暂无门店数据</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[#e8dbc4]">
          当前没有可用于展示的 active 门店。添加门店测试数据后，玩家首页会显示真实概览。
        </p>
      </div>
    </section>
  );
}
