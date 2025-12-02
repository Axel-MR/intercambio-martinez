"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Gift, LogOut, LogIn, Sparkles } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'usuarios', u.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) setUserDoc(snap.data());
          else setUserDoc(null);
        } catch (e) {
          console.error('Error fetching user doc for header:', e);
        }
      } else {
        setUserDoc(null);
      }
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <header className="w-full relative overflow-hidden sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-red-50/95 via-white/95 to-red-50/95 border-b-2 border-red-200/50 shadow-lg">
      {/* Decorative snowflakes background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-2 left-10 text-4xl">❄</div>
        <div className="absolute top-4 right-20 text-2xl">✨</div>
        <div className="absolute top-1 left-1/3 text-3xl">⭐</div>
        <div className="absolute top-3 right-1/4 text-2xl">❄</div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 relative">
        <div className="flex items-center justify-between">
          {/* Logo/Brand Section - Always visible */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Gift className="w-7 h-7 text-red-600 drop-shadow-lg" strokeWidth={2.5} />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
                Regalos
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Navidad 2025</p>
            </div>
          </div>

          {/* Navigation - Mobile friendly */}
          <nav className="flex items-center">
            <Link 
              href="/lista-de-deseos" 
              className="group relative p-2 sm:px-4 sm:py-2 rounded-xl font-medium text-gray-700 hover:text-red-700 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Gift className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Deseos</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </nav>

          {/* User Section - Mobile optimized */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* User info - Compact for mobile */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 max-w-[80px] sm:max-w-none truncate">
                      {userDoc?.username || user.email?.split('@')[0] || 'Usuario'}
                    </span>
                    {userDoc?.role === 'admin' && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                        ADM
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="group relative px-3 py-2 sm:px-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="group relative px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500"></div>
    </header>
  );
}