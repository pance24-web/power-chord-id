import React from 'react';
import { Home, Library, Users, Send, ListMusic } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'home' | 'catalog' | 'artists' | 'playlist';
  onTabChange: (tab: 'home' | 'catalog' | 'artists' | 'playlist') => void;
  onOpenRequest: () => void;
  hasSelectedSong?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenRequest,
  hasSelectedSong = false,
}) => {
  // Hide bottom nav while in song reading mode to eliminate UI collision with autoscroll
  if (hasSelectedSong) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {/* Beranda */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-all touch-manipulation active:scale-95 ${
            currentTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Beranda"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Beranda</span>
          {currentTab === 'home' && (
            <span className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* Katalog */}
        <button
          onClick={() => onTabChange('catalog')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-all touch-manipulation active:scale-95 ${
            currentTab === 'catalog'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Katalog"
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Katalog</span>
          {currentTab === 'catalog' && (
            <span className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* Playlist Rock */}
        <button
          onClick={() => onTabChange('playlist')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-all touch-manipulation active:scale-95 ${
            currentTab === 'playlist'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Playlist Rock"
        >
          <ListMusic className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Playlist</span>
          {currentTab === 'playlist' && (
            <span className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* Artis */}
        <button
          onClick={() => onTabChange('artists')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-all touch-manipulation active:scale-95 ${
            currentTab === 'artists'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-label="Daftar Artis"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Artis</span>
          {currentTab === 'artists' && (
            <span className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
          )}
        </button>

        {/* Request */}
        <button
          onClick={onOpenRequest}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-all touch-manipulation active:scale-95 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          aria-label="Request Chord"
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Request</span>
        </button>
      </div>
    </div>
  );
};
