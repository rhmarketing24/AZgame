// pages/api/leaderboard.js
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await admin
      .from('leaderboard')
      .select('username, score_seconds, letters_completed, created_at')
      .order('score_seconds', { ascending: true })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
