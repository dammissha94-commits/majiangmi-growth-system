import Link from "next/link";
import type { ReactNode } from "react";

import { claimCouponForUserAction } from "@/app/player/coupons/actions";
import { OperationMessage } from "@/components/operation-message";
import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listCouponClaimUsers,
  listCouponsWithRedemptionsByStore,
  type CouponClaimUser,
  type CouponWithRedemptions,
} from "@/lib/services/coupon_service";

export const dynamic = "force-dynamic";

type PlayerCouponPageData = {
  coupons: CouponWithRedemptions[];
  store_id: string;
  store_name: string;
  users: CouponClaimUser[];
};

type PlayerCouponsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function PlayerCouponsPage({
  searchParams,
}: PlayerCouponsPageProps) {
  const pageData = await loadPlayerCouponPageData();
  const params = (await searchParams) ?? {};

  if (pageData.status === "empty") {
    return <CouponShell>{renderNoStoreState()}</CouponShell>;
  }

  const metrics = buildMetrics(pageData.data.coupons);
  const tips = buildTips(pageData.data.coupons);
  const claimStatus = getSearchParam(params, "claim_status");
  const claimError = getSearchParam(params, "claim_error");

  return (
    <CouponShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">我的卡券</p>
        <h1 className="mt-3 text-3xl font-semibold">可用复购权益</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看门店当前可用卡券，适合搭配熟人圈开局和下一次预约使用。
        </p>
        <p className="mt-3 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <OperationMessage
        description="当前仅创建门店卡券领取记录，不涉及任何资金处理。"
        title="当前步骤边界"
        type="info"
      />

      <ClaimFeedback
        couponName={getSearchParam(params, "coupon_name")}
        error={claimError}
        redemptionStatus={getSearchParam(params, "redemption_status")}
        status={claimStatus}
        userName={getSearchParam(params, "user_name")}
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
        <p className="text-sm font-semibold text-[#9b7428]">使用提示</p>
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
      </section>

      <section className="mt-6 grid gap-4">
        {pageData.data.coupons.length === 0 ? (
          <OperationMessage
            description="当前暂无可领取的 active 卡券。"
            title="暂无可用卡券"
            type="info"
          />
        ) : (
          pageData.data.coupons.map((coupon) => {
            const claimedCount = coupon.redemptions.length;
            const usedCount = coupon.redemptions.filter(
              (redemption) => redemption.status === "used",
            ).length;

            return (
              <article
                className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5 shadow-sm"
                key={coupon.id}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold">{coupon.name}</h2>
                      <span className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold text-[#12332a]">
                        {formatCouponType(coupon.coupon_type)}
                      </span>
                    </div>
                    <p className="mt-3 leading-7 text-[#4d665e]">
                      {coupon.description ??
                        "门店服务权益，适合下一次到店使用。"}
                    </p>
                    <p className="mt-3 text-sm text-[#5d756d]">
                      有效期：{formatDateTime(coupon.valid_from)} 至{" "}
                      {formatDateTime(coupon.valid_to)}
                    </p>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      状态：{coupon.status}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:min-w-48">
                    <SmallMetric label="领取人数" value={`${claimedCount} 人`} />
                    <SmallMetric label="使用人数" value={`${usedCount} 人`} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-full border border-[#b7892c] px-4 py-3 text-sm font-semibold text-[#12332a]"
                    type="button"
                  >
                    查看详情
                  </button>
                  <button
                    className="rounded-full bg-[#12332a] px-4 py-3 text-sm font-semibold text-[#fff8ea]"
                    type="button"
                  >
                    去预约下一局
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f7f1e6] p-4">
                  <p className="text-sm font-semibold text-[#9b7428]">
                    领取卡券
                  </p>
                  {pageData.data.users.length === 0 ? (
                    <p className="mt-3 text-sm leading-7 text-[#4d665e]">
                      暂无可领取用户。
                    </p>
                  ) : (
                    <form
                      action={claimCouponForUserAction}
                      className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
                    >
                      <input name="coupon_id" type="hidden" value={coupon.id} />
                      <input
                        name="store_id"
                        type="hidden"
                        value={pageData.data.store_id}
                      />
                      <select
                        className="min-h-12 rounded-2xl border border-[#dbc99e] bg-[#fff8ea] px-4 py-3 text-sm text-[#12332a] outline-none focus:border-[#b7892c]"
                        name="user_id"
                        required
                      >
                        <option value="">请选择领取用户</option>
                        {pageData.data.users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.display_name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="rounded-full bg-[#12332a] px-5 py-3 text-sm font-semibold text-[#fff8ea]"
                        type="submit"
                      >
                        领取卡券
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </CouponShell>
  );
}

async function loadPlayerCouponPageData(): Promise<
  | { status: "empty" }
  | { data: PlayerCouponPageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const [coupons, users] = await Promise.all([
    listCouponsWithRedemptionsByStore(store.id),
    listCouponClaimUsers(),
  ]);
  const activeCoupons = coupons.filter((coupon) => coupon.status === "active");

  return {
    data: {
      coupons: activeCoupons,
      store_id: store.id,
      store_name: store.name,
      users,
    },
    status: "ready",
  };
}

function buildMetrics(coupons: CouponWithRedemptions[]): Metric[] {
  const claimedCount = coupons.reduce(
    (total, coupon) => total + coupon.redemptions.length,
    0,
  );
  const usedCount = coupons.reduce(
    (total, coupon) =>
      total +
      coupon.redemptions.filter((redemption) => redemption.status === "used")
        .length,
    0,
  );

  return [
    { label: "可用卡券总数", suffix: "张", value: coupons.length },
    { label: "已领取数量", suffix: "张", value: claimedCount },
    { label: "已使用数量", suffix: "张", value: usedCount },
  ];
}

function buildTips(coupons: CouponWithRedemptions[]): string[] {
  const claimedCount = coupons.reduce(
    (total, coupon) => total + coupon.redemptions.length,
    0,
  );
  const hasTimeSlotCoupon = coupons.some(
    (coupon) => coupon.coupon_type === "time_slot",
  );
  const hasTeaOrSnackCoupon = coupons.some(
    (coupon) => coupon.coupon_type === "tea" || coupon.coupon_type === "snack",
  );
  const tips: string[] = [];

  if (coupons.length === 0) {
    tips.push("当前暂无可用卡券，可关注门店后续活动");
  }

  if (hasTimeSlotCoupon) {
    tips.push("可优先用于工作日或空置时段预约");
  }

  if (hasTeaOrSnackCoupon) {
    tips.push("适合搭配熟人局到店使用");
  }

  if (claimedCount > 0) {
    tips.push("已领取卡券建议在有效期内使用");
  }

  if (tips.length === 0) {
    tips.push("可关注门店活动，合理安排下一局预约");
  }

  return tips;
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

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function ClaimFeedback({
  couponName,
  error,
  redemptionStatus,
  status,
  userName,
}: {
  couponName: string | null;
  error: string | null;
  redemptionStatus: string | null;
  status: string | null;
  userName: string | null;
}) {
  if (error) {
    return (
      <OperationMessage description={error} title="领取失败" type="error" />
    );
  }

  if (!status) {
    return null;
  }

  const isRepeated = status === "already_exists";

  return (
    <OperationMessage
      description={
        isRepeated
          ? "该用户已领取过这张卡券"
          : "当前仅创建门店卡券领取记录，不涉及任何资金处理。"
      }
      items={[
        `卡券名称：${couponName ?? "未命名卡券"}`,
        `领取用户：${userName ?? "未命名用户"}`,
        `status = ${redemptionStatus ?? "claimed"}`,
      ]}
      title={isRepeated ? "该用户已领取过这张卡券" : "卡券已领取"}
      type={isRepeated ? "warning" : "success"}
    />
  );
}

function CouponShell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">我的卡券</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实卡券列表。
      </p>
    </section>
  );
}

type SmallMetricProps = {
  label: string;
  value: string;
};

function SmallMetric({ label, value }: SmallMetricProps) {
  return (
    <div className="rounded-2xl bg-[#f7f1e6] p-4">
      <p className="text-sm text-[#5d756d]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
