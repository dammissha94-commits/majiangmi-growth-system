import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import { listCouponClaimUsers } from "@/lib/services/coupon_service";
import {
  listUserReservationsWithDetails,
  type ReservationWithDetails,
} from "@/lib/services/reservation_service";

export const dynamic = "force-dynamic";

type PageData = {
  reservations: ReservationWithDetails[];
  store_name: string;
  user_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function PlayerReservationsPage() {
  const pageData = await loadPageData();

  if (pageData.status === "empty") {
    return <Shell>{renderNoStoreState()}</Shell>;
  }

  const { reservations, store_name, user_name } = pageData.data;
  const upcoming = reservations.filter((r) => r.status === "pending" || r.status === "confirmed");
  const past = reservations.filter((r) => r.status !== "pending" && r.status !== "confirmed");
  const metrics = buildMetrics(reservations);

  return (
    <Shell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">我的预约</p>
        <h1 className="mt-3 text-3xl font-semibold">预约记录</h1>
        <p className="mt-3 text-xl font-semibold">{store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看当前演示用户「{user_name}」的预约历史与待确认记录。
        </p>
        <p className="mt-3 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
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
      </section>

      <div className="mt-6 flex justify-end">
        <Link
          className="rounded-full bg-[#12332a] px-5 py-3 text-sm font-semibold text-[#fff8ea] transition hover:bg-[#173f35]"
          href="/player/reservations/new"
        >
          预约新的一局
        </Link>
      </div>

      {upcoming.length > 0 && (
        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9b7428]">
            待确认 / 已确认
          </p>
          <div className="mt-4 grid gap-4">
            {upcoming.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9b7428]">
          历史预约
        </p>
        <div className="mt-4 grid gap-4">
          {past.length === 0 ? (
            <p className="rounded-xl bg-[#fff8ea] px-4 py-3 text-sm text-[#5d756d]">
              暂无历史预约记录。
            </p>
          ) : (
            past.map((r) => <ReservationCard key={r.id} reservation={r} />)
          )}
        </div>
      </section>
    </Shell>
  );
}

async function loadPageData(): Promise<
  { status: "empty" } | { data: PageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const users = await listCouponClaimUsers();
  const demoUser = users[0];

  if (!demoUser) {
    return { status: "empty" };
  }

  const reservations = await listUserReservationsWithDetails(
    demoUser.id,
    store.id,
  );

  return {
    data: {
      reservations,
      store_name: store.name,
      user_name: demoUser.display_name,
    },
    status: "ready",
  };
}

function buildMetrics(reservations: ReservationWithDetails[]): Metric[] {
  const total = reservations.length;
  const upcoming = reservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed",
  ).length;
  const completed = reservations.filter(
    (r) => r.status === "completed",
  ).length;

  return [
    { label: "总预约数", suffix: "次", value: total },
    { label: "待确认 / 已确认", suffix: "场", value: upcoming },
    { label: "已完成", suffix: "场", value: completed },
  ];
}

function ReservationCard({ reservation }: { reservation: ReservationWithDetails }) {
  return (
    <article className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">
              {reservation.room?.name ?? "未命名包厢"}
            </h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(reservation.status)}`}>
              {formatStatus(reservation.status)}
            </span>
          </div>
          <p className="mt-3 text-sm text-[#5d756d]">
            日期：{reservation.reservation_date}
          </p>
          <p className="mt-1 text-sm text-[#5d756d]">
            时段：{reservation.start_time} — {reservation.end_time}
          </p>
          {reservation.circle ? (
            <p className="mt-1 text-sm text-[#5d756d]">
              圈子：{reservation.circle.name}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    cancelled: "已取消",
    completed: "已完成",
    confirmed: "已确认",
    no_show: "未到店",
    pending: "待确认",
  };

  return labels[status] ?? status;
}

function statusStyle(status: string): string {
  if (status === "completed") {
    return "bg-[#12332a] text-[#f1dba5]";
  }

  if (status === "confirmed") {
    return "bg-[#d3f0e0] text-[#12332a]";
  }

  if (status === "cancelled" || status === "no_show") {
    return "bg-[#f0d3d3] text-[#5a1a1a]";
  }

  return "bg-[#f1dba5] text-[#12332a]";
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-8 text-[#12332a]">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-medium text-[#9b7428]" href="/player">
          返回玩家中心
        </Link>
        {children}
      </div>
    </main>
  );
}

function renderNoStoreState() {
  return (
    <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-8">
      <p className="text-sm font-semibold text-[#9b7428]">我的预约</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店或用户数据。
      </p>
    </section>
  );
}
