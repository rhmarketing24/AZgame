import dynamic from 'next/dynamic';
const Leaderboard = dynamic(()=>import('../components/LeaderboardScreen'), { ssr:false });
export default function LeaderboardPage(){ return <Leaderboard/>; }
