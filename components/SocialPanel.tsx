
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { User, SocialMessage, Post, TechNewsItem, Attachment, Team } from '../types';
import { Role } from '../types';
import { UserIcon, SendIcon, PhoneIcon, VideoIcon, MessageSquareIcon, HomeIcon, PaperclipIcon, MicIcon, StopIcon, SparklesIcon, UsersIcon, LogOutIcon, ArrowLeftIcon } from './Icons';
import { CallModal } from './CallModal';
import { UserProfile } from './UserProfile';

interface SocialPanelProps {
    currentUser: User;
    allUsers: User[];
    posts: Post[];
    techNews: TechNewsItem[];
    isLoadingNews: boolean;
    teams: Team[]; 
    onCreatePost: (text: string) => void;
    showFeed?: boolean; 
    directMessages: SocialMessage[]; 
    onSendDirectMessage: (text: string, receiverId: string, attachments?: Attachment[]) => void;
    onLogout?: () => void; // New Prop
}

const MAX_POST_LENGTH = 280;

export const SocialPanel: React.FC<SocialPanelProps> = ({ currentUser, allUsers, posts, techNews, isLoadingNews, teams, onCreatePost, showFeed = true, directMessages, onSendDirectMessage, onLogout }) => {
    // If showFeed is false (Boss), strictly initialize to 'chat'
    const [socialView, setSocialView] = useState<'feed' | 'chat' | 'profile'>(showFeed ? 'feed' : 'chat');
    const [activeConversationUserId, setActiveConversationUserId] = useState<string | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false); // New: Mobile Menu Toggle
    const [messageText, setMessageText] = useState('');
    const [postText, setPostText] = useState('');
    const [callState, setCallState] = useState<{ active: boolean; type: 'audio' | 'video' | null; target: User | null }>({ active: false, type: null, target: null });
    
    // File & Audio States
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);
    
    const [profileUser, setProfileUser] = useState<User>(currentUser);

    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Force redirect to chat if showFeed becomes false dynamically or if somehow set to feed
    useEffect(() => {
        if (!showFeed && socialView === 'feed') {
            setSocialView('chat');
        }
    }, [showFeed, socialView]);

    const userMap = useMemo(() => new Map(allUsers.map(user => [user.id, user])), [allUsers]);

    // 1. Identify Recent Contacts based on message history
    const recentContacts = useMemo(() => {
        const contactIds = new Set<string>();
        // Sort messages by newest first
        const sortedMsgs = [...directMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        sortedMsgs.forEach(msg => {
            if (msg.senderId === currentUser.id) contactIds.add(msg.receiverId);
            if (msg.receiverId === currentUser.id) contactIds.add(msg.senderId);
        });

        return Array.from(contactIds)
            .map(id => userMap.get(id))
            .filter((u): u is User => !!u);
    }, [directMessages, currentUser.id, userMap]);

    // 2. Identify Other Contacts (Everyone else in the company)
    const otherContacts = useMemo(() => {
        const recentIds = new Set(recentContacts.map(u => u.id));
        return allUsers.filter(u => u.id !== currentUser.id && !recentIds.has(u.id));
    }, [allUsers, currentUser.id, recentContacts]);


    // Derive active conversation messages from directMessages prop
    const activeMessages = useMemo(() => {
        if (!activeConversationUserId) return [];
        return directMessages.filter(msg => 
            (msg.senderId === currentUser.id && msg.receiverId === activeConversationUserId) ||
            (msg.senderId === activeConversationUserId && msg.receiverId === currentUser.id)
        );
    }, [directMessages, activeConversationUserId, currentUser.id]);

    useEffect(() => {
        if (profileUser.id === currentUser.id) {
            const updated = allUsers.find(u => u.id === currentUser.id);
            if (updated) setProfileUser(updated);
        }
    }, [allUsers, currentUser.id, profileUser.id]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages, attachments]);

    const handleMemberSelect = (member: User) => {
        setActiveConversationUserId(member.id);
        setSocialView('chat');
        setAttachments([]);
        setShowMobileMenu(false); // Close menu on selection
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!messageText.trim() && attachments.length === 0) || !activeConversationUserId) return;

        onSendDirectMessage(messageText, activeConversationUserId, attachments.length > 0 ? attachments : undefined);
        setMessageText('');
        setAttachments([]);
    };
    
    const handleCreatePost = () => {
        if (!postText.trim()) return;
        onCreatePost(postText);
        setPostText('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files) {
            Array.from(e.target.files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    let type: 'image' | 'video' | 'file' = 'file';
                    if (file.type.startsWith('image/')) type = 'image';
                    if (file.type.startsWith('video/')) type = 'video';
                    
                    setAttachments(prev => [...prev, { type, url: result, name: file.name }]);
                };
                reader.readAsDataURL(file);
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                     setAttachments(prev => [...prev, { type: 'audio', url: reader.result as string, name: 'Áudio gravado' }]);
                };
                reader.readAsDataURL(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setIsSimulatingAudio(false);
        } catch (err) {
            console.warn("Audio recording error (likely permission or sandbox issue). Switching to simulation mode.", err);
            setIsRecording(true);
            setIsSimulatingAudio(true);
        }
    };

    const stopRecording = () => {
        if (isSimulatingAudio) {
             setIsRecording(false);
             setIsSimulatingAudio(false);
             setAttachments(prev => [...prev, { 
                 type: 'audio', 
                 url: '', 
                 name: 'Áudio Simulado (Sem Microfone)' 
             }]);
        } else if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    const handleInitiateCall = (type: 'audio' | 'video') => {
        const target = activeConversationUserId ? userMap.get(activeConversationUserId) : null;
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
        setShowMobileMenu(false);
    };
    
    const renderAttachment = (att: Attachment) => {
        if (att.type === 'image') return <img src={att.url} alt="attachment" className="max-w-xs rounded-lg mt-2 border border-white/10" />;
        if (att.type === 'video') return <video src={att.url} controls className="max-w-xs rounded-lg mt-2 border border-white/10" />;
        if (att.type === 'audio') {
            if (!att.url) {
                return <div className="text-xs text-amber-500 mt-2 p-2 border border-amber-500/30 rounded bg-amber-500/10 italic">⚠️ {att.name}</div>;
            }
            return <audio src={att.url} controls className="mt-2" />;
        }
        return <div className="text-blue-400 text-sm underline mt-2 bg-[#151725] p-2 rounded">{att.name || 'Arquivo'}</div>;
    };

    const renderMainContent = () => {
        // STRICT SAFETY CHECK: If showFeed is false, NEVER render profile or feed.
        if (!showFeed && (socialView === 'feed' || socialView === 'profile')) {
             return (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0B0C15]/50 p-6 text-center">
                    <h2 className="text-xl font-bold text-slate-300 mb-2">Mensagens Privadas</h2>
                    <p className="max-w-xs text-center text-sm font-light">Selecione um colaborador ao lado.</p>
                    <button 
                        className="md:hidden mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold"
                        onClick={() => setShowMobileMenu(true)}
                    >
                        Ver Membros
                    </button>
                </div>
             );
        }

        if (socialView === 'profile') {
            return (
                <div className="flex-1 flex flex-col h-full">
                    {/* Mobile Profile Header with Back Button */}
                    <div className="md:hidden flex items-center p-4 border-b border-white/5 bg-[#0B0C15]">
                        <button onClick={() => setSocialView('feed')} className="mr-3 text-slate-400">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-bold text-white">Perfil</h2>
                    </div>
                    <UserProfile 
                        user={profileUser} 
                        posts={posts} 
                        isOwnProfile={profileUser.id === currentUser.id} 
                    />
                </div>
            );
        }

        if (socialView === 'feed' && showFeed) {
            return (
                <div className="h-full flex flex-col">
                    <header className="p-4 md:p-6 border-b border-white/5 bg-[#0B0C15]/40 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Social Feed</h2>
                         {/* Mobile Member Toggle */}
                         <button 
                            className="md:hidden flex items-center space-x-2 bg-gradient-to-r from-blue-600/50 to-purple-600/50 border border-white/20 text-white px-3 py-1.5 rounded-lg shadow-lg hover:brightness-110 transition-all" 
                            onClick={() => setShowMobileMenu(true)}
                        >
                            <MessageSquareIcon className="h-4 w-4" />
                            <span className="text-xs font-bold">Chats</span>
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
                            
                            {/* POST INPUT */}
                            <div className="bg-[#151725]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-5 mb-8 shadow-xl hover:border-white/10 transition-colors relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50"></div>
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
                                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white text-sm font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:shadow-none"
                                            >
                                                Publicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ul className="space-y-6 pb-20 md:pb-0">
                                {posts.map(post => {
                                    const author = userMap.get(post.authorId);
                                    return (
                                        <li key={post.id} className="bg-[#151725]/40 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 hover:bg-[#151725]/60 transition-all duration-300 shadow-lg">
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

        const otherUser = activeConversationUserId ? userMap.get(activeConversationUserId) : undefined;
        if (socialView === 'chat' && otherUser) {
            return (
                <div className="flex flex-col h-full bg-[#0B0C15] relative">
                    <header className="flex items-center justify-between p-3 md:p-4 border-b border-white/5 bg-[#151725]/80 backdrop-blur-md">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { 
                            if (showFeed) { setProfileUser(otherUser); setSocialView('profile'); }
                        }}>
                             {/* Mobile Back Button in Chat */}
                            <button className="md:hidden mr-1 text-slate-400 p-2 -ml-2" onClick={(e) => { e.stopPropagation(); setSocialView('feed'); setActiveConversationUserId(null); }}>
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold overflow-hidden">
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
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-[#0B0C15] to-[#11131f]">
                        {activeMessages.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <p className="text-sm text-slate-500">Nenhuma mensagem ainda.</p>
                            </div>
                        )}
                        {activeMessages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                <div className={`p-3 md:p-4 rounded-2xl max-w-[85%] text-[15px] shadow-lg ${msg.senderId === currentUser.id ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-none shadow-blue-500/20' : 'bg-[#151725] border border-white/5 text-slate-200 rounded-bl-none shadow-black/20'}`}>
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {msg.attachments.map((att, i) => <div key={i}>{renderAttachment(att)}</div>)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-slate-600 pb-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                    
                    {attachments.length > 0 && (
                        <div className="px-6 pt-4 bg-[#151725] border-t border-white/5 flex gap-3 overflow-x-auto">
                            {attachments.map((att, i) => (
                                <div key={i} className="relative group">
                                    {att.type === 'image' || att.type === 'video' ? (
                                        <div className="h-16 w-16 rounded-lg overflow-hidden border border-white/20">
                                            {att.type === 'image' ? <img src={att.url} className="w-full h-full object-cover" alt="" /> : <video src={att.url} className="w-full h-full object-cover" />}
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                                            {att.type === 'audio' ? <MicIcon className="h-6 w-6 text-slate-400"/> : <PaperclipIcon className="h-6 w-6 text-slate-400" />}
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="p-3 md:p-5 bg-[#151725] border-t border-white/5 pb-20 md:pb-5">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <PaperclipIcon className="h-5 w-5" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
                            
                            <button 
                                type="button" 
                                onClick={isRecording ? stopRecording : startRecording} 
                                className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-purple-400 hover:bg-white/5'}`}
                            >
                                {isRecording ? <StopIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
                            </button>

                            <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={`Mensagem...`} className="flex-1 bg-[#0B0C15] border border-white/10 rounded-full px-4 md:px-6 py-3 md:py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors" />
                            
                            <button type="submit" disabled={!messageText.trim() && attachments.length === 0} className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 md:p-3.5 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"><SendIcon className="h-5 w-5" /></button>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0B0C15]/50 p-6 text-center">
                <div className="bg-[#151725]/50 p-8 rounded-full mb-6 border border-white/5 shadow-2xl">
                     <MessageSquareIcon className="h-16 w-16 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{showFeed ? 'Mensagens Privadas' : 'Chat da Equipe'}</h2>
                <p className="max-w-xs text-center text-sm font-light">Selecione um colaborador ao lado para iniciar uma conversa.</p>
                <button 
                    className="md:hidden mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold"
                    onClick={() => setShowMobileMenu(true)}
                >
                    Ver Membros
                </button>
            </div>
        );
    };

    const isProfileView = socialView === 'profile';
    const isChatView = socialView === 'chat';
    
    return (
        // REFACTORED LAYOUT: Using Flexbox for rock-solid stability instead of Grid
        <div className="h-full flex overflow-hidden text-white relative">
            
            {/* 1. Left Sidebar: Navigation & Members */}
            <aside className={`
                ${showMobileMenu ? 'absolute inset-0 z-50 flex' : 'hidden'} 
                md:flex md:static md:w-72 md:shrink-0
                flex-col bg-[#0B0C15]/95 md:bg-[#0B0C15]/80 md:backdrop-blur-2xl border-r border-white/5 pt-8 shadow-[5px_0_30px_rgba(0,0,0,0.2)]
            `}>
                <div className="px-6 mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">{!showFeed ? 'Conversas' : 'Social'}</h2>
                        {showFeed && <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Team Interaction</p>}
                    </div>
                    {/* Mobile Close Button */}
                    <button className="md:hidden text-slate-400 p-2" onClick={() => setShowMobileMenu(false)}>✕</button>
                </div>
                
                {showFeed && (
                    <nav className="space-y-2 px-4 mb-8">
                        <button onClick={() => { setSocialView('feed'); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${socialView === 'feed' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                            <HomeIcon className="h-5 w-5"/><span>Feed de Notícias</span>
                        </button>
                        <button onClick={() => { setSocialView('chat'); setShowMobileMenu(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${socialView === 'chat' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                            <MessageSquareIcon className="h-5 w-5"/><span>Mensagens Diretas</span>
                        </button>
                        <button onClick={handleViewMyProfile} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${socialView === 'profile' && profileUser.id === currentUser.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
                            <UserIcon className="h-5 w-5"/><span>Meu Perfil</span>
                        </button>
                    </nav>
                )}

                <div className="flex-1 overflow-y-auto px-4 space-y-6">
                    {/* RECENT CHATS SECTION */}
                    {recentContacts.length > 0 && (
                        <div>
                             <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-2 px-2">Conversas Recentes</h3>
                             <ul className="space-y-1">
                                {recentContacts.map(member => (
                                    <li key={member.id}>
                                        <button onClick={() => handleMemberSelect(member)} className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all group ${socialView === 'chat' && activeConversationUserId === member.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                            <div className="relative mr-3">
                                                <div className="h-10 w-10 rounded-xl bg-[#151725] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors overflow-hidden">
                                                    {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" alt="" /> : member.name.charAt(0)}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-[3px] border-[#0B0C15]"></div>
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className={`text-sm font-medium truncate ${socialView === 'chat' && activeConversationUserId === member.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{member.name}</span>
                                                <span className="text-[9px] text-slate-600 truncate">{member.jobTitle || 'Membro'}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                    {/* ALL CONTACTS SECTION */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Outros Membros</h3>
                        {otherContacts.length > 0 ? (
                            <ul className="space-y-1">
                                {otherContacts.map(member => (
                                    <li key={member.id}>
                                        <button onClick={() => handleMemberSelect(member)} className={`w-full flex items-center p-2.5 rounded-xl text-left transition-all group ${socialView === 'chat' && activeConversationUserId === member.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                            <div className="relative mr-3">
                                                <div className="h-10 w-10 rounded-xl bg-[#151725] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors overflow-hidden">
                                                    {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" alt="" /> : member.name.charAt(0)}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-[3px] border-[#0B0C15]"></div>
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className={`text-sm font-medium truncate ${socialView === 'chat' && activeConversationUserId === member.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{member.name}</span>
                                                <span className="text-[9px] text-slate-600 truncate">{member.jobTitle || 'Membro'}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-600 italic px-2">
                                {recentContacts.length > 0 ? 'Todos os membros estão em recentes.' : 'Nenhum outro membro encontrado.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Mobile Specific Logout Button at bottom of menu */}
                {onLogout && (
                    <div className="md:hidden p-4 border-t border-white/10 mt-2">
                        <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-colors">
                            <LogOutIcon className="h-5 w-5" />
                            <span className="font-bold">Sair da Conta</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* 2. Middle Column: Main Content (Feed/Chat/Profile) */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0B0C15]/50 relative overflow-hidden">
                {renderMainContent()}
            </main>

            {/* 3. Right Column: News (Desktop Only) */}
            {!isProfileView && !isChatView && showFeed && (
                <aside className="hidden lg:block w-80 shrink-0 bg-[#0B0C15]/80 backdrop-blur-2xl border-l border-white/5 p-6 overflow-y-auto shadow-[-5px_0_30px_rgba(0,0,0,0.2)]">
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
