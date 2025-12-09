import { useState } from 'react';
import Link from 'next/link';

export default function GameScreen(){
  return (
    <div style={{minHeight:'100vh',background:'#0000FF',color:'#fff',padding:16}}>
      <div style={{textAlign:'center',marginTop:12}}>
        <div style={{fontWeight:800,fontSize:20}}>00.00 s</div>
        <div style={{marginTop:12,fontSize:18}}>Target: A</div>
      </div>

      <div id="board" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,maxWidth:420,margin:'20px auto'}}>
        {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((c)=>(
          <button key={c} className="letter" style={{background:'#fff',color:'#0000FF',height:72,borderRadius:14,fontWeight:800}}>{c}</button>
        ))}
      </div>

      <div style={{textAlign:'center',marginTop:14}}>
        <Link href="/"><button style={{padding:'10px 18px',borderRadius:8}}>Back</button></Link>
      </div>
    </div>
  )
}
