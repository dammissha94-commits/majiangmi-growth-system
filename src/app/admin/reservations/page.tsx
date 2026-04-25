import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listReservationsWithDetailsByStore,
  type ReservationWithDetails,
} from "@/lib/services/reservation_service";

export const dynamic = "force-dynamic";

type ReservationPageData = {
  reservations: ReservationWithDetails[];
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function AdminReservationsPage() {
  const pageData = await loadReservationPageData();

  if (pageData.status === "empty") {
    return <ReservationShell>{renderNoStoreState()}</ReservationShell>;
  }

  const metrics = buildMetrics(pageData.data.reservations);
  const suggestions = buildSuggestions(pageData.data.reservations);

  return (
    <ReservationShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">预约管理</p>
        <h1 className="mt-3 text-3xl font-semibold">门店预约排期</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看预约日期、时段、包厢、圈子、预约人、状态与来源。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      <section className="mt-6 overflow-hidden rounded-3xl border border-[#dbc99e] bg-[#fff8ea]">
        {pageData.data.reservations.length === 0 ? (
          <div className="p-6 text-sm leading-7 text-[#4d665e]">
            暂无预约数据。
          </div>
        ) : (
          pageData.data.reservations.map((reservation) => (
            <article
              className="border-b border-[#e1cfaa] p-5 last:border-b-0"
              key={reservation.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {formatDate(reservation.reservation_date)} ·{" "}
                    {reservation.start_time} - {reservation.end_time}
                  </h2>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    包厢：{reservation.room?.name ?? "未设置"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    圈子：{reservation.circle?.name ?? "未关联圈子"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    预约人：{reservation.user?.display_name ?? "未命名用户"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <MetricCard label="来源" value={reservation.source} />
                  <MetricCard label="状态" value={reservation.status} />
                  <MetricCard
                    label="日期"
                    value={reservation.reservation_date}
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </ReservationShell>
  );
}

async function loadReservationPageData(): Promise<
  | { status: "empty" }
  | { data: ReservationPageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const reservations = await listReservationsWithDetailsByStore(store.id);

  return {
    data: {
      reservations,
      store_name: store.name,
    },
    status: "ready",
  };
}

function buildMetrics(reservations: ReservationWithDetails[]): Metric[] {
  const today = new Date().toISOString().slice(0, 10);

  return [
    { label: "预约总数", suffix: "条", value: reservations.length },
    {
      label: "今日预约数",
      suffix: "条",
      value: reservations.filter(
        (reservation) => reservation.reservation_date === today,
      ).length,
    },
    {
      label: "已确认预约数",
      suffix: "条",
      value: reservations.filter(
        (reservation) => reservation.status === "confirmed",
      ).length,
    },
    {
      label: "已到店预约数",
      suffix: "条",
      value: reservations.filter(
        (reservation) => reservation.status === "arrived",
      ).length,
    },
    {
      label: "已完成预约数",
      suffix: "条",
      value: reservations.filter(
        (reservation) => reservation.status === "completed",
      ).length,
    },
  ];
}

function buildSuggestions(reservations: ReservationWithDetails[]): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const todayReservationCount = reservations.filter(
    (reservation) => reservation.reservation_date === today,
  ).length;
  const confirmedCount = reservations.filter(
    (reservation) => reservation.status === "confirmed",
  ).length;
  const completedCount = reservations.filter(
    (reservation) => reservation.status === "completed",
  ).length;
  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "pending",
  ).length;
  const suggestions: string[] = [];

  if (reservations.length === 0) {
    suggestions.push("建议先引导熟人圈预约下一局");
  }

  if (todayReservationCount > 0) {
    suggestions.push("建议提前确认包厢和到店时间");
  }

  if (confirmedCount > 0) {
    suggestions.push("建议提醒店员做好接待准备");
  }

  if (completedCount > 0) {
    suggestions.push("建议引导玩家生成战绩海报并领取复购券");
  }

  if (pendingCount > 0) {
    suggestions.push("建议及时确认待处理预约");
  }

  if (suggestions.length === 0) {
    suggestions.push("建议持续维护熟人圈预约节奏");
  }

  return suggestions;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function ReservationShell({ children }: { children: ReactNode }) {
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

function renderNoStoreState() {
  return (
    <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-8">
      <p className="text-sm font-semibold text-[#9b7428]">预约管理</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实预约列表。
      </p>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-[#f7f1e6] p-3">
      <p className="text-xs text-[#5d756d]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
