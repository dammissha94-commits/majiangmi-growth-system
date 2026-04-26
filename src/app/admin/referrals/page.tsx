import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listReferralsWithDetailsByStore,
  type ReferralWithDetails,
} from "@/lib/services/referral_service";

export const dynamic = "force-dynamic";

type PageData = {
  referrals: ReferralWithDetails[];
  store_name: string;
};

export default async function AdminReferralsPage() {
  const pageData = await loadPageData();

  if (pageData.status === "empty") {
    return <Shell>{renderNoStoreState()}</Shell>;
  }

  const metrics = buildMetrics(pageData.data.referrals);

  return (
    <Shell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">邀请记录</p>
        <h1 className="mt-3 text-3xl font-semibold">圈主邀请记录</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看圈主通过熟人圈邀请好友的记录，追踪新用户引流来源。
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

      <section className="mt-6 grid gap-4">
        {pageData.data.referrals.length === 0 ? (
          <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-6 text-sm leading-7 text-[#4d665e]">
            暂无邀请记录。玩家通过熟人圈发出邀请后会在此显示。
          </div>
        ) : (
          pageData.data.referrals.map((referral) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={referral.id}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCell
                  label="邀请人"
                  value={referral.referrer?.display_name ?? "未命名用户"}
                />
                <InfoCell
                  label="被邀请人"
                  value={referral.referred?.display_name ?? "未命名用户"}
                />
                <InfoCell
                  label="关联圈子"
                  value={referral.circle?.name ?? "未关联圈子"}
                />
                <InfoCell
                  label="邀请来源"
                  value={formatSource(referral.referral_source)}
                />
                <InfoCell
                  label="邀请时间"
                  value={formatDateTime(referral.created_at)}
                />
                <InfoCell
                  label="接受时间"
                  value={
                    referral.accepted_at
                      ? formatDateTime(referral.accepted_at)
                      : "尚未接受"
                  }
                />
                <div className="flex items-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      referral.accepted_at
                        ? "bg-[#12332a] text-[#f1dba5]"
                        : "bg-[#f1dba5] text-[#12332a]"
                    }`}
                  >
                    {referral.accepted_at ? "已接受" : "待接受"}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
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

  const referrals = await listReferralsWithDetailsByStore(store.id);

  return {
    data: { referrals, store_name: store.name },
    status: "ready",
  };
}

function buildMetrics(
  referrals: ReferralWithDetails[],
): { label: string; suffix: string; value: number }[] {
  const circleInviteCount = referrals.filter(
    (r) => r.referral_source === "circle_invite",
  ).length;
  const acceptedCount = referrals.filter((r) => r.accepted_at !== null).length;

  return [
    { label: "邀请总数", suffix: "条", value: referrals.length },
    { label: "圈子邀请", suffix: "条", value: circleInviteCount },
    { label: "已接受", suffix: "条", value: acceptedCount },
    {
      label: "待接受",
      suffix: "条",
      value: referrals.length - acceptedCount,
    },
  ];
}

function formatSource(source: string): string {
  const labels: Record<string, string> = {
    circle_invite: "熟人圈邀请",
    result_card: "战绩海报",
  };

  return labels[source] ?? source;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#5d756d]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#12332a]">{value}</p>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">邀请记录</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实邀请记录。
      </p>
    </section>
  );
}
