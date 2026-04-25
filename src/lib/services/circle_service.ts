import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Circle,
  CircleInsert,
  CircleMember,
} from "@/types/domain";

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
