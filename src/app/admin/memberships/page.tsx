import Link from "next/link";
import type { ReactNode } from "react";

import {
  getFirstActiveStore,
  getInactiveMembers7Days,
  listMembershipsWithUsersByStore,
  type MembershipWithUser,
} from "@/lib/services/membership_service";

export const dynamic = "force-dynamic";

type MembershipPageData = {
  inactive_member_count: number;
  members: MembershipWithUser[];
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function AdminMembershipsPage() {
  const pageData = await loadMembershipPageData();

  if (pageData.status === "empty") {
    return <MembershipShell>{renderEmptyState()}</MembershipShell>;
  }

  if (pageData.status === "error") {
    return <MembershipShell>{renderErrorState()}</MembershipShell>;
  }

  const metrics = buildMetrics(pageData.data);
  const suggestions = buildSuggestions(pageData.data);

  return (
    <MembershipShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">会员管理</p>
        <h1 className="mt-3 text-3xl font-semibold">门店会员沉淀</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看会员等级、到店次数、开局次数、最近到店与用户标签。
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

      <section className="mt-6 overflow-hidden rounded-3xl border border-[#dbc99e] bg-[#fff8ea]">
        {pageData.data.members.length === 0 ? (
          <div className="p-6 text-sm leading-7 text-[#4d665e]">
            当前门店暂无会员数据。
          </div>
        ) : (
          pageData.data.members.map((member) => (
            <article
              className="border-b border-[#e1cfaa] p-5 last:border-b-0"
              key={member.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {member.users?.display_name ?? "未命名会员"}
                  </h2>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    手机：{member.users?.phone ?? "未填写"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    状态：{member.status}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <MetricCard label="会员等级" value={member.member_level} />
                  <MetricCard label="到店次数" value={`${member.visit_count} 次`} />
                  <MetricCard label="开局次数" value={`${member.game_count} 局`} />
                  <MetricCard
                    label="最近到店"
                    value={formatDateTime(member.last_visit_at)}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.tags.length > 0 ? (
                  member.tags.map((tag) => (
                    <span
                      className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-[#f7f1e6] px-3 py-1 text-xs font-semibold text-[#5d756d]">
                    暂无标签
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </MembershipShell>
  );
}

async function loadMembershipPageData(): Promise<
  | { status: "empty" }
  | { status: "error" }
  | { data: MembershipPageData; status: "ready" }
> {
  try {
    const store = await getFirstActiveStore();

    if (!store) {
      return { status: "empty" };
    }

    const [members, inactiveMembers] = await Promise.all([
      listMembershipsWithUsersByStore(store.id),
      getInactiveMembers7Days(store.id),
    ]);

    return {
      data: {
        inactive_member_count: inactiveMembers.length,
        members,
        store_name: store.name,
      },
      status: "ready",
    };
  } catch {
    return { status: "error" };
  }
}

function buildMetrics(data: MembershipPageData): Metric[] {
  const activeMemberCount = data.members.filter(
    (member) => member.status === "active",
  ).length;
  const repeatMemberCount = data.members.filter(
    (member) => member.visit_count >= 2,
  ).length;
  const priorityMemberCount = data.members.filter((member) =>
    isPriorityMember(member.member_level),
  ).length;

  return [
    { label: "会员总数", suffix: "人", value: data.members.length },
    { label: "活跃会员数", suffix: "人", value: activeMemberCount },
    { label: "老客数量", suffix: "人", value: repeatMemberCount },
    { label: "圈主/高价值用户数量", suffix: "人", value: priorityMemberCount },
  ];
}

function buildSuggestions(data: MembershipPageData): string[] {
  const repeatMemberCount = data.members.filter(
    (member) => member.visit_count >= 2,
  ).length;
  const priorityMemberCount = data.members.filter((member) =>
    isPriorityMember(member.member_level),
  ).length;
  const suggestions: string[] = [];

  if (data.members.length === 0) {
    suggestions.push("建议先引导到店玩家扫码成为会员");
  }

  if (repeatMemberCount > 0) {
    suggestions.push("建议优先维护高频老客");
  }

  if (priorityMemberCount > 0) {
    suggestions.push("建议为圈主发放专属权益券");
  }

  if (data.inactive_member_count > 0) {
    suggestions.push("建议发放老客召回券");
  }

  if (suggestions.length === 0) {
    suggestions.push("建议持续沉淀会员标签，观察复购变化");
  }

  return suggestions;
}

function isPriorityMember(member_level: string): boolean {
  return member_level.includes("circle_owner") || member_level.includes("core");
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

function MembershipShell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">会员管理</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实会员列表。
      </p>
    </section>
  );
}

function renderErrorState() {
  return (
    <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-8">
      <p className="text-sm font-semibold text-[#9b7428]">会员管理</p>
      <h1 className="mt-3 text-3xl font-semibold">数据读取失败</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        请检查 Supabase 环境变量与测试数据配置后重试。
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
