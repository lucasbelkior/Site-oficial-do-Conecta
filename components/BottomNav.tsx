
import React from 'react';
import { SparklesIcon, CalendarIcon, MessageSquareIcon, UsersIcon, DashboardIcon, EditIcon, GamepadIcon } from './Icons';
import type { User } from '../types';
import { Role } from '../types';

interface BottomNavProps {
    view: string;
    currentUser: User;
    onToggleView: (view: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ view, currentUser, onToggleView }) => {
    // Adjusted padding and text size for better fit on small screens
    const navItemClass = (isActive: boolean) => 
        `flex flex-col items-center justify-center min-w-[60px] h-full space-y-1 transition-colors px-1 ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#0B0C15]/95 backdrop-blur-xl border-t border-white/10 z-50 flex justify-between items-center px-2 pb-safe overflow-x-auto no-scrollbar">
            <button onClick={() => onToggleView('assistant')} className={navItemClass(view === 'assistant')}>
                <SparklesIcon className="h-5 w-5" />
                <span className="text-[9px] font-medium whitespace-nowrap">IA</span>
            </button>
            
            <button onClick={() => onToggleView('teams')} className={navItemClass(view === 'teams')}>
                <UsersIcon className="h-5 w-5" />
                <span className="text-[9px] font-medium whitespace-nowrap">Equipes</span>
            </button>

            <button onClick={() => onToggleView('social')} className={navItemClass(view === 'social')}>
                <MessageSquareIcon className="h-5 w-5" />
                <span className="text-[9px] font-medium whitespace-nowrap">{currentUser.role === Role.PATRAO ? 'Chat' : 'Social'}</span>
            </button>

             {/* Quiz Button for Mobile */}
             <button onClick={() => onToggleView('quiz')} className={navItemClass(view === 'quiz')}>
                <GamepadIcon className="h-5 w-5" />
                <span className="text-[9px] font-medium whitespace-nowrap">Quiz</span>
            </button>

            <button onClick={() => onToggleView('calendar')} className={navItemClass(view === 'calendar')}>
                <CalendarIcon className="h-5 w-5" />
                <span className="text-[9px] font-medium whitespace-nowrap">Agenda</span>
            </button>

            {currentUser.role === Role.PATRAO && (
                <>
                    <button onClick={() => onToggleView('planning')} className={navItemClass(view === 'planning')}>
                        <EditIcon className="h-5 w-5" />
                        <span className="text-[9px] font-medium whitespace-nowrap">Plan.</span>
                    </button>
                    <button onClick={() => onToggleView('admin')} className={navItemClass(view === 'admin')}>
                        <DashboardIcon className="h-5 w-5" />
                        <span className="text-[9px] font-medium whitespace-nowrap">Admin</span>
                    </button>
                </>
            )}
        </nav>
    );
};
