
import React from 'react';
import { SparklesIcon, CalendarIcon, MessageSquareIcon, UsersIcon, DashboardIcon } from './Icons';
import type { User } from '../types';
import { Role } from '../types';

interface BottomNavProps {
    view: string;
    currentUser: User;
    onToggleView: (view: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ view, currentUser, onToggleView }) => {
    const navItemClass = (isActive: boolean) => 
        `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#0B0C15]/95 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center px-2 pb-safe">
            <button onClick={() => onToggleView('assistant')} className={navItemClass(view === 'assistant')}>
                <SparklesIcon className="h-6 w-6" />
                <span className="text-[9px] font-medium">IA</span>
            </button>
            
            <button onClick={() => onToggleView('teams')} className={navItemClass(view === 'teams')}>
                <UsersIcon className="h-6 w-6" />
                <span className="text-[9px] font-medium">Equipes</span>
            </button>

            <button onClick={() => onToggleView('social')} className={navItemClass(view === 'social')}>
                <MessageSquareIcon className="h-6 w-6" />
                <span className="text-[9px] font-medium">{currentUser.role === Role.PATRAO ? 'Chat' : 'Social'}</span>
            </button>

            <button onClick={() => onToggleView('calendar')} className={navItemClass(view === 'calendar')}>
                <CalendarIcon className="h-6 w-6" />
                <span className="text-[9px] font-medium">Agenda</span>
            </button>

            {currentUser.role === Role.PATRAO && (
                <button onClick={() => onToggleView('admin')} className={navItemClass(view === 'admin')}>
                    <DashboardIcon className="h-6 w-6" />
                    <span className="text-[9px] font-medium">Admin</span>
                </button>
            )}
        </nav>
    );
};
