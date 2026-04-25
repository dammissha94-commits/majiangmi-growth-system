import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type {
  Reservation,
  ReservationInsert,
  ReservationStatus,
} from "@/types/domain";

export async function listReservationsByStore(
  store_id: string,
): Promise<Reservation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("store_id", store_id)
    .order("reservation_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`list_reservations_by_store_failed: ${error.message}`);
  }

  return data ?? [];
}

export async function createReservation(
  input: ReservationInsert,
): Promise<Reservation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_reservation_failed: ${error.message}`);
  }

  return data;
}

export async function updateReservationStatus(
  reservation_id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", reservation_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`update_reservation_status_failed: ${error.message}`);
  }

  return data;
}
