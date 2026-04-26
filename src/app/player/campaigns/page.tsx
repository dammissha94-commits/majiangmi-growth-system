import Link from "next/link";
import type { ReactNode } from "react";

import { signUpForCampaignAction } from "./actions";
import { OperationMessage } from "@/components/operation-message";
import { listEnrollingCampaignsByStore } from "@/lib/services/campaign_service";
import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import { listCouponClaimUsers } from "@/lib/services/coupon_service";
import type { Campaign } from "@/types/domain";

export const dynamic = "force-dynamic";

type PlayerCampaignsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PageData = {
  campaigns: Campaign[];
  store_id: string;
  store_name: string;
  users: { display_name: string; id: string }[];
};

export default async function PlayerCampaignsPage({
  searchParams,
}: PlayerCampaignsPageProps) {
  const pageData = await loadPageData();
  const params = (await searchParams) ?? {};

  if (pageData.status === "empty") {
    return <Shell>{renderNoStoreState()}</Shell>;
  }

  const signupStatus = getParam(params, "signup_status");
  const signupError = getParam(params, "signup_error");

  return (
    <Shell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">门店活动</p>
        <h1 className="mt-3 text-3xl font-semibold">报名参与活动</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看当前招募中的门店活动，选择圈子报名参与。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <SignupFeedback
        campaignName={getParam(params, "campaign_name")}
        error={signupError}
        status={signupStatus}
        userName={getParam(params, "user_name")}
      />

      <section className="mt-6 grid gap-4">
        {pageData.data.campaigns.length === 0 ? (
          <OperationMessage
            description="当前暂无招募中活动，可稍后再来查看。"
            title="暂无可报名活动"
            type="info"
          />
        ) : (
          pageData.data.campaigns.map((campaign) => (
            <article
              className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm"
              key={campaign.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{campaign.name}</h2>
                    <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold text-[#12332a]">
                      {formatCampaignType(campaign.campaign_type)}
                    </span>
                    <span className="rounded-full bg-[#12332a] px-3 py-1 text-xs font-semibold text-[#f1dba5]">
                      {formatCampaignStatus(campaign.status)}
                    </span>
                  </div>
                  <p className="mt-3 leading-7 text-[#4d665e]">
                    {campaign.description ?? "暂无活动描述。"}
                  </p>
                  <p className="mt-3 text-sm text-[#5d756d]">
                    开始：{formatDateTime(campaign.starts_at)}
                  </p>
                  <p className="mt-1 text-sm text-[#5d756d]">
                    结束：{formatDateTime(campaign.ends_at)}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f1e6] p-4">
                <p className="text-sm font-semibold text-[#9b7428]">立即报名</p>
                {pageData.data.users.length === 0 ? (
                  <p className="mt-3 text-sm leading-7 text-[#4d665e]">
                    暂无可报名用户。
                  </p>
                ) : (
                  <form
                    action={signUpForCampaignAction}
                    className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
                  >
                    <input
                      name="campaign_id"
                      type="hidden"
                      value={campaign.id}
                    />
                    <select
                      className="min-h-12 rounded-2xl border border-[#dbc99e] bg-[#fff8ea] px-4 py-3 text-sm text-[#12332a] outline-none focus:border-[#b7892c]"
                      name="user_id"
                      required
                    >
                      <option value="">请选择报名用户</option>
                      {pageData.data.users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.display_name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="rounded-full bg-[#12332a] px-5 py-3 text-sm font-semibold text-[#fff8ea] transition hover:bg-[#173f35]"
                      type="submit"
                    >
                      报名参与
                    </button>
                  </form>
                )}
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

  const [campaigns, users] = await Promise.all([
    listEnrollingCampaignsByStore(store.id),
    listCouponClaimUsers(),
  ]);

  return {
    data: {
      campaigns,
      store_id: store.id,
      store_name: store.name,
      users,
    },
    status: "ready",
  };
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

function formatCampaignStatus(status: string): string {
  const labels: Record<string, string> = {
    enrolling: "招募中",
    published: "已发布",
    running: "进行中",
  };

  return labels[status] ?? status;
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

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function SignupFeedback({
  campaignName,
  error,
  status,
  userName,
}: {
  campaignName: string | null;
  error: string | null;
  status: string | null;
  userName: string | null;
}) {
  if (error) {
    return (
      <OperationMessage description={error} title="报名失败" type="error" />
    );
  }

  if (!status) {
    return null;
  }

  const isRepeated = status === "already_signed_up";

  return (
    <OperationMessage
      items={[
        `活动名称：${campaignName ?? "未命名活动"}`,
        `报名用户：${userName ?? "未命名用户"}`,
      ]}
      title={isRepeated ? "该用户已报名此活动" : "报名成功"}
      type={isRepeated ? "warning" : "success"}
    />
  );
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
      <p className="text-sm font-semibold text-[#9b7428]">门店活动</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实活动列表。
      </p>
    </section>
  );
}

