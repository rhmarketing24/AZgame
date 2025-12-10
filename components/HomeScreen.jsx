
import { useRouter } from "next/router";

export default function HomeScreen(){
  const r = useRouter();
  return (
    <div style={{textAlign:"center", paddingTop:"50px", color:"white"}}>
      <h1>Tap A → Z Rush</h1>
      <button onClick={()=>r.push('/game')} style={{fontSize:20,padding:20,borderRadius:10}}>Play</button>
      <br/><br/>
      <button onClick={()=>r.push('/leaderboard')}>Leaderboard</button>
    </div>
  )
}
