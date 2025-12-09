// pages/api/saveScore.js

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, time } = req.body;

    if (!username || !time)
      return res.status(400).json({ error: "Missing fields" });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // requires SERVICE ROLE
    );

    const { error } = await supabase
      .from("scores")
      .insert([{ username, time }]);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
