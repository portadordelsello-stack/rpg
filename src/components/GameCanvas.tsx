import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../game/Game';
import { NPC } from '../game/NPC';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerData } from '../types';

interface GameCanvasProps {
  playerData: PlayerData;
}

export default function GameCanvas({ playerData }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDialog, setActiveDialog] = useState<{name: string, text: string} | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    
    const onInteract = (npc: NPC | null) => {
      if (npc) {
          setActiveDialog({ name: npc.name, text: npc.dialog });
      } else {
          setActiveDialog(null);
      }
    };

    const game = new Game(canvas, onInteract, playerData);

    const handleResize = (entries?: ResizeObserverEntry[]) => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        game.resize(clientWidth, clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
        // Focus the container so we can immediately capture keyboard events
        containerRef.current.focus();
    }
    
    handleResize(); // Initial size

    game.start();

    return () => {
      resizeObserver.disconnect();
      game.stop();
    };
  }, [playerData]);

  // Minimap simple mock for UI
  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black outline-none" 
      ref={containerRef}
      tabIndex={0}
      autoFocus
      onClick={(e) => e.currentTarget.focus()}
    >
      <canvas 
        ref={canvasRef} 
        className="block absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* HUD - Top Left */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-20 pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 p-3 rounded-xl shadow-2xl">
          <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <span className="text-xs font-bold text-white">LV. 1</span>
          </div>
          <div className="flex flex-col gap-1.5 w-48">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Health Points</span>
              <span className="text-[10px] font-bold text-red-400">{playerData.hp} / {playerData.maxHp}</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.4)] transition-all duration-300"
                style={{ width: `${(playerData.hp / playerData.maxHp) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-end px-1 mt-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mana Essence</span>
              <span className="text-[10px] font-bold text-blue-400">{playerData.mana} / {playerData.maxMana}</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-300"
                style={{ width: `${(playerData.mana / playerData.maxMana) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimap - Top Right */}
      <div className="absolute top-[88px] right-6 flex flex-col items-end gap-4 z-20 pointer-events-none">
        <div className="w-40 h-40 bg-zinc-900/90 backdrop-blur-md border-4 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 opacity-40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b981_0%,transparent_70%)] opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white border-2 border-zinc-900 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_white]"></div>
          <div className="absolute top-1/4 left-3/4 w-2 h-2 bg-yellow-400 border border-zinc-900 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-6 w-2 h-2 bg-blue-400 border border-zinc-900 rounded-full"></div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-500 tracking-widest text-white">
            X:{Math.floor(playerData.x)} Y:{Math.floor(playerData.y)}
          </div>
        </div>
      </div>

      {/* Dialog Box */}
      <AnimatePresence>
        {activeDialog && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-[640px]"
          >
            <div className="w-full bg-zinc-900/95 backdrop-blur-xl border-t-2 border-zinc-700 p-6 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] flex gap-5">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-t from-zinc-900 to-zinc-700 flex items-end justify-center">
                   <div className="w-12 h-14 bg-zinc-400 rounded-t-full relative">
                      <div className="absolute top-3 left-2 w-2 h-2 bg-zinc-900 rounded-full"></div>
                      <div className="absolute top-3 right-2 w-2 h-2 bg-zinc-900 rounded-full"></div>
                   </div>
                 </div>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">{activeDialog.name}</span>
                <p className="text-zinc-200 text-lg leading-relaxed font-medium">
                  {activeDialog.text}
                </p>
                <div className="mt-4 flex gap-3">
                  <div className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-xs font-bold transition-all">[Space] Continue</div>
                  <div className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">[E] Close</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Hints */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4 opacity-40 pointer-events-none">
        <div className="flex gap-1">
          <kbd className="px-2 py-1 bg-zinc-800 rounded text-[10px] border border-zinc-700 text-white font-mono">W</kbd>
          <kbd className="px-2 py-1 bg-zinc-800 rounded text-[10px] border border-zinc-700 text-white font-mono">A</kbd>
          <kbd className="px-2 py-1 bg-zinc-800 rounded text-[10px] border border-zinc-700 text-white font-mono">S</kbd>
          <kbd className="px-2 py-1 bg-zinc-800 rounded text-[10px] border border-zinc-700 text-white font-mono">D</kbd>
        </div>
        <span className="text-[10px] uppercase tracking-tighter text-white">to navigate the world</span>
      </div>
    </div>
  );
}
