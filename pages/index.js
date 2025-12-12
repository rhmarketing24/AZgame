import dynamic from 'next/dynamic';
const HomeScreen = dynamic(()=> import('../components/HomeScreen'), { ssr:false });
export default function Home(){ return <HomeScreen />; }
