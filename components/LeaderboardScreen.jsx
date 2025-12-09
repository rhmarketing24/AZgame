import Link from 'next/link';
export default function LeaderboardScreen(){
  return (
    <div style={{minHeight:'100vh',background:'#0000FF',color:'#fff',padding:16}}>
      <h2 style={{textAlign:'center',marginTop:12}}>Leaderboard</h2>
      <div style={{maxWidth:540,margin:'18px auto',background:'rgba(255,255,255,0.04)',padding:12,borderRadius:10}}>
        <p>1. @anonymous — 12.40s</p>
      </div>
      <div style={{textAlign:'center',marginTop:14}}>
        <Link href="/"><button style={{padding:'10px 18px',borderRadius:8}}>Back</button></Link>
      </div>
    </div>
  )
}
