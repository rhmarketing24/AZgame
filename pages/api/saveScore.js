import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  try{
    const { username, time } = req.body;
    if(!username || typeof time !== 'number') return res.status(400).json({ error:'Missing fields' });
    const { error } = await admin.from('scores').insert([{ username, time }]);
    if(error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success:true });
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
}
