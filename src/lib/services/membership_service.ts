import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Membership,
  MembershipInsert,
  MembershipUpdate,
  User,
} from "@/types/domain";

export type MembershipWithUser = Membership & {
  users: Pick<User, "display_name" | "phone"> | null;
};

export async function listMembershipsByStore(
  storeId: string,
): Promise<Membership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_memberships_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function listMembershipsWithUsersByStore(
  storeId: string,
): Promise<MembershipWithUser[]> {
  const supabase = await createClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (membershipError) {
    throw new Error(
      `list_memberships_with_users_by_store_failed: ${membershipError.message}`,
    );
  }

  const membershipRows = (memberships ?? []) as Membership[];
  const userIds = Array.from(
    new Set(membershipRows.map((membership) => membership.user_id)),
  );

  if (userIds.length === 0) {
    return [];
  }

  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, display_name, phone")
    .in("id", userIds);

  if (userError) {
    throw new Error(
      `list_memberships_with_users_by_store_failed: ${userError.message}`,
    );
  }

  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name" | "phone">[]).map(
      (user) => [user.id, user],
    ),
  );

  return membershipRows.map((membership) => ({
    ...membership,
    users: usersById.get(membership.user_id) ?? null,
  }));
}

export async function getInactiveMembers7Days(
  storeId: string,
): Promise<Membership[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("store_id", storeId)
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
  membershipId: string,
  input: Pick<
    MembershipUpdate,
    "visit_count" | "game_count" | "last_visit_at" | "updated_at"
  >,
): Promise<Membership> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .update(input)
    .eq("id", membershipId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`update_membership_visit_stats_failed: ${error.message}`);
  }

  return data;
}
