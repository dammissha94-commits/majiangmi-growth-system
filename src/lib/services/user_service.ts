import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { User } from "@/types/domain";

export async function listUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_users_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getUserById(user_id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user_id)
    .maybeSingle();

  if (error) {
    throw new Error(`get_user_by_id_failed: ${error.message}`);
  }

  return data;
}
