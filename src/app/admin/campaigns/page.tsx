import Link from "next/link";
import type { ReactNode } from "react";

import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listCampaignsWithParticipantsByStore,
  type CampaignWithParticipants,
} from "@/lib/services/campaign_service";

export const dynamic = "force-dynamic";

type CampaignPageData = {
  campaigns: CampaignWithParticipants[];
  store_name: string;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function AdminCampaignsPage() {
  const pageData = await loadCampaignPageData();

  if (pageData.status === "empty") {
    return <CampaignShell>{renderNoStoreState()}</CampaignShell>;
  }

  const metrics = buildMetrics(pageData.data.campaigns);
  const suggestions = buildSuggestions(pageData.data.campaigns);

  return (
    <CampaignShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">活动管理</p>
        <h1 className="mt-3 text-3xl font-semibold">门店活动模板</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看活动类型、报名用户、关联圈子与预约安排。
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
        {pageData.data.campaigns.length === 0 ? (
          <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-6 text-sm leading-7 text-[#4d665e]">
            暂无活动数据。
          </div>
        ) : (
          pageData.data.campaigns.map((campaign) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
              key={campaign.id}
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr] lg:items-start">
                <div>
                  <h2 className="text-2xl font-semibold">{campaign.name}</h2>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    类型：{formatCampaignType(campaign.campaign_type)}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    描述：{campaign.description ?? "未填写"}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    开始时间：{formatDateTime(campaign.starts_at)}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    结束时间：{formatDateTime(campaign.ends_at)}
                  </p>
                  <p className="mt-2 text-sm text-[#5d756d]">
                    状态：{campaign.status}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="报名人数"
                    value={`${campaign.participants.length} 人`}
                  />
                  <MetricCard
                    label="到店人数"
                    value={`${countArrivedParticipants(campaign)} 人`}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {campaign.participants.length === 0 ? (
                  <div className="rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium text-[#5d756d]">
                    暂无报名用户
                  </div>
                ) : (
                  campaign.participants.map((participant) => (
                    <div
                      className="rounded-2xl bg-[#f7f1e6] p-4"
                      key={participant.id}
                    >
                      <p className="text-sm font-semibold text-[#12332a]">
                        参与用户：
                        {participant.user?.display_name ?? "未命名用户"}
                      </p>
                      <p className="mt-2 text-sm text-[#5d756d]">
                        关联圈子：{participant.circle?.name ?? "未关联圈子"}
                      </p>
                      <p className="mt-2 text-sm text-[#5d756d]">
                        关联预约：{formatReservation(participant.reservation)}
                      </p>
                      <p className="mt-2 text-sm text-[#5d756d]">
                        参与状态：{participant.status}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </CampaignShell>
  );
}

async function loadCampaignPageData(): Promise<
  | { status: "empty" }
  | { data: CampaignPageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const campaigns = await listCampaignsWithParticipantsByStore(store.id);

  return {
    data: {
      campaigns,
      store_name: store.name,
    },
    status: "ready",
  };
}

function buildMetrics(campaigns: CampaignWithParticipants[]): Metric[] {
  const enrollingCount = campaigns.filter(
    (campaign) => campaign.status === "enrolling",
  ).length;
  const runningCount = campaigns.filter(
    (campaign) => campaign.status === "running",
  ).length;
  const completedCount = campaigns.filter(
    (campaign) => campaign.status === "completed",
  ).length;
  const signedUpCount = campaigns.reduce(
    (total, campaign) => total + campaign.participants.length,
    0,
  );
  const arrivedCount = campaigns.reduce(
    (total, campaign) => total + countArrivedParticipants(campaign),
    0,
  );

  return [
    { label: "活动总数", suffix: "个", value: campaigns.length },
    { label: "招募中活动数", suffix: "个", value: enrollingCount },
    { label: "进行中活动数", suffix: "个", value: runningCount },
    { label: "已完成活动数", suffix: "个", value: completedCount },
    { label: "报名人数", suffix: "人", value: signedUpCount },
    { label: "到店人数", suffix: "人", value: arrivedCount },
  ];
}

function buildSuggestions(campaigns: CampaignWithParticipants[]): string[] {
  const enrollingCount = campaigns.filter(
    (campaign) => campaign.status === "enrolling",
  ).length;
  const completedCount = campaigns.filter(
    (campaign) => campaign.status === "completed",
  ).length;
  const signedUpCount = campaigns.reduce(
    (total, campaign) => total + campaign.participants.length,
    0,
  );
  const hasWeekdayActivation = campaigns.some(
    (campaign) => campaign.campaign_type === "weekday_activation",
  );
  const suggestions: string[] = [];

  if (campaigns.length === 0) {
    suggestions.push("建议先发布好友局或工作日激活活动");
  }

  if (enrollingCount > 0) {
    suggestions.push("建议把招募中活动同步到门店私域");
  }

  if (signedUpCount > 0) {
    suggestions.push("建议提前确认报名用户到店时间");
  }

  if (completedCount > 0) {
    suggestions.push("建议复盘活动转化并复制有效活动模板");
  }

  if (hasWeekdayActivation) {
    suggestions.push("建议持续用于激活工作日空置时段");
  }

  if (suggestions.length === 0) {
    suggestions.push("建议持续观察活动报名与到店表现");
  }

  return suggestions;
}

function countArrivedParticipants(campaign: CampaignWithParticipants): number {
  return campaign.participants.filter(
    (participant) =>
      participant.status === "arrived" || participant.status === "completed",
  ).length;
}

function formatCampaignType(campaignType: string): string {
  const labels: Record<string, string> = {
    birthday_game: "生日局",
    circle_board: "圈子榜",
    friend_game: "好友局",
    member_referral: "老带新",
    weekday_activation: "工作日激活",
  };

  return labels[campaignType] ?? campaignType;
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

function formatReservation(
  reservation: CampaignWithParticipants["participants"][number]["reservation"],
): string {
  if (!reservation) {
    return "未关联预约";
  }

  return `${reservation.reservation_date} ${reservation.start_time}-${reservation.end_time}`;
}

function CampaignShell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">活动管理</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实活动列表。
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
