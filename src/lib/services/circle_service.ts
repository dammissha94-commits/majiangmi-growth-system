import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Circle,
  CircleInsert,
  CircleMember,
  User,
} from "@/types/domain";

export type CircleMemberWithUser = CircleMember & {
  user: Pick<User, "display_name"> | null;
};

export type CircleWithDetails = Circle & {
  members: CircleMemberWithUser[];
  owner: Pick<User, "display_name"> | null;
};

export async function listCirclesByStore(
  store_id: string,
): Promise<Circle[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .eq("store_id", store_id)
    .order("last_active_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`list_circles_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function listCirclesWithMembersByStore(
  storeId: string,
): Promise<CircleWithDetails[]> {
  const supabase = await createClient();
  const { data: circles, error: circleError } = await supabase
    .from("circles")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (circleError) {
    throw new Error(
      `list_circles_with_members_by_store_failed: ${circleError.message}`,
    );
  }

  const circleRows = (circles ?? []) as Circle[];

  if (circleRows.length === 0) {
    return [];
  }

  const circleIds = circleRows.map((circle) => circle.id);
  const ownerUserIds = Array.from(
    new Set(circleRows.map((circle) => circle.owner_user_id)),
  );

  const { data: owners, error: ownerError } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", ownerUserIds);

  if (ownerError) {
    throw new Error(
      `list_circles_with_members_by_store_failed: ${ownerError.message}`,
    );
  }

  const { data: circleMembers, error: memberError } = await supabase
    .from("circle_members")
    .select("*")
    .in("circle_id", circleIds)
    .order("joined_at", { ascending: true });

  if (memberError) {
    throw new Error(
      `list_circles_with_members_by_store_failed: ${memberError.message}`,
    );
  }

  const memberRows = (circleMembers ?? []) as CircleMember[];
  const memberUserIds = Array.from(
    new Set(memberRows.map((member) => member.user_id)),
  );

  const { data: users, error: userError } =
    memberUserIds.length > 0
      ? await supabase
          .from("users")
          .select("id, display_name")
          .in("id", memberUserIds)
      : { data: [], error: null };

  if (userError) {
    throw new Error(
      `list_circles_with_members_by_store_failed: ${userError.message}`,
    );
  }

  const ownersById = new Map(
    ((owners ?? []) as Pick<User, "id" | "display_name">[]).map((owner) => [
      owner.id,
      owner,
    ]),
  );
  const usersById = new Map(
    ((users ?? []) as Pick<User, "id" | "display_name">[]).map((user) => [
      user.id,
      user,
    ]),
  );

  return circleRows.map((circle) => ({
    ...circle,
    members: memberRows
      .filter((member) => member.circle_id === circle.id)
      .map((member) => ({
        ...member,
        user: usersById.get(member.user_id) ?? null,
      })),
    owner: ownersById.get(circle.owner_user_id) ?? null,
  }));
}

export async function getCircleById(
  circle_id: string,
): Promise<Circle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .eq("id", circle_id)
    .maybeSingle();

  if (error) {
    throw new Error(`get_circle_by_id_failed: ${error.message}`);
  }

  return data;
}

export async function listCircleMembers(
  circle_id: string,
): Promise<CircleMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circle_members")
    .select("*")
    .eq("circle_id", circle_id)
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(`list_circle_members_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function createCircle(input: CircleInsert): Promise<Circle> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circles")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_circle_failed: ${error.message}`);
  }

  return data;
}
