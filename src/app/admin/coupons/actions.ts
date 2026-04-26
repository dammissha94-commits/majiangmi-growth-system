"use server";

import { redirect } from "next/navigation";

import { redeemCouponRedemption } from "@/lib/services/coupon_service";

export async function redeemCouponRedemptionAction(
  formData: FormData,
): Promise<void> {
  let result: Awaited<ReturnType<typeof redeemCouponRedemption>>;

  try {
    result = await redeemCouponRedemption(
      getRequiredFormValue(formData, "redemption_id"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/admin/coupons?redeem_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    coupon_name: result.coupon?.name ?? "未命名卡券",
    redeem_status: result.status,
    redemption_status: result.redemption.status,
    used_at: result.redemption.used_at ?? "",
    user_name: result.user?.display_name ?? "未命名用户",
  });

  redirect(`/admin/coupons?${searchParams.toString()}`);
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`redeem_coupon_redemption_failed: ${key}_required`);
  }

  return value;
}
