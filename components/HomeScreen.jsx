import Link from 'next/link';
export default function HomeScreen(){
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0000FF',color:'#fff',padding:20}}>
      <h1 style={{fontSize:28,fontWeight:800}}>Tap A → Z Rush</h1>
      <p style={{marginTop:8}}>Not connected (playing as anonymous)</p>
      <Link href="/game"><button style={{marginTop:20,padding:'14px 28px',borderRadius:999,background:'#fff',color:'#0000FF',fontWeight:700}}>Play</button></Link>
      <Link href="/leaderboard"><button style={{marginTop:12,padding:'10px 18px',borderRadius:8,background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,0.18)'}}>Leaderboard</button></Link>
      <p style={{marginTop:14,fontSize:14,opacity:0.95}}>Tap A→Z as fast as you can!</p>
    </div>
  )
}
