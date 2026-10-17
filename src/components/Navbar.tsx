import React from 'react';
import { NavTab } from '../types/music';
import { PlayCircle, LayoutGrid, Radio, Library, Search } from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'listen-now',
      label: 'Listen Now',
      icon: <PlayCircle className="w-6 h-6" />
    },
    {
      id: 'browse',
      label: 'Browse',
      icon: <LayoutGrid className="w-6 h-6" />
    },
    {
      id: 'radio',
      label: 'Radio',
      icon: <Radio className="w-6 h-6" />
    },
    {
      id: 'library',
      label: 'Library',
      icon: <Library className="w-6 h-6" />
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-6 h-6" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 apple-glass pb-[env(safe-area-inset-bottom,8px)] pt-1 px-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 transition-colors duration-200 select-none ${
                isActive ? 'text-[#FA233B]' : 'text-[#8E8E93] hover:text-[#D1D1D6]'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'scale-100'}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
