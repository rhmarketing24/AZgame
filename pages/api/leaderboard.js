import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score_seconds", { ascending: true })
    .limit(20);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
