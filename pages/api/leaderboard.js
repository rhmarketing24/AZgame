
import { createClient } from "@supabase/supabase-js";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export default async function handler(req,res){
  const { data, error } = await admin.from("scores").select("*").order("time",{ascending:true}).limit(50);
  if(error) return res.status(500).json({ error:error.message });
  res.json({ data });
}
