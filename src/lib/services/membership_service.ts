import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Membership,
  MembershipInsert,
  MembershipUpdate,
} from "@/types/domain";

export async function listMembershipsByStore(
  store_id: string,
): Promise<Membership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_memberships_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getInactiveMembers7Days(
  store_id: string,
): Promise<Membership[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("store_id", store_id)
    .or(`last_visit_at.is.null,last_visit_at.lt.${sevenDaysAgo.toISOString()}`)
    .order("last_visit_at", { ascending: true, nullsFirst: true });

  if (error) {
    throw new Error(`get_inactive_members_7_days_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function createMembership(
  input: MembershipInsert,
): Promise<Membership> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_membership_failed: ${error.message}`);
  }

  return data;
}

export async function updateMembershipVisitStats(
  membership_id: string,
  input: Pick<
    MembershipUpdate,
    "visit_count" | "game_count" | "last_visit_at" | "updated_at"
  >,
): Promise<Membership> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .update(input)
    .eq("id", membership_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`update_membership_visit_stats_failed: ${error.message}`);
  }

  return data;
}
