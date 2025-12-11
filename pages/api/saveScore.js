// pages/api/saveScore.js
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only secret
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    // expect body: { username, score_seconds, letters_completed }
    const { username, score_seconds, letters_completed } = req.body;

    // validate
    if (typeof score_seconds !== "number")
      return res.status(400).json({ error: "Missing or invalid score_seconds" });
    if (typeof letters_completed !== "number")
      return res.status(400).json({ error: "Missing or invalid letters_completed" });

    const safeUsername = username && username.trim() ? username.trim() : "anonymous";

    const { error } = await admin
      .from("leaderboard") // table name as you have in Supabase
      .insert([{ username: safeUsername, score_seconds, letters_completed }]);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
