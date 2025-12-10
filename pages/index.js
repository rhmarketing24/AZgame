import Link from 'next/link';
export default function Home() {
  return (
    <div className="container">
      <h1 className="header">Tap A → Z Rush</h1>
      <p className="small">Playing as @anonymous</p>
      <div className="controls">
        <Link href="/game"><button className="btn">Play</button></Link>
        <Link href="/leaderboard"><button className="btn btn-outline">Leaderboard</button></Link>
      </div>
      <p className="small">Tap A→Z as fast as you can!</p>
    </div>
  )
}
