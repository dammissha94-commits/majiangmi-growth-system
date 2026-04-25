import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ENV_ERROR= missing Supabase url or key");
  console.error("REQUIRED_ENV= NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: latestGames, error: gamesError } = await supabase
  .from("games")
  .select(
    "id, created_at, updated_at, store_id, room_id, circle_id, reservation_id, started_at, ended_at, game_count, status",
  )
  .order("created_at", { ascending: false })
  .limit(5);

console.log("GAMES_ERROR=", gamesError);
console.log("LATEST_GAMES=", latestGames);

const latestGame = latestGames?.[0];

if (!latestGame) {
  console.log("LATEST_GAME_RELATED_WRITES=", null);
  process.exit(0);
}

async function countRows(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("game_id", latestGame.id);

  return {
    table: tableName,
    count,
    error,
  };
}

const relatedWrites = await Promise.all([
  countRows("game_participants"),
  countRows("game_results"),
  countRows("result_cards"),
]);

console.log("LATEST_GAME_ID=", latestGame.id);
console.log("LATEST_GAME_STATUS=", latestGame.status);
console.log("LATEST_GAME_COUNT=", latestGame.game_count);
console.log("LATEST_GAME_RELATED_WRITES=", relatedWrites);
