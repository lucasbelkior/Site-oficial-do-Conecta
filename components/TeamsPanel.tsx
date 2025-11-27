
import React, { useState, useEffect } from 'react';
import type { User, Team, Channel, ChannelMessage } from '../types';
import { Role } from '../types';
import { addTeamToFirestore, addChannelToFirestore, joinTeamInFirestore } from '../database';
import { UsersIcon, HashtagIcon, ArrowLeftIcon, MessageSquareIcon } from './Icons';
import { ChannelChat } from './ChannelChat';

interface TeamsPanelProps {
    currentUser: User;
    allUsers: User[];
    allTeams: Team[];
    allChannels: Channel[];
    allChannelMessages: ChannelMessage[];
    onSendChannelMessage: (text: string, channelId: string) => void;
}

export const TeamsPanel: React.FC<TeamsPanelProps> = ({ currentUser, allUsers, allTeams, allChannels, allChannelMessages, onSendChannelMessage }) => {
    // View States
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    
    // Creation States
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // --- Actions ---

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        const newTeam: Omit<Team, 'id'> = {
            name: newTeamName,
            description: newTeamDesc,
            ownerId: currentUser.id,
            members: [currentUser.id],
            createdAt: new Date().toISOString()
        };

        try {
            await addTeamToFirestore(newTeam);
            setIsCreatingTeam(false);
            setNewTeamName('');
            setNewTeamDesc('');
        } catch (error) {
            console.error("Error creating team:", error);
        }
    };

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim() || !selectedTeam) return;
        
        const nameFormatted = newChannelName.startsWith('#') ? newChannelName : `#${newChannelName}`;

        const newChannel: Omit<Channel, 'id'> = {
            name: nameFormatted,
            teamId: selectedTeam.id
        };

        try {
            await addChannelToFirestore(newChannel);
            setIsCreatingChannel(false);
            setNewChannelName('');
        } catch (error) {
            console.error("Error creating channel:", error);
        }
    };

    const handleJoinTeam = async (team: Team) => {
        try {
            await joinTeamInFirestore(team.id, currentUser.id, team.members);
            // Optionally auto-select team after join
            setSelectedTeam(team);
        } catch (error) {
            console.error("Error joining team:", error);
        }
    };

    // --- Computed Data ---
    
    const filteredTeams = allTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const teamChannels = selectedTeam 
        ? allChannels.filter(c => c.teamId === selectedTeam.id) 
        : [];

    const currentChannelMessages = selectedChannel
        ? allChannelMessages.filter(m => m.channelId === selectedChannel.id)
        : [];

    // --- Renders ---

    // 1. Team Browsing View
    if (!selectedTeam) {
        return (
            <div className="h-full bg-[#0B0C15] flex flex-col p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <UsersIcon className="h-8 w-8 text-green-400" />
                            Equipes
                        </h1>
                        <p className="text-slate-400 mt-1">Encontre seu time ou crie uma nova comunidade.</p>
                    </div>
                    {currentUser.role === Role.PATRAO && (
                        <button 
                            onClick={() => setIsCreatingTeam(true)}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20"
                        >
                            + Criar Equipe
                        </button>
                    )}
                </header>

                {/* Create Team Modal */}
                {isCreatingTeam && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsCreatingTeam(false)}>
                        <div className="bg-[#151725] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold text-white mb-4">Criar Nova Equipe</h2>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Nome da Equipe</label>
                                    <input 
                                        type="text" 
                                        value={newTeamName} 
                                        onChange={e => setNewTeamName(e.target.value)}
                                        className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1"
                                        placeholder="Ex: Squad Alpha"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Descrição</label>
                                    <input 
                                        type="text" 
                                        value={newTeamDesc} 
                                        onChange={e => setNewTeamDesc(e.target.value)}
                                        className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1"
                                        placeholder="Descrição curta..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsCreatingTeam(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancelar</button>
                                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold">Criar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="mb-8">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar equipes..."
                        className="w-full max-w-md bg-[#151725] border border-white/10 rounded-xl px-5 py-3 text-white focus:border-green-500/50 outline-none"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map(team => {
                        const isMember = team.members.includes(currentUser.id);
                        return (
                            <div key={team.id} className="bg-[#151725]/60 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/10">
                                        <UsersIcon className="h-6 w-6 text-green-400" />
                                    </div>
                                    <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400">{team.members.length} membros</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2">{team.description || "Sem descrição."}</p>
                                
                                {isMember ? (
                                    <button 
                                        onClick={() => setSelectedTeam(team)}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium border border-white/5 transition-colors"
                                    >
                                        Acessar Equipe
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleJoinTeam(team)}
                                        className="w-full bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white py-2.5 rounded-xl font-medium border border-green-600/20 hover:border-green-600 transition-all"
                                    >
                                        Entrar na Equipe
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {filteredTeams.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            Nenhuma equipe encontrada.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. Inside Selected Team View
    return (
        <div className="h-full flex bg-[#0B0C15]">
            {/* Team Sidebar */}
            <div className="w-64 bg-[#0F1018] border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <button onClick={() => { setSelectedTeam(null); setSelectedChannel(null); }} className="flex items-center text-slate-400 hover:text-white text-xs mb-3 transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" /> Voltar
                    </button>
                    <h2 className="font-bold text-white truncate text-lg" title={selectedTeam.name}>{selectedTeam.name}</h2>
                    <p className="text-xs text-slate-500 truncate">{selectedTeam.description}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    <div className="flex items-center justify-between mb-2 px-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Canais de Texto</span>
                        {selectedTeam.ownerId === currentUser.id && (
                            <button onClick={() => setIsCreatingChannel(true)} className="text-slate-500 hover:text-green-400 text-lg leading-none">+</button>
                        )}
                    </div>

                    {isCreatingChannel && (
                        <form onSubmit={handleCreateChannel} className="px-2 mb-3">
                            <input 
                                autoFocus
                                type="text" 
                                value={newChannelName} 
                                onChange={e => setNewChannelName(e.target.value)}
                                placeholder="Nome do canal..."
                                className="w-full bg-[#151725] text-xs p-2 rounded text-white border border-green-500/50 outline-none"
                                onBlur={() => setIsCreatingChannel(false)}
                            />
                        </form>
                    )}

                    <ul className="space-y-1">
                        {teamChannels.map(channel => (
                            <li key={channel.id}>
                                <button 
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`w-full flex items-center px-2 py-1.5 rounded-md text-sm transition-colors ${selectedChannel?.id === channel.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                                >
                                    <HashtagIcon className="h-4 w-4 mr-2 opacity-70" />
                                    {channel.name.replace('#', '')}
                                </button>
                            </li>
                        ))}
                        {teamChannels.length === 0 && (
                            <li className="text-xs text-slate-600 px-2 italic">Nenhum canal criado.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Team Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0B0C15]">
                {selectedChannel ? (
                    <ChannelChat 
                        channel={selectedChannel}
                        messages={currentChannelMessages}
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onSendMessage={(text) => onSendChannelMessage(text, selectedChannel.id)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <MessageSquareIcon className="h-8 w-8" />
                        </div>
                        <p>Selecione um canal para conversar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
