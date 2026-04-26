"use server";

import { redirect } from "next/navigation";

import { inviteUserToCircle } from "@/lib/services/referral_service";

export async function inviteUserToCircleAction(
  formData: FormData,
): Promise<void> {
  let result: Awaited<ReturnType<typeof inviteUserToCircle>>;

  try {
    result = await inviteUserToCircle({
      circle_id: getRequiredFormValue(formData, "circle_id"),
      referrer_user_id: getRequiredFormValue(formData, "referrer_user_id"),
      referred_user_id: getRequiredFormValue(formData, "referred_user_id"),
      store_id: getRequiredFormValue(formData, "store_id"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/circles?invite_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    invite_status: result.status,
    referred_name: result.referred?.display_name ?? "未命名用户",
    referrer_name: result.referrer?.display_name ?? "未命名用户",
  });

  redirect(`/player/circles?${searchParams.toString()}`);
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`invite_user_to_circle_failed: ${key}_required`);
  }

  return value;
}
