"use server";

import { redirect } from "next/navigation";

import { signUpForCampaign } from "@/lib/services/campaign_service";

export async function signUpForCampaignAction(
  formData: FormData,
): Promise<void> {
  let result: Awaited<ReturnType<typeof signUpForCampaign>>;

  try {
    result = await signUpForCampaign({
      campaign_id: getRequiredFormValue(formData, "campaign_id"),
      user_id: getRequiredFormValue(formData, "user_id"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    redirect(`/player/campaigns?signup_error=${encodeURIComponent(message)}`);
  }

  const searchParams = new URLSearchParams({
    campaign_name: result.campaign?.name ?? "未命名活动",
    signup_status: result.status,
    user_name: result.user?.display_name ?? "未命名用户",
  });

  redirect(`/player/campaigns?${searchParams.toString()}`);
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`sign_up_for_campaign_failed: ${key}_required`);
  }

  return value;
}
