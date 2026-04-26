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
      <section className="bg-[#12332a] px-5 py-8 text-[#fff8ea]">
        <div className="mx-auto max-w-6xl">
          <Link className="text-sm text-[#f1dba5]" href="/">
            麻将迷
          </Link>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            玩家中心
          </h1>
          <p className="mt-3 text-xl font-semibold">
            {pageData.data.store_name}
          </p>
          <p className="mt-3 max-w-2xl leading-7 text-[#e8dbc4]">
            从熟人圈到下一局预约，把每一次到店沉淀成可分享、可复购的休闲体验。
          </p>
          <p className="mt-5 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
            娱乐积分，仅作休闲记录。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm transition hover:border-[#b7892c]"
              href={shortcut.href}
              key={shortcut.title}
            >
              <p className="text-xl font-semibold">{shortcut.title}</p>
              <p className="mt-3 leading-7 text-[#4d665e]">
                {shortcut.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
          <p className="text-sm font-semibold text-[#9b7428]">今日建议</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {tips.map((tip) => (
              <div
                className="rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium leading-6"
                key={tip}
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-10 lg:grid-cols-2">
        <OverviewSection title="推荐熟人圈">
          {recommendedCircles.length === 0 ? (
            <EmptyLine>暂无熟人圈数据。</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {recommendedCircles.map((circle) => (
                <article
                  className="rounded-2xl bg-[#f7f1e6] p-4"
                  key={circle.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{circle.name}</h3>
                      <p className="mt-2 text-sm text-[#5d756d]">
                        圈主：{circle.owner?.display_name ?? "未命名用户"}
                      </p>
                    </div>
                    {circle.member_count >= 4 ? (
                      <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold">
                        可开局
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <SmallMetric
                      label="成员数"
                      value={`${circle.member_count} 人`}
                    />
                    <SmallMetric
                      label="累计局数"
                      value={`${circle.game_count} 局`}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </OverviewSection>

        <OverviewSection title="可用卡券预览">
          {couponPreview.length === 0 ? (
            <EmptyLine>暂无可用卡券。</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {couponPreview.map((coupon) => (
                <article
                  className="rounded-2xl bg-[#f7f1e6] p-4"
                  key={coupon.id}
                >
                  <h3 className="text-xl font-semibold">{coupon.name}</h3>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    类型：{formatCouponType(coupon.coupon_type)}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    有效期：{formatDateTime(coupon.valid_from)} 至{" "}
                    {formatDateTime(coupon.valid_to)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </OverviewSection>

        <OverviewSection title="今日预约预览">
          {reservationPreview.length === 0 ? (
            <EmptyLine>今日暂无预约。</EmptyLine>
          ) : (
            <div className="grid gap-3">
              {reservationPreview.map((reservation) => (
                <article
                  className="rounded-2xl bg-[#f7f1e6] p-4"
                  key={reservation.id}
                >
                  <h3 className="text-xl font-semibold">
                    {reservation.room?.name ?? "未命名包厢"}
                  </h3>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    圈子：{reservation.circle?.name ?? "未关联圈子"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    时间：{reservation.start_time} - {reservation.end_time}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    状态：{reservation.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </OverviewSection>

        <OverviewSection title="最新战绩海报预览">
          {latestResultCard ? (
            <article className="rounded-2xl bg-[#f7f1e6] p-4">
              <h3 className="text-xl font-semibold">
                {latestResultCard.result_card.card_title}
              </h3>
              <p className="mt-2 text-sm text-[#5d756d]">
                圈子：{latestResultCard.circle?.name ?? "未关联圈子"}
              </p>
              <p className="mt-2 text-sm text-[#5d756d]">
                分享次数：{latestResultCard.result_card.share_count} 次
              </p>
              <p className="mt-2 text-sm text-[#5d756d]">
                MVP 玩家：{mvpResult?.user?.display_name ?? "暂无"}
              </p>
              <p className="mt-4 rounded-2xl bg-[#12332a] p-3 text-sm text-[#f1dba5]">
                娱乐积分，仅作休闲记录。
              </p>
            </article>
          ) : (
            <EmptyLine>暂无战绩海报数据。</EmptyLine>
          )}
        </OverviewSection>
      </section>
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
  return <main className="min-h-screen bg-[#f7f1e6] text-[#12332a]">{children}</main>;
}

function OverviewSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
      <p className="text-sm font-semibold text-[#9b7428]">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fff8ea] p-3">
      <p className="text-xs text-[#5d756d]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-[#f7f1e6] p-4 text-sm leading-7 text-[#4d665e]">
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
