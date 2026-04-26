import Link from "next/link";
import type { ReactNode } from "react";

import { inviteUserToCircleAction } from "./actions";
import { OperationMessage } from "@/components/operation-message";
import {
  listCirclesWithMembersByStore,
  type CircleWithDetails,
} from "@/lib/services/circle_service";
import { listCouponClaimUsers } from "@/lib/services/coupon_service";
import { getFirstActiveStore } from "@/lib/services/dashboard_service";

export const dynamic = "force-dynamic";

type PlayerCirclePageData = {
  circles: CircleWithDetails[];
  store_id: string;
  store_name: string;
  users: { display_name: string; id: string }[];
};

type PlayerCirclesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function PlayerCirclesPage({
  searchParams,
}: PlayerCirclesPageProps) {
  const pageData = await loadPlayerCirclePageData();
  const params = (await searchParams) ?? {};

  if (pageData.status === "empty") {
    return <PlayerCircleShell>{renderNoStoreState()}</PlayerCircleShell>;
  }

  const metrics = buildMetrics(pageData.data.circles);
  const tips = buildTips(pageData.data.circles);
  const inviteStatus = getParam(params, "invite_status");
  const inviteError = getParam(params, "invite_error");

  return (
    <PlayerCircleShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">熟人圈列表</p>
        <h1 className="mt-3 text-3xl font-semibold">我的熟人圈</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          和常约牌友保持连接，查看成员数、累计局数与最近活跃时间。
        </p>
        <p className="mt-4 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <InviteFeedback
        couponName={getParam(params, "coupon_name")}
        error={inviteError}
        referredName={getParam(params, "referred_name")}
        referrerName={getParam(params, "referrer_name")}
        status={inviteStatus}
      />

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

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <p className="text-sm font-semibold text-[#9b7428]">熟人圈提示</p>
        <div className="mt-4 grid gap-3">
          {tips.map((tip) => (
            <div
              className="rounded-2xl bg-[#f7f1e6] p-4 text-sm font-medium leading-6"
              key={tip}
            >
              {tip}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {pageData.data.circles.length === 0 ? (
          <div className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-6 text-sm leading-7 text-[#4d665e]">
            暂无熟人圈数据。
          </div>
        ) : (
          pageData.data.circles.map((circle) => {
            const invitableUsers = pageData.data.users.filter(
              (user) => user.id !== circle.owner_user_id,
            );

            return (
              <article
                className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm"
                key={circle.id}
              >
                <div className="grid gap-5 md:grid-cols-[1fr_0.9fr] md:items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{circle.name}</h2>
                    <p className="mt-2 text-sm text-[#4d665e]">
                      圈主：{circle.owner?.display_name ?? "未命名圈主"}
                    </p>
                    <p className="mt-2 text-sm text-[#4d665e]">
                      最近活跃：{formatDateTime(circle.last_active_at)}
                    </p>
                    <p className="mt-2 text-sm text-[#4d665e]">
                      状态：{circle.status}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="成员数"
                      value={`${circle.member_count} 人`}
                    />
                    <MetricCard
                      label="累计局数"
                      value={`${circle.game_count} 局`}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f7f1e6] p-4">
                  <p className="text-sm font-semibold text-[#9b7428]">
                    成员列表
                  </p>
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

                <div className="mt-5 rounded-2xl bg-[#f7f1e6] p-4">
                  <p className="text-sm font-semibold text-[#9b7428]">
                    邀请好友加入
                  </p>
                  {invitableUsers.length === 0 ? (
                    <p className="mt-3 text-sm leading-7 text-[#4d665e]">
                      暂无可邀请用户。
                    </p>
                  ) : (
                    <form
                      action={inviteUserToCircleAction}
                      className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
                    >
                      <input
                        name="circle_id"
                        type="hidden"
                        value={circle.id}
                      />
                      <input
                        name="store_id"
                        type="hidden"
                        value={pageData.data.store_id}
                      />
                      <input
                        name="referrer_user_id"
                        type="hidden"
                        value={circle.owner_user_id}
                      />
                      <select
                        className="min-h-12 rounded-2xl border border-[#dbc99e] bg-[#fff8ea] px-4 py-3 text-sm text-[#12332a] outline-none focus:border-[#b7892c]"
                        name="referred_user_id"
                        required
                      >
                        <option value="">请选择要邀请的好友</option>
                        {invitableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.display_name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="rounded-full bg-[#12332a] px-5 py-3 text-sm font-semibold text-[#fff8ea] transition hover:bg-[#173f35]"
                        type="submit"
                      >
                        发出邀请
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-full border border-[#b7892c] px-4 py-3 text-sm font-semibold text-[#12332a]"
                    type="button"
                  >
                    查看圈子
                  </button>
                  <button
                    className="rounded-full bg-[#d3a443] px-4 py-3 text-sm font-semibold text-[#12332a]"
                    type="button"
                  >
                    预约下一局
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </PlayerCircleShell>
  );
}

async function loadPlayerCirclePageData(): Promise<
  | { status: "empty" }
  | { data: PlayerCirclePageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const [circles, users] = await Promise.all([
    listCirclesWithMembersByStore(store.id),
    listCouponClaimUsers(),
  ]);

  return {
    data: {
      circles,
      store_id: store.id,
      store_name: store.name,
      users,
    },
    status: "ready",
  };
}

function buildMetrics(circles: CircleWithDetails[]): Metric[] {
  const activeCircleCount = circles.filter(
    (circle) => circle.status === "active",
  ).length;
  const totalGameCount = circles.reduce(
    (total, circle) => total + circle.game_count,
    0,
  );

  return [
    { label: "我的熟人圈总数", suffix: "个", value: circles.length },
    { label: "活跃圈子数", suffix: "个", value: activeCircleCount },
    { label: "累计开局数", suffix: "局", value: totalGameCount },
  ];
}

function buildTips(circles: CircleWithDetails[]): string[] {
  const activeCircleCount = circles.filter(
    (circle) => circle.status === "active",
  ).length;
  const totalGameCount = circles.reduce(
    (total, circle) => total + circle.game_count,
    0,
  );
  const hasCompleteCircle = circles.some((circle) => circle.member_count >= 4);
  const tips: string[] = [];

  if (circles.length === 0) {
    tips.push("先创建一个固定熟人圈，方便下次快速开局");
  }

  if (activeCircleCount > 0) {
    tips.push("优先约活跃圈子的牌友，成局效率更高");
  }

  if (totalGameCount > 0) {
    tips.push("可生成圈子战绩海报，提升熟人圈参与感");
  }

  if (hasCompleteCircle) {
    tips.push("该圈子人数完整，可直接预约下一局");
  }

  if (tips.length === 0) {
    tips.push("先沉淀常约牌友，形成稳定熟人圈");
  }

  return tips;
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

function InviteFeedback({
  couponName,
  error,
  referredName,
  referrerName,
  status,
}: {
  couponName: string | null;
  error: string | null;
  referredName: string | null;
  referrerName: string | null;
  status: string | null;
}) {
  if (error) {
    return (
      <OperationMessage description={error} title="邀请失败" type="error" />
    );
  }

  if (!status) {
    return null;
  }

  const isRepeated = status === "already_invited";
  const items = [
    `邀请人：${referrerName ?? "未命名用户"}`,
    `被邀请人：${referredName ?? "未命名用户"}`,
  ];

  if (!isRepeated && couponName) {
    items.push(`已自动发放卡券：${couponName}`);
  }

  return (
    <OperationMessage
      items={items}
      title={isRepeated ? "该用户已被邀请过" : "邀请已发出"}
      type={isRepeated ? "warning" : "success"}
    />
  );
}

function PlayerCircleShell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">熟人圈列表</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实熟人圈列表。
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
