import React from 'react';

const ART = `${import.meta.env.BASE_URL}altar/`;

/**
 * The home screen's painted world: your twilight valley, with a few quiet things moving so it feels alive
 * without a video: clouds drifting, shooting stars, a breathing light ray, floating islets, glowing wisps,
 * and a very slow drift of the whole picture.
 */
export const HomeScene: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#1b1740]">
    <style>{`
      @keyframes homeDrift { 0%,100% { transform: scale(1.03) translate(0,0) } 50% { transform: scale(1.07) translate(-0.8%, -0.6%) } }
      @keyframes homeCloud { from { transform: translateX(-35vw) } to { transform: translateX(140vw) } }
      @keyframes homeShoot { 0% { transform: translate(0,0); opacity: 0 } 8% { opacity: 1 } 40% { transform: translate(70vw, 34vh); opacity: 0 } 100% { transform: translate(70vw, 34vh); opacity: 0 } }
      @keyframes homeRay { 0%,100% { opacity: 0.28 } 50% { opacity: 0.6 } }
      @keyframes homeBob { 0%,100% { transform: translateY(0) rotate(-1deg) } 50% { transform: translateY(-14px) rotate(1deg) } }
      @keyframes homeWisp { 0%,100% { transform: translate(0,0); opacity: 0.8 } 33% { transform: translate(14px,-18px); opacity: 1 } 66% { transform: translate(-10px,-8px); opacity: 0.7 } }
    `}</style>

    <img src={`${ART}home_bg.jpg`} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: 'auto', animation: 'homeDrift 60s ease-in-out infinite' }} />

    <img src={`${ART}amb_ray.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '-4%', right: '16%', width: '30vw', mixBlendMode: 'screen', animation: 'homeRay 7s ease-in-out infinite', imageRendering: 'auto' }} />

    <img src={`${ART}amb_cloud_big.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '16%', left: 0, width: '20vw', opacity: 0.5, animation: 'homeCloud 95s linear infinite', imageRendering: 'auto' }} />
    <img src={`${ART}amb_cloud_streak.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '27%', left: 0, width: '26vw', opacity: 0.4, animation: 'homeCloud 140s linear -50s infinite', imageRendering: 'auto' }} />
    <img src={`${ART}amb_cloud_small.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '10%', left: 0, width: '13vw', opacity: 0.45, animation: 'homeCloud 120s linear -90s infinite', imageRendering: 'auto' }} />

    <img src={`${ART}amb_star_a.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '6%', left: '8%', width: '8vw', animation: 'homeShoot 11s ease-in 2s infinite', imageRendering: 'auto' }} />
    <img src={`${ART}amb_star_b.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '3%', left: '30%', width: '5vw', animation: 'homeShoot 17s ease-in 8s infinite', imageRendering: 'auto' }} />

    <img src={`${ART}amb_island_tree.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '19%', left: '17%', width: '8vw', animation: 'homeBob 7s ease-in-out infinite', imageRendering: 'auto' }} />
    <img src={`${ART}amb_island_crystal.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ top: '28%', right: '14%', width: '6.5vw', animation: 'homeBob 9s ease-in-out -3s infinite', imageRendering: 'auto' }} />

    <img src={`${ART}amb_wisps.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ bottom: '24%', left: '26%', width: '6vw', animation: 'homeWisp 8s ease-in-out infinite', imageRendering: 'auto', mixBlendMode: 'screen' }} />
    <img src={`${ART}amb_wisps.png`} alt="" draggable={false} className="absolute pointer-events-none" style={{ bottom: '30%', right: '20%', width: '5vw', animation: 'homeWisp 10s ease-in-out -4s infinite', imageRendering: 'auto', mixBlendMode: 'screen' }} />

    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(14,8,40,0.38) 100%)' }} />
  </div>
);
