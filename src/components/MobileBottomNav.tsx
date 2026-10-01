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
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {/* Beranda */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'home' && !hasSelectedSong
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Beranda</span>
        </button>

        {/* Katalog */}
        <button
          onClick={() => onTabChange('catalog')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'catalog' && !hasSelectedSong
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Katalog</span>
        </button>

        {/* Playlist Rock */}
        <button
          onClick={() => onTabChange('playlist')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'playlist' && !hasSelectedSong
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListMusic className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Playlist</span>
        </button>

        {/* Artis */}
        <button
          onClick={() => onTabChange('artists')}
          className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors ${
            currentTab === 'artists' && !hasSelectedSong
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Artis</span>
        </button>

        {/* Request */}
        <button
          onClick={onOpenRequest}
          className="flex flex-col items-center justify-center min-h-[44px] cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">Request</span>
        </button>
      </div>
    </div>
  );
};
