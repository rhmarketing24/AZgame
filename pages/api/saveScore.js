
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).end();
  const { username, time } = req.body;
  const { error } = await admin.from("scores").insert({ username, time });
  if(error) return res.status(500).json({ error:error.message });
  res.json({ success:true });
}
