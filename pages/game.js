import dynamic from 'next/dynamic';
const GameScreen = dynamic(()=>import('../components/GameScreen'), { ssr:false });
export default function Game(){ return <GameScreen/>; }
