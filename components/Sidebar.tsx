
import React from 'react';
import type { Channel, User, Task } from '../types';
import { Role, TaskStatus } from '../types';
import { HashtagIcon, UserIcon, EditIcon, TrophyIcon, LogOutIcon, DashboardIcon, MessageSquareIcon, SparklesIcon, CalendarIcon, UsersIcon } from './Icons';

interface SidebarProps {
    channels: Channel[];
    users: User[];
    tasks: Task[];
    currentUser: User;
    view: 'assistant' | 'tasks' | 'admin' | 'social' | 'calendar' | 'channel' | 'teams' | 'planning';
    activeChannelId: string | null;
    onLogout: () => void;
    onInitiateEdit: (taskId: number) => void;
    onToggleAdminView: () => void;
    onToggleSocialView: () => void;
    onToggleAssistantView: () => void;
    onToggleCalendarView: () => void;
    onToggleTeamsView: () => void;
    onTogglePlanningView?: () => void;
    onSelectChannel: (channelId: string) => void;
    onViewMember: (userId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ channels, users, tasks, currentUser, view, activeChannelId, onLogout, onInitiateEdit, onToggleAdminView, onToggleSocialView, onToggleAssistantView, onToggleCalendarView, onToggleTeamsView, onTogglePlanningView, onSelectChannel, onViewMember }) => {
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    
    // Filter only global channels (those without teamId)
    const globalChannels = channels.filter(c => !c.teamId);
    
    let displayedTasks: Task[];
    let panelTitle: string;

    if (currentUser.role === Role.PATRAO) {
        displayedTasks = tasks.filter(t => t.status === TaskStatus.PENDENTE);
        panelTitle = `Pendências da Equipe`;
    } else { 
        displayedTasks = tasks.filter(t => 
            t.status === TaskStatus.PENDENTE && 
            t.responsible.includes(`@${currentUser.name}`)
        );
        panelTitle = `Minhas Tarefas`;
    }

    const navButtonClass = (isActive: boolean) => 
        `w-full flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(91,197,242,0.1)]' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`;

    return (
        <aside className="w-[280px] bg-[#0B0C15]/80 backdrop-blur-2xl flex flex-col h-full z-20 border-r border-white/5 relative shadow-[5px_0_30px_rgba(0,0,0,0.1)] transition-colors duration-300 hidden md:flex">
            
            <div className="flex-1 flex flex-col min-h-0 px-4 pt-6 space-y-8 overflow-y-auto custom-scrollbar">
                
                {/* Main Navigation */}
                <div className="space-y-1.5">
                     {/* Assistant Button */}
                     <button 
                        onClick={onToggleAssistantView}
                        className={navButtonClass(view === 'assistant')}
                    >
                        <SparklesIcon className={`h-5 w-5 ${view === 'assistant' ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-slate-500'}`} />
                        <span className="font-medium text-sm tracking-wide">Assistente IA</span>
                    </button>
                    
                     {/* Calendar Button */}
                     <button 
                        onClick={onToggleCalendarView}
                        className={navButtonClass(view === 'calendar')}
                    >
                        <CalendarIcon className={`h-5 w-5 ${view === 'calendar' ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-slate-500'}`} />
                        <span className="font-medium text-sm tracking-wide">Calendário</span>
                    </button>

                    {/* Social Hub / Chat for Boss */}
                     <button 
                        onClick={onToggleSocialView}
                        className={navButtonClass(view === 'social')}
                    >
                        <MessageSquareIcon className={`h-5 w-5 ${view === 'social' ? 'text-violet-400 drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]' : 'text-slate-500'}`} />
                        <span className="font-medium text-sm tracking-wide">{currentUser.role === Role.PATRAO ? 'Chat' : 'Social Hub'}</span>
                    </button>

                    {/* Teams Button */}
                    <button 
                        onClick={onToggleTeamsView}
                        className={navButtonClass(view === 'teams')}
                    >
                        <UsersIcon className={`h-5 w-5 ${view === 'teams' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-slate-500'}`} />
                        <span className="font-medium text-sm tracking-wide">Equipes</span>
                    </button>

                     {currentUser.role === Role.PATRAO && (
                        <>
                            <button 
                                onClick={onToggleAdminView}
                                className={navButtonClass(view === 'admin')}
                            >
                                <DashboardIcon className={`h-5 w-5 ${view === 'admin' ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'text-slate-500'}`} />
                                <span className="font-medium text-sm tracking-wide">Dashboard</span>
                            </button>
                            
                            <button 
                                onClick={onTogglePlanningView}
                                className={navButtonClass(view === 'planning')}
                            >
                                <CalendarIcon className={`h-5 w-5 ${view === 'planning' ? 'text-pink-400 drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]' : 'text-slate-500'}`} />
                                <span className="font-medium text-sm tracking-wide">Planejamento</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Channels - Clickable List */}
                <div>
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                        <span>Canais Globais</span>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </h2>
                    <ul className="space-y-1">
                        {globalChannels.map((channel) => {
                            const isActive = view === 'channel' && activeChannelId === channel.id;
                            return (
                                <li key={channel.id}>
                                    <button 
                                        onClick={() => onSelectChannel(channel.id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${isActive ? 'bg-white/5 text-white border-cyan-500/30 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <HashtagIcon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                                        <span className="text-sm font-medium">{channel.name.substring(1)}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Tasks Mini-Panel */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                    <div className="relative bg-[#151725]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl transition-all group-hover:border-cyan-500/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{panelTitle}</h3>
                            <span className="bg-cyan-500/10 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">{displayedTasks.length}</span>
                        </div>
                        <ul className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {displayedTasks.map(task => (
                                <li key={task.id} className="flex items-start justify-between text-brand-text group/item py-0.5">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                        <span className="text-xs font-medium leading-relaxed line-clamp-2 text-slate-400 group-hover/item:text-white transition-colors" title={task.title}>{task.title}</span>
                                    </div>
                                    {currentUser.role === Role.PATRAO && (
                                        <button 
                                            onClick={() => onInitiateEdit(task.id)}
                                            className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-cyan-400 transition-all scale-90 hover:scale-110"
                                        >
                                            <EditIcon className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </li>
                            ))}
                            {displayedTasks.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-xs text-slate-500 italic">Tudo limpo por aqui.</p>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Members List */}
                <div className="flex-1 pb-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                        <span>Membros</span>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </h2>
                    <ul className="space-y-2">
                        {sortedUsers.map((user) => {
                             const isClickable = currentUser.role === Role.PATRAO && user.role === Role.MEMBRO;
                             
                             const MemberContent = () => (
                                <div className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 border border-transparent ${isClickable ? 'hover:bg-white/5 hover:border-white/10 cursor-pointer group' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-transform ${user.role === Role.PATRAO ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-800 text-slate-300 border border-white/5 group-hover:border-white/20'}`}>
                                                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl"/> : user.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-[3px] border-[#0B0C15]"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium leading-none ${user.role === Role.PATRAO ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{user.name}</span>
                                            {user.role === Role.PATRAO && <span className="text-[9px] text-cyan-500 mt-1 font-bold">Admin</span>}
                                        </div>
                                    </div>
                                    {user.role === Role.MEMBRO && (
                                        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/10 group-hover:border-amber-500/30 transition-colors">
                                           <TrophyIcon className="h-3 w-3 text-amber-400" />
                                           <span className="text-xs font-mono font-bold text-amber-400">{user.points}</span>
                                        </div>
                                    )}
                                </div>
                             );

                            return (
                                <li key={user.id}>
                                    {isClickable ? (
                                        <button className="w-full text-left" onClick={() => onViewMember(user.id)}>
                                            <MemberContent />
                                        </button>
                                    ) : (
                                        <MemberContent />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0B0C15]/50 backdrop-blur transition-colors duration-300">
                <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/20 overflow-hidden">
                             {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover"/>
                            ) : (
                                <UserIcon className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors">{currentUser.name}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">{currentUser.role}</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-xl" title="Sair">
                            <LogOutIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};
