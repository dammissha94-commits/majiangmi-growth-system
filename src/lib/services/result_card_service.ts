import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import type { ResultCard, ResultCardInsert } from "@/types/domain";

export async function createResultCard(
  input: ResultCardInsert,
): Promise<ResultCard> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`create_result_card_failed: ${error.message}`);
  }

  return data;
}

export async function getResultCardById(
  result_card_id: string,
): Promise<ResultCard | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .select("*")
    .eq("id", result_card_id)
    .maybeSingle();

  if (error) {
    throw new Error(`get_result_card_by_id_failed: ${error.message}`);
  }

  return data;
}

export async function incrementResultCardShareCount(
  result_card_id: string,
): Promise<ResultCard> {
  const current = await getResultCardById(result_card_id);

  if (!current) {
    throw new Error("increment_result_card_share_count_failed: card_not_found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("result_cards")
    .update({ share_count: current.share_count + 1 })
    .eq("id", result_card_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `increment_result_card_share_count_failed: ${error.message}`,
    );
  }

  return data;
}
