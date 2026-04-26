"use server";

import { redirect } from "next/navigation";

import {
  claimCouponForUser,
  findFirstActiveCouponByStore,
} from "@/lib/services/coupon_service";
import { inviteUserToCircle } from "@/lib/services/referral_service";

export async function inviteUserToCircleAction(
  formData: FormData,
): Promise<void> {
  const circleId = getRequiredFormValue(formData, "circle_id");
  const referrerUserId = getRequiredFormValue(formData, "referrer_user_id");
  const referredUserId = getRequiredFormValue(formData, "referred_user_id");
  const storeId = getRequiredFormValue(formData, "store_id");

  let result: Awaited<ReturnType<typeof inviteUserToCircle>>;

  try {
    result = await inviteUserToCircle({
      circle_id: circleId,
      referrer_user_id: referrerUserId,
      referred_user_id: referredUserId,
      store_id: storeId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/circles?invite_error=${encodeURIComponent(message)}`);
  }

  let couponName: string | undefined;

  if (result.status === "invited") {
    try {
      const coupon = await findFirstActiveCouponByStore(storeId);
      if (coupon) {
        const couponResult = await claimCouponForUser({
          coupon_id: coupon.id,
          store_id: storeId,
          user_id: referredUserId,
        });
        if (couponResult.status === "claimed") {
          couponName = coupon.name;
        }
      }
    } catch {
      // Non-critical: auto-issue failure does not block the invite
    }
  }

  const params: Record<string, string> = {
    invite_status: result.status,
    referred_name: result.referred?.display_name ?? "未命名用户",
    referrer_name: result.referrer?.display_name ?? "未命名用户",
  };

  if (couponName) {
    params.coupon_name = couponName;
  }

  redirect(`/player/circles?${new URLSearchParams(params).toString()}`);
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`invite_user_to_circle_failed: ${key}_required`);
  }

  return value;
}
