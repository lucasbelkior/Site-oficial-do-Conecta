
import React, { useState, useRef } from 'react';
import type { User, Team, Channel, ChannelMessage } from '../types';
import { Role } from '../types';
import { addTeamToFirestore, addChannelToFirestore, joinTeamInFirestore } from '../database';
import { UsersIcon, HashtagIcon, ArrowLeftIcon, MessageSquareIcon, EditIcon } from './Icons';
import { ChannelChat } from './ChannelChat';

interface TeamsPanelProps {
    currentUser: User;
    allUsers: User[];
    allTeams: Team[];
    allChannels: Channel[];
    allChannelMessages: ChannelMessage[];
    onSendChannelMessage: (text: string, channelId: string, attachments?: any[]) => void;
}

export const TeamsPanel: React.FC<TeamsPanelProps> = ({ currentUser, allUsers, allTeams, allChannels, allChannelMessages, onSendChannelMessage }) => {
    // View States
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    
    // Creation States
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    const [newTeamColor, setNewTeamColor] = useState('#22c55e'); // Default Green
    const [newTeamLogo, setNewTeamLogo] = useState('');
    
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    
    const logoInputRef = useRef<HTMLInputElement>(null);

    // --- Actions ---

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             const reader = new FileReader();
             reader.onload = () => {
                 setNewTeamLogo(reader.result as string);
             };
             reader.readAsDataURL(file);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        const newTeam: Omit<Team, 'id'> = {
            name: newTeamName,
            description: newTeamDesc,
            ownerId: currentUser.id,
            members: [currentUser.id],
            createdAt: new Date().toISOString(),
            logoUrl: newTeamLogo,
            themeColor: newTeamColor
        };

        try {
            await addTeamToFirestore(newTeam);
            setIsCreatingTeam(false);
            setNewTeamName('');
            setNewTeamDesc('');
            setNewTeamLogo('');
            setNewTeamColor('#22c55e');
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
        
    // Dynamic styles based on team theme
    const sidebarStyle = selectedTeam ? {
        backgroundColor: `${selectedTeam.themeColor}10`, // 10% opacity
        borderRight: `1px solid ${selectedTeam.themeColor}30`
    } : {};

    // --- Renders ---

    // 1. Team Browsing View
    if (!selectedTeam) {
        return (
            <div className="h-full bg-[#0B0C15] flex flex-col p-4 md:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <UsersIcon className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
                            Equipes
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm md:text-base">Encontre seu time ou crie uma nova comunidade.</p>
                    </div>
                    {currentUser.role === Role.PATRAO && (
                        <button 
                            onClick={() => setIsCreatingTeam(true)}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 md:px-6 md:py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-900/20"
                        >
                            + Criar <span className="hidden md:inline">Equipe</span>
                        </button>
                    )}
                </header>

                {/* Create Team Modal */}
                {isCreatingTeam && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsCreatingTeam(false)}>
                        <div className="bg-[#151725] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold text-white mb-4">Criar Nova Equipe</h2>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div className="flex justify-center mb-4">
                                     <div 
                                        className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-white transition-colors overflow-hidden relative"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        {newTeamLogo ? (
                                            <img src={newTeamLogo} className="w-full h-full object-cover" alt="Logo preview" />
                                        ) : (
                                            <div className="text-center">
                                                <EditIcon className="h-6 w-6 text-slate-500 mx-auto" />
                                                <span className="text-[10px] text-slate-500 block mt-1">Logo</span>
                                            </div>
                                        )}
                                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoSelect} />
                                    </div>
                                </div>
                            
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Nome da Equipe</label>
                                    <input 
                                        type="text" 
                                        value={newTeamName} 
                                        onChange={e => setNewTeamName(e.target.value)}
                                        className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-green-500 outline-none"
                                        placeholder="Ex: Squad Alpha"
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-xs text-slate-400 uppercase font-bold">Cor do Tema</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input 
                                                type="color" 
                                                value={newTeamColor} 
                                                onChange={e => setNewTeamColor(e.target.value)}
                                                className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                                            />
                                            <span className="text-xs text-slate-500">{newTeamColor}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Descrição</label>
                                    <textarea 
                                        value={newTeamDesc} 
                                        onChange={e => setNewTeamDesc(e.target.value)}
                                        className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-green-500 outline-none resize-none h-20"
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
                            <div key={team.id} className="bg-[#151725]/60 border border-white/5 rounded-2xl p-6 hover:border-opacity-50 transition-all group relative overflow-hidden" style={{ borderColor: `${team.themeColor}30` }}>
                                {/* Color Accent */}
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: team.themeColor || '#22c55e' }}></div>
                                
                                <div className="flex justify-between items-start mb-4 pl-2">
                                    <div className="h-14 w-14 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 bg-black/20">
                                        {team.logoUrl ? (
                                            <img src={team.logoUrl} className="w-full h-full object-cover" alt={team.name} />
                                        ) : (
                                             <UsersIcon className="h-6 w-6 text-slate-400" />
                                        )}
                                    </div>
                                    <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-400">{team.members.length} membros</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 pl-2">{team.name}</h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 pl-2">{team.description || "Sem descrição."}</p>
                                
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
                                        className="w-full hover:brightness-110 text-white py-2.5 rounded-xl font-medium transition-all"
                                        style={{ backgroundColor: team.themeColor || '#22c55e' }}
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
    // On Mobile: Flex Col (Sidebar on top/hidden based on logic, Chat on bottom/active)
    // Actually, on mobile, we need to toggle between Channel List and Chat
    const isMobile = window.innerWidth < 768; // Simple check, or rely on CSS hidden classes

    return (
        <div className="h-full flex flex-col md:flex-row bg-[#0B0C15]">
            {/* Team Sidebar (Channel List) */}
            {/* Hidden on mobile IF a channel is selected */}
            <div 
                className={`w-full md:w-64 flex flex-col border-r border-white/5 ${selectedChannel ? 'hidden md:flex' : 'flex'}`} 
                style={sidebarStyle}
            >
                <div className="p-4 border-b border-white/5">
                    <button onClick={() => { setSelectedTeam(null); setSelectedChannel(null); }} className="flex items-center text-slate-400 hover:text-white text-xs mb-3 transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" /> Voltar para Equipes
                    </button>
                    
                    <div className="flex items-center gap-3 mb-2">
                         <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-black/20 flex-shrink-0">
                            {selectedTeam.logoUrl ? (
                                <img src={selectedTeam.logoUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-white/5"><UsersIcon className="h-5 w-5 text-slate-400"/></div>
                            )}
                        </div>
                        <h2 className="font-bold text-white truncate text-lg leading-tight" title={selectedTeam.name}>{selectedTeam.name}</h2>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{selectedTeam.description}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    <div className="flex items-center justify-between mb-2 px-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Canais de Texto</span>
                        {selectedTeam.ownerId === currentUser.id && (
                            <button onClick={() => setIsCreatingChannel(true)} className="text-slate-500 hover:text-white text-lg leading-none" style={{ color: selectedTeam.themeColor }}>+</button>
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
                                className="w-full bg-[#151725] text-xs p-2 rounded text-white border outline-none"
                                style={{ borderColor: selectedTeam.themeColor || '#22c55e' }}
                                onBlur={() => setIsCreatingChannel(false)}
                            />
                        </form>
                    )}

                    <ul className="space-y-1">
                        {teamChannels.map(channel => {
                            const isActive = selectedChannel?.id === channel.id;
                            return (
                                <li key={channel.id}>
                                    <button 
                                        onClick={() => setSelectedChannel(channel)}
                                        className={`w-full flex items-center px-2 py-3 md:py-1.5 rounded-md text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                                        style={isActive ? { borderLeft: `3px solid ${selectedTeam.themeColor || '#22c55e'}` } : { borderLeft: '3px solid transparent' }}
                                    >
                                        <HashtagIcon className="h-4 w-4 mr-2 opacity-70" />
                                        {channel.name.replace('#', '')}
                                    </button>
                                </li>
                            );
                        })}
                        {teamChannels.length === 0 && (
                            <li className="text-xs text-slate-600 px-2 italic">Nenhum canal criado.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Team Chat Area */}
            {/* Hidden on mobile if NO channel selected */}
            <div className={`flex-1 flex flex-col bg-[#0B0C15] ${!selectedChannel ? 'hidden md:flex' : 'flex'}`}>
                {selectedChannel ? (
                    <>
                        {/* Mobile Back Button to Channel List */}
                        <div className="md:hidden p-2 bg-[#151725] border-b border-white/5 flex items-center">
                            <button onClick={() => setSelectedChannel(null)} className="flex items-center text-slate-400 text-sm">
                                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Canais
                            </button>
                        </div>
                        <ChannelChat 
                            channel={selectedChannel}
                            messages={currentChannelMessages}
                            currentUser={currentUser}
                            allUsers={allUsers}
                            onSendMessage={(text, attachments) => onSendChannelMessage(text, selectedChannel.id, attachments)}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
                        {selectedTeam.logoUrl && (
                             <img src={selectedTeam.logoUrl} className="absolute inset-0 w-full h-full object-cover opacity-5 blur-xl pointer-events-none" alt="" />
                        )}
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 z-10">
                            <MessageSquareIcon className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 z-10">Bem-vindo ao {selectedTeam.name}</h3>
                        <p className="z-10 px-4 text-center">Selecione um canal à esquerda para começar a colaborar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
