import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { Room } from "@/types/domain";

export async function listRoomsByStore(store_id: string): Promise<Room[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`list_rooms_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function getRoomById(room_id: string): Promise<Room | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", room_id)
    .maybeSingle();

  if (error) {
    throw new Error(`get_room_by_id_failed: ${error.message}`);
  }

  return data;
}
