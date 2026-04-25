import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { Referral, ReferralInsert } from "@/types/domain";

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
