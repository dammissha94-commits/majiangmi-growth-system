import Link from "next/link";
import type { ReactNode } from "react";

import { redeemCouponRedemptionAction } from "@/app/admin/coupons/actions";
import { OperationMessage } from "@/components/operation-message";
import { getFirstActiveStore } from "@/lib/services/dashboard_service";
import {
  listClaimedCouponRedemptionsByStore,
  listCouponsWithRedemptionsByStore,
  type ClaimedCouponRedemption,
  type CouponWithRedemptions,
} from "@/lib/services/coupon_service";

export const dynamic = "force-dynamic";

type CouponPageData = {
  claimedRedemptions: ClaimedCouponRedemption[];
  coupons: CouponWithRedemptions[];
  store_name: string;
};

type AdminCouponsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Metric = {
  label: string;
  suffix: string;
  value: number;
};

export default async function AdminCouponsPage({
  searchParams,
}: AdminCouponsPageProps) {
  const pageData = await loadCouponPageData();
  const params = (await searchParams) ?? {};

  if (pageData.status === "empty") {
    return <CouponShell>{renderNoStoreState()}</CouponShell>;
  }

  const metrics = buildMetrics(pageData.data.coupons);
  const suggestions = buildSuggestions(pageData.data.coupons);

  return (
    <CouponShell>
      <header className="mt-6 rounded-3xl bg-[#12332a] p-6 text-[#fff8ea]">
        <p className="text-sm font-semibold text-[#f1dba5]">卡券管理</p>
        <h1 className="mt-3 text-3xl font-semibold">复购权益配置</h1>
        <p className="mt-3 text-xl font-semibold">{pageData.data.store_name}</p>
        <p className="mt-3 leading-7 text-[#e8dbc4]">
          查看卡券名称、类型、有效期、领取用户与核销表现。
        </p>
        <p className="mt-3 rounded-2xl border border-[#d3a443]/50 bg-[#173f35] p-4 text-sm text-[#f1dba5]">
          娱乐积分，仅作休闲记录。
        </p>
      </header>

      <OperationMessage
        description="当前仅更新门店卡券核销状态，不涉及任何资金处理。"
        title="当前步骤边界"
        type="info"
      />

      <RedeemFeedback
        couponName={getSearchParam(params, "coupon_name")}
        error={getSearchParam(params, "redeem_error")}
        redemptionStatus={getSearchParam(params, "redemption_status")}
        status={getSearchParam(params, "redeem_status")}
        usedAt={getSearchParam(params, "used_at")}
        userName={getSearchParam(params, "user_name")}
      />

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

      <section className="mt-6 rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#9b7428]">
              待核销领取记录
            </p>
            <h2 className="mt-2 text-2xl font-semibold">已领取卡券</h2>
          </div>
          <p className="text-sm text-[#5d756d]">
            共 {pageData.data.claimedRedemptions.length} 条
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          {pageData.data.claimedRedemptions.length === 0 ? (
            <OperationMessage
              description="当前没有 status = claimed 的卡券领取记录。"
              title="暂无已领取待核销记录"
              type="info"
            />
          ) : (
            pageData.data.claimedRedemptions.map((redemption) => (
              <article
                className="grid gap-4 rounded-2xl bg-[#f7f1e6] p-4 lg:grid-cols-[1fr_auto] lg:items-center"
                key={redemption.id}
              >
                <div className="grid gap-2 text-sm text-[#4d665e] sm:grid-cols-2 lg:grid-cols-4">
                  <p>
                    <span className="font-semibold text-[#12332a]">
                      卡券名称：
                    </span>
                    {redemption.coupon?.name ?? "未命名卡券"}
                  </p>
                  <p>
                    <span className="font-semibold text-[#12332a]">
                      领取用户：
                    </span>
                    {redemption.user?.display_name ?? "未命名用户"}
                  </p>
                  <p>
                    <span className="font-semibold text-[#12332a]">
                      claimed_at：
                    </span>
                    {formatDateTime(redemption.claimed_at)}
                  </p>
                  <p>
                    <span className="font-semibold text-[#12332a]">
                      status：
                    </span>
                    {redemption.status}
                  </p>
                </div>
                <form action={redeemCouponRedemptionAction}>
                  <input
                    name="redemption_id"
                    type="hidden"
                    value={redemption.id}
                  />
                  <button
                    className="w-full rounded-full bg-[#12332a] px-5 py-3 text-sm font-semibold text-[#fff8ea] lg:w-auto"
                    type="submit"
                  >
                    核销卡券
                  </button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {pageData.data.coupons.length === 0 ? (
          <OperationMessage
            description="当前门店暂无卡券数据。"
            title="暂无卡券数据"
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
                className="rounded-3xl border border-[#dbc99e] bg-[#fff8ea] p-5"
                key={coupon.id}
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr] lg:items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{coupon.name}</h2>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      类型：{formatCouponType(coupon.coupon_type)}
                    </p>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      描述：{coupon.description ?? "未填写"}
                    </p>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      有效期：{formatDateTime(coupon.valid_from)} 至{" "}
                      {formatDateTime(coupon.valid_to)}
                    </p>
                    <p className="mt-2 text-sm text-[#5d756d]">
                      状态：{coupon.status}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <MetricCard
                      label="总数量"
                      value={formatQuantity(coupon.total_quantity)}
                    />
                    <MetricCard label="已领取数" value={`${claimedCount} 张`} />
                    <MetricCard label="已核销数" value={`${usedCount} 张`} />
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-[#f7f1e6] p-4">
                  <p className="text-sm font-semibold text-[#9b7428]">
                    领取用户列表
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coupon.redemptions.length > 0 ? (
                      coupon.redemptions.map((redemption) => (
                        <span
                          className="rounded-full bg-[#f1dba5] px-3 py-1 text-xs font-semibold"
                          key={redemption.id}
                        >
                          {redemption.user?.display_name ?? "未命名用户"}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-[#fff8ea] px-3 py-1 text-xs font-semibold text-[#5d756d]">
                        暂无领取用户
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </CouponShell>
  );
}

async function loadCouponPageData(): Promise<
  | { status: "empty" }
  | { data: CouponPageData; status: "ready" }
> {
  const store = await getFirstActiveStore();

  if (!store) {
    return { status: "empty" };
  }

  const [coupons, claimedRedemptions] = await Promise.all([
    listCouponsWithRedemptionsByStore(store.id),
    listClaimedCouponRedemptionsByStore(store.id),
  ]);

  return {
    data: {
      claimedRedemptions,
      coupons,
      store_name: store.name,
    },
    status: "ready",
  };
}

function buildMetrics(coupons: CouponWithRedemptions[]): Metric[] {
  const activeCouponCount = coupons.filter(
    (coupon) => coupon.status === "active",
  ).length;
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
    { label: "卡券总数", suffix: "张", value: coupons.length },
    { label: "active 卡券数", suffix: "张", value: activeCouponCount },
    { label: "已领取数量", suffix: "张", value: claimedCount },
    { label: "已核销数量", suffix: "张", value: usedCount },
  ];
}

function buildSuggestions(coupons: CouponWithRedemptions[]): string[] {
  const activeCouponCount = coupons.filter(
    (coupon) => coupon.status === "active",
  ).length;
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
  const hasTimeSlotCoupon = coupons.some(
    (coupon) => coupon.coupon_type === "time_slot",
  );
  const suggestions: string[] = [];

  if (coupons.length === 0) {
    suggestions.push("建议先创建新人体验券和老客复购券");
  }

  if (activeCouponCount > 0) {
    suggestions.push("建议把有效卡券同步到门店私域");
  }

  if (claimedCount > 0) {
    suggestions.push("建议跟进已领券用户到店转化");
  }

  if (usedCount === 0) {
    suggestions.push("建议检查卡券触达和核销引导");
  }

  if (hasTimeSlotCoupon) {
    suggestions.push("建议用于激活工作日空置时段");
  }

  if (suggestions.length === 0) {
    suggestions.push("建议持续观察卡券领取与核销表现");
  }

  return suggestions;
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

function formatQuantity(value: number | null): string {
  return value === null ? "不限量" : `${value} 张`;
}

function RedeemFeedback({
  couponName,
  error,
  redemptionStatus,
  status,
  usedAt,
  userName,
}: {
  couponName: string | null;
  error: string | null;
  redemptionStatus: string | null;
  status: string | null;
  usedAt: string | null;
  userName: string | null;
}) {
  if (error) {
    return (
      <OperationMessage description={error} title="核销失败" type="error" />
    );
  }

  if (!status) {
    return null;
  }

  const title =
    status === "already_used"
      ? "该卡券已核销"
      : status === "invalid_status"
        ? "只有已领取状态的卡券可以核销"
        : "卡券已核销";

  return (
    <OperationMessage
      description={
        status === "used"
          ? "当前仅更新门店卡券核销状态，不涉及任何资金处理。"
          : title
      }
      items={[
        `卡券名称：${couponName ?? "未命名卡券"}`,
        `用户名称：${userName ?? "未命名用户"}`,
        `status = ${redemptionStatus ?? "used"}`,
        ...(usedAt ? [`used_at：${formatDateTime(usedAt)}`] : []),
      ]}
      title={title}
      type={status === "used" ? "success" : "warning"}
    />
  );
}

function CouponShell({ children }: { children: ReactNode }) {
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
      <p className="text-sm font-semibold text-[#9b7428]">卡券管理</p>
      <h1 className="mt-3 text-3xl font-semibold">暂无门店数据</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#4d665e]">
        当前没有可用于展示的 active 门店。添加门店测试数据后，此页会显示真实卡券列表。
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
