import dynamic from 'next/dynamic';
const LeaderboardScreen = dynamic(()=> import('../components/LeaderboardScreen'), { ssr:false });
export default function Leaderboard(){ return <LeaderboardScreen />; }
