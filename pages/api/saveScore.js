import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, score_seconds, letters_completed } = req.body;

  const { data, error } = await supabase
    .from("leaderboard")
    .insert([{ username, score_seconds, letters_completed }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
