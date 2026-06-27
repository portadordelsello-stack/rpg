/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import GameCanvas from './components/GameCanvas';
import { PlayerData } from './types';
import { Loader2, LogIn, LogOut } from 'lucide-react';

const DEFAULT_PLAYER: Omit<PlayerData, 'id'> = {
  x: 512,
  y: 384,
  hp: 1420,
  maxHp: 1420,
  mana: 640,
  maxMana: 800,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Load or create player data
        const playerRef = doc(db, 'players', currentUser.uid);
        try {
          const docSnap = await getDoc(playerRef);
          
          if (docSnap.exists()) {
            setPlayerData(docSnap.data() as PlayerData);
          } else {
            const newData: PlayerData = { ...DEFAULT_PLAYER, id: currentUser.uid };
            await setDoc(playerRef, newData);
            setPlayerData(newData);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'players');
        }
      } else {
        setPlayerData(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <p className="font-mono text-sm">Loading World...</p>
        </div>
      </div>
    );
  }

  if (!user || !playerData) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
         <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
               <div className="w-8 h-8 bg-blue-500 rounded-sm" style={{ imageRendering: 'pixelated' }}>
                 {/* Pixel face */}
                 <div className="flex justify-between px-1 pt-2">
                    <div className="w-2 h-2 bg-white"></div>
                    <div className="w-2 h-2 bg-white"></div>
                 </div>
               </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">Pixel Realm</h1>
            <p className="text-gray-400 mb-8 font-sans">A top-down open world adventure.</p>
            
            <button 
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 flex flex-col relative text-white font-sans select-none">
      <GameCanvas playerData={playerData} />
      
      {/* Top right auth & save overlay */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-4 z-30">
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 py-1.5 pl-1.5 pr-4 rounded-full shadow-lg">
          <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-white">{user?.displayName || 'Explorer'}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                   if (user && playerData) {
                       const playerRef = doc(db, 'players', user.uid);
                       try {
                         await setDoc(playerRef, playerData);
                         alert("Progress saved!");
                       } catch (error) {
                         handleFirestoreError(error, OperationType.WRITE, 'players');
                       }
                   }
                }}
                className="text-[9px] text-green-400 hover:text-green-300 font-bold uppercase tracking-tighter cursor-pointer"
              >
                Save Sync
              </button>
              <span className="text-zinc-600 text-[9px]">|</span>
              <button 
                onClick={logout}
                className="text-[9px] text-zinc-400 hover:text-white font-bold uppercase tracking-tighter cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

