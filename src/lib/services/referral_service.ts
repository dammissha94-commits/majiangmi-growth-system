import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { Referral, ReferralInsert, User } from "@/types/domain";

export type InviteUserToCircleInput = {
  circle_id: string;
  referrer_user_id: string;
  referred_user_id: string;
  store_id: string;
};

export type InviteUserToCircleResult = {
  referral: Referral | null;
  referrer: Pick<User, "display_name"> | null;
  referred: Pick<User, "display_name"> | null;
  status: "already_invited" | "invited";
};

export async function inviteUserToCircle(
  input: InviteUserToCircleInput,
): Promise<InviteUserToCircleResult> {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("referrals")
    .select("*")
    .eq("store_id", input.store_id)
    .eq("referrer_user_id", input.referrer_user_id)
    .eq("referred_user_id", input.referred_user_id)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(`invite_user_to_circle_failed: ${existingError.message}`);
  }

  const referrer = await getUserDisplayName(
    input.referrer_user_id,
    "invite_user_to_circle_failed",
  );
  const referred = await getUserDisplayName(
    input.referred_user_id,
    "invite_user_to_circle_failed",
  );

  if (existing) {
    return {
      referral: existing as Referral,
      referrer,
      referred,
      status: "already_invited",
    };
  }

  const { data, error } = await supabase
    .from("referrals")
    .insert({
      accepted_at: null,
      circle_id: input.circle_id,
      referral_source: "circle_invite",
      referrer_user_id: input.referrer_user_id,
      referred_user_id: input.referred_user_id,
      store_id: input.store_id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`invite_user_to_circle_failed: ${error.message}`);
  }

  return {
    referral: data,
    referrer,
    referred,
    status: "invited",
  };
}

async function getUserDisplayName(
  userId: string,
  errorPrefix: string,
): Promise<Pick<User, "display_name"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`${errorPrefix}: ${error.message}`);
  }

  return data as Pick<User, "display_name"> | null;
}

export async function createReferral(
  input: ReferralInsert,
): Promise<Referral> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referrals")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_referral_failed: ${error.message}`);
  }

  return data;
}

export async function listReferralsByStore(
  store_id: string,
): Promise<Referral[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_referrals_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function listReferralsByInviter(
  referrer_user_id: string,
): Promise<Referral[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_user_id", referrer_user_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_referrals_by_inviter_failed: ${error.message}`);
  }

  return data ?? [];
}
