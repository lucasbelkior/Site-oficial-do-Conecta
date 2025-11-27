
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, Conversation, SocialMessage, Post, TechNewsItem } from '../types';
import { Role } from '../types';
import { initialConversations } from '../socialDatabase';
import { UserIcon, SendIcon, PhoneIcon, VideoIcon, MessageSquareIcon, HomeIcon, SparklesIcon } from './Icons';
import { CallModal } from './CallModal';
import { UserProfile } from './UserProfile';

interface SocialPanelProps {
    currentUser: User;
    allUsers: User[];
    posts: Post[];
    techNews: TechNewsItem[];
    isLoadingNews: boolean;
    onCreatePost: (text: string) => void;
}

const MAX_POST_LENGTH = 280;

export const SocialPanel: React.FC<SocialPanelProps> = ({ currentUser, allUsers, posts, techNews, isLoadingNews, onCreatePost }) => {
    const [socialView, setSocialView] = useState<'feed' | 'chat' | 'profile'>('feed');
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messageText, setMessageText] = useState('');
    const [postText, setPostText] = useState('');
    const [callState, setCallState] = useState<{ active: boolean; type: 'audio' | 'video' | null; target: User | null }>({ active: false, type: null, target: null });
    
    // Determine which user profile to show. For now, 'profile' view is My Profile.
    // Future expansion: viewing other profiles via ID.
    const [profileUser, setProfileUser] = useState<User>(currentUser);

    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
    const members = allUsers.filter(u => u.role === Role.MEMBRO);
    const userMap = useMemo(() => new Map(allUsers.map(user => [user.id, user])), [allUsers]);

    // Keep profileUser synced with currentUser updates from App state
    useEffect(() => {
        if (profileUser.id === currentUser.id) {
            // Find the updated current user in allUsers to ensure we have latest data
            const updated = allUsers.find(u => u.id === currentUser.id);
            if (updated) setProfileUser(updated);
        }
    }, [allUsers, currentUser.id, profileUser.id]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const findOrCreateConversation = (participantId: string): Conversation => {
        const existing = conversations.find(c => 
            c.participantIds.includes(currentUser.id) && c.participantIds.includes(participantId)
        );
        if (existing) return existing;
        
        const newConversation: Conversation = {
            participantIds: [currentUser.id, participantId],
            messages: [],
        };
        setConversations(prev => [...prev, newConversation]);
        return newConversation;
    };

    const handleMemberSelect = (member: User) => {
        const conversation = findOrCreateConversation(member.id);
        setActiveConversation(conversation);
        setSocialView('chat');
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !activeConversation) return;

        const newMessage: SocialMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            text: messageText,
            timestamp: new Date().toISOString(),
        };

        const updatedConversation = { ...activeConversation, messages: [...activeConversation.messages, newMessage] };
        setConversations(prev => prev.map(c => c.participantIds.sort().join(',') === updatedConversation.participantIds.sort().join(',') ? updatedConversation : c));
        setActiveConversation(updatedConversation);
        setMessageText('');
    };
    
    const handleCreatePost = () => {
        if (!postText.trim()) return;
        onCreatePost(postText);
        setPostText('');
    };

    const getOtherParticipant = (convo: Conversation | null): User | undefined => {
        if (!convo) return undefined;
        const otherId = convo.participantIds.find(id => id !== currentUser.id);
        return userMap.get(otherId || '');
    };

    const handleInitiateCall = (type: 'audio' | 'video') => {
        const target = getOtherParticipant(activeConversation);
        if (target) {
            setCallState({ active: true, type, target });
        }
    };

    const handleHangUp = () => {
        setCallState({ active: false, type: null, target: null });
    };

    const handleViewMyProfile = () => {
        setProfileUser(currentUser);
        setSocialView('profile');
    };

    const renderMainContent = () => {
        if (socialView === 'profile') {
            return (
                <UserProfile 
                    user={profileUser} 
                    posts={posts} 
                    isOwnProfile={profileUser.id === currentUser.id} 
                />
            );
        }

        if (socialView === 'feed') {
            return (
                <div className="h-full flex flex-col bg-[#0B0C15]/50">
                    <header className="p-6 border-b border-white/5 bg-[#0B0C15]/40 backdrop-blur-sm sticky top-0 z-10">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Social Feed</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-6 max-w-2xl mx-auto w-full">
                            {/* Create Post Card */}
                            <div className="bg-[#151725]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-5 mb-8 shadow-lg hover:border-white/10 transition-colors">
                                <div className="flex space-x-4">
                                    <div className="flex-shrink-0 h-11 w-11 rounded-2xl bg-slate-700/50 flex items-center justify-center border border-white/5 overflow-hidden">
                                        {currentUser.avatarUrl ? (
                                            <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={postText}
                                            onChange={(e) => setPostText(e.target.value)}
                                            maxLength={MAX_POST_LENGTH}
                                            placeholder="No que você está pensando?"
                                            className="w-full bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none resize-none min-h-[100px]"
                                        />
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                            <span className={`text-xs font-mono ${postText.length > MAX_POST_LENGTH * 0.9 ? 'text-red-400' : 'text-slate-500'}`}>{postText.length} / {MAX_POST_LENGTH}</span>
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={!postText.trim()}
                                                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:shadow-none"
                                            >
                                                Publicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feed List */}
                            <ul className="space-y-6">
                                {posts.map(post => {
                                    const author = userMap.get(post.authorId);
                                    return (
                                        <li key={post.id} className="bg-[#151725]/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 hover:bg-[#151725]/60 transition-all duration-300">
                                            <div className="flex space-x-4">
                                                <div className="flex-shrink-0 h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center border border-white/5 overflow-hidden">
                                                     {author?.avatarUrl ? (
                                                        <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-slate-200">{author?.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span 
                                                            className="font-bold text-white hover:text-purple-400 transition-colors cursor-pointer"
                                                            onClick={() => {
                                                                if (author) {
                                                                    setProfileUser(author);
                                                                    setSocialView('profile');
                                                                }
                                                            }}
                                                        >
                                                            {author?.name || 'Usuário'}
                                                        </span>
                                                        <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">• {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-slate-200 whitespace-pre-wrap text-[15px] leading-relaxed font-light">{post.text}</p>
                                                    
                                                    <div className="flex items-center space-x-6 mt-5 pt-4 border-t border-white/5 text-slate-500">
                                                        <button className="flex items-center space-x-2 text-xs hover:text-pink-500 transition-colors group">
                                                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                             <span className="font-medium">Curtir</span>
                                                        </button>
                                                        <button className="flex items-center space-x-2 text-xs hover:text-blue-400 transition-colors group">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                            <span className="font-medium">Comentar</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        const otherUser = getOtherParticipant(activeConversation);
        if (socialView === 'chat' && activeConversation && otherUser) {
            return (
                <div className="flex flex-col h-full bg-[#0B0C15] relative">
                    <header className="flex items-center justify-between p-4 border-b border-white/5 bg-[#151725]/80 backdrop-blur-md">
                        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => { setProfileUser(otherUser); setSocialView('profile'); }}>
                            <div className="h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden">
                                {otherUser.avatarUrl ? <img src={otherUser.avatarUrl} className="w-full h-full object-cover" alt="" /> : otherUser.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white hover:underline">{otherUser.name}</h3>
                                <p className="text-[10px] text-green-400 flex items-center font-semibold uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>Online</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleInitiateCall('audio')} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"><PhoneIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleInitiateCall('video')} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"><VideoIcon className="h-5 w-5" /></button>
                        </div>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-[#0B0C15] to-[#11131f]">
                        {activeConversation.messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                <div className={`p-4 rounded-2xl max-w-sm text-[15px] shadow-sm ${msg.senderId === currentUser.id ? 'bg-purple-600 text-white rounded-br-none' : 'bg-[#1e2130] border border-white/5 text-slate-200 rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <span className="text-[9px] text-slate-600 pb-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                    <div className="p-5 bg-[#151725] border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
                            <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={`Mensagem para ${otherUser.name}...`} className="flex-1 bg-[#0B0C15] border border-white/10 rounded-full px-6 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors" />
                            <button type="submit" disabled={!messageText.trim()} className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3.5 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"><SendIcon className="h-5 w-5" /></button>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0B0C15]/50">
                <div className="bg-[#151725]/50 p-8 rounded-full mb-6 border border-white/5 shadow-2xl">
                     <MessageSquareIcon className="h-16 w-16 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Social Hub</h2>
                <p className="max-w-xs text-center text-sm font-light">Selecione uma conversa ao lado ou navegue pelo feed para interagir com a equipe.</p>
            </div>
        );
    };

    const isProfileView = socialView === 'profile';

    return (
        <div className={`h-full grid ${isProfileView ? 'grid-cols-[280px_1fr]' : 'grid-cols-[280px_1fr_340px]'} text-white`}>
            {/* Left Column: Navigation & Members */}
            <aside className="bg-[#0B0C15]/90 backdrop-blur-xl border-r border-white/5 flex flex-col pt-8 z-10 shadow-[5px_0_30px_rgba(0,0,0,0.2)]">
                <div className="px-6 mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Social</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Team Interaction</p>
                </div>
                <nav className="space-y-2 px-4 mb-8">
                    <button onClick={() => setSocialView('feed')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${socialView === 'feed' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                        <HomeIcon className="h-5 w-5"/><span>Feed de Notícias</span>
                    </button>
                    <button onClick={() => setSocialView('chat')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${socialView === 'chat' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                        <MessageSquareIcon className="h-5 w-5"/><span>Mensagens Diretas</span>
                    </button>
                    <button onClick={handleViewMyProfile} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${socialView === 'profile' && profileUser.id === currentUser.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                        <UserIcon className="h-5 w-5"/><span>Meu Perfil</span>
                    </button>
                </nav>
                <div className="flex-1 overflow-y-auto px-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Conversas</h3>
                    <ul className="space-y-1">
                        {members.filter(m => m.id !== currentUser.id).map(member => (
                            <li key={member.id}>
                                <button onClick={() => handleMemberSelect(member)} className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all group ${socialView === 'chat' && getOtherParticipant(activeConversation)?.id === member.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                    <div className="relative mr-3">
                                        <div className="h-10 w-10 rounded-xl bg-[#151725] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors overflow-hidden">
                                            {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" alt="" /> : member.name.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-[3px] border-[#0B0C15]"></div>
                                    </div>
                                    <span className={`text-sm font-medium ${socialView === 'chat' && getOtherParticipant(activeConversation)?.id === member.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{member.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Middle Column: Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0B0C15]">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none"></div>
                {renderMainContent()}
            </main>

            {/* Right Column: News (Only if not profile view) */}
            {!isProfileView && (
                <aside className="bg-[#0B0C15]/90 backdrop-blur-xl border-l border-white/5 p-6 overflow-y-auto z-10 shadow-[-5px_0_30px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center space-x-2 mb-8 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                        <SparklesIcon className="h-5 w-5 text-amber-400" />
                        <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wide">Trending Tech</h2>
                    </div>
                    
                    {isLoadingNews ? (
                        <div className="space-y-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse space-y-3">
                                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                    <div className="h-20 bg-white/5 rounded-xl w-full"></div>
                                    <div className="h-3 bg-white/5 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {techNews.map((news, index) => (
                                <article key={index} className="group cursor-pointer relative">
                                    <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-white/5 group-hover:bg-cyan-500/50 transition-colors"></div>
                                    <div className="pl-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] text-cyan-400 font-mono border border-cyan-500/20 px-1.5 py-0.5 rounded bg-cyan-500/5">{news.source}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors leading-snug mb-2 text-sm">{news.title}</h3>
                                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed group-hover:text-slate-400">{news.summary}</p>
                                    </div>
                                </article>
                            ))}
                            {techNews.length === 0 && (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-sm text-slate-500">Nenhuma notícia no momento.</p>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            )}
            
            {callState.active && callState.target && callState.type && (
                <CallModal currentUser={currentUser} targetUser={callState.target} callType={callState.type} onHangUp={handleHangUp}/>
            )}
        </div>
    );
};
