import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listCirclesWithMembersByStore,
  type CircleWithDetails,
} from "@/lib/services/circle_service";

export const dynamic = "force-dynamic";

type CirclePageData = {
  circles: CircleWithDetails[];
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function AdminCirclesPage() {
  const pageData = await loadCirclePageData();

  if (pageData.status === "empty") {
    return <CircleShell>{renderNoStoreState()}</CircleShell>;
  }

  const metrics = buildMetrics(pageData.data.circles);
  const suggestions = buildSuggestions(pageData.data.circles);

  return (
    <CircleShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">圈子管理</p>
        <h1 className="mt-3 text-3xl font-semibold">活跃熟人圈</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看圈主、成员数、累计局数、最近活跃、状态与成员列表。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="mt-6 grid gap-4">
        {pageData.data.circles.length === 0 ? (
          <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-6 text-sm leading-7 text-[#4d665e]">
            暂无圈子数据。
          </div>
        ) : (
          pageData.data.circles.map((circle) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={circle.id}
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-start">
                <div>
                  <h2 className="text-2xl font-semibold">{circle.name}</h2>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    圈主：{circle.owner?.display_name ?? "未命名圈主"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    最近活跃：{formatDateTime(circle.last_active_at)}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    状态：{circle.status}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="成员数" value={`${circle.member_count} 人`} />
                  <MetricCard label="累计局数" value={`${circle.game_count} 局`} />
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-[#f7f1e6] p-4">
                <p className="text-sm font-semibold text-[#9b7428]">成员列表</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {circle.members.length > 0 ? (
                    circle.members.map((member) => (
                      <span
                        className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold"
                        key={member.id}
                      >
                        {member.user?.display_name ?? "未命名成员"}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[#fff8ea] px-3 py-1 text-xs font-semibold text-[#5d756d]">
                      暂无成员
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </CircleShell>
  );
}

async function loadCirclePageData(): Promise<
  | { status: "empty" }
  | { data: CirclePageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const circles = await listCirclesWithMembersByStore(store.id);

  return {
    data: {
      circles,
      store_name: store.name,
    },
    status: "ready",
  };
}

function buildMetrics(circles: CircleWithDetails[]): Metric[] {
  const activeCircleCount = circles.filter(
    (circle) => circle.status === "active",
  ).length;
  const ownerCount = new Set(circles.map((circle) => circle.owner_user_id)).size;
  const totalGameCount = circles.reduce(
    (total, circle) => total + circle.game_count,
    0,
  );

  return [
    { label: "圈子总数", suffix: "个", value: circles.length },
    { label: "活跃圈子数", suffix: "个", value: activeCircleCount },
    { label: "圈主数量", suffix: "人", value: ownerCount },
    { label: "累计开局数", suffix: "局", value: totalGameCount },
  ];
}

function buildSuggestions(circles: CircleWithDetails[]): string[] {
  const activeCircleCount = circles.filter(
    (circle) => circle.status === "active",
  ).length;
  const totalGameCount = circles.reduce(
    (total, circle) => total + circle.game_count,
    0,
  );
  const hasCompleteCircle = circles.some((circle) => circle.member_count >= 4);
  const hasInactiveCircle = circles.some((circle) => isInactive7Days(circle));
  const suggestions: string[] = [];

  if (circles.length === 0) {
    suggestions.push("建议先引导熟人局创建固定圈子");
  }

  if (activeCircleCount > 0) {
    suggestions.push("建议重点维护高活跃熟人圈");
  }

  if (totalGameCount > 0) {
    suggestions.push("建议围绕高频圈子做圈主权益");
  }

  if (hasCompleteCircle) {
    suggestions.push("建议推动完整熟人圈预约下一局");
  }

  if (hasInactiveCircle) {
    suggestions.push("建议发放圈子召回券");
  }

  if (suggestions.length === 0) {
    suggestions.push("建议持续沉淀熟人圈成员关系");
  }

  return suggestions;
}

function isInactive7Days(circle: CircleWithDetails): boolean {
  if (!circle.last_active_at) {
    return true;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return new Date(circle.last_active_at) < sevenDaysAgo;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "未记录";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CircleShell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">圈子管理</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实圈子列表。
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
    <div className="rounded-2xl bg-[#f7f1e6] p-4">
      <p className="text-sm text-[#5d756d]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
