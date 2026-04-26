"use server";

import { redirect } from "next/navigation";

import { claimCouponForUser } from "@/lib/services/coupon_service";

export async function claimCouponForUserAction(
  formData: FormData,
): Promise<void> {
  let result: Awaited<ReturnType<typeof claimCouponForUser>>;

  try {
    result = await claimCouponForUser({
      coupon_id: getRequiredFormValue(formData, "coupon_id"),
      store_id: getRequiredFormValue(formData, "store_id"),
      user_id: getRequiredFormValue(formData, "user_id"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/coupons?claim_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    claim_status: result.status,
    coupon_name: result.coupon?.name ?? "未命名卡券",
    redemption_status: result.redemption?.status ?? "claimed",
    user_name: result.user?.display_name ?? "未命名用户",
  });

  redirect(`/player/coupons?${searchParams.toString()}`);
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`claim_coupon_for_user_failed: ${key}_required`);
  }

  return value;
}
