// pages/api/saveScore.js
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username, time, letters_completed } = req.body;

    // validate time (coerce to number)
    const score_seconds = Number(time);
    if (!username || Number.isNaN(score_seconds)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const lettersCompleted = Number(letters_completed ?? 26); // default 26 if not provided

    const { error } = await admin
      .from('leaderboard')
      .insert([{ username, score_seconds, letters_completed: lettersCompleted }]);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
