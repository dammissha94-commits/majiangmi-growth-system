import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { Store } from "@/types/domain";

export async function listStores(): Promise<Store[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_stores_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getStoreById(store_id: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", store_id)
    .maybeSingle();

  if (error) {
    throw new Error(`get_store_by_id_failed: ${error.message}`);
  }

  return data;
}
