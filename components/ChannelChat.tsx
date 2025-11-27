
import React, { useState, useRef, useEffect } from 'react';
import type { Channel, ChannelMessage, User } from '../types';
import { HashtagIcon, SendIcon } from './Icons';

interface ChannelChatProps {
    channel: Channel;
    messages: ChannelMessage[];
    currentUser: User;
    allUsers: User[];
    onSendMessage: (text: string) => void;
}

export const ChannelChat: React.FC<ChannelChatProps> = ({ channel, messages, currentUser, allUsers, onSendMessage }) => {
    const [inputText, setInputText] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
    };

    const getUser = (userId: string) => allUsers.find(u => u.id === userId);

    return (
        <div className="flex flex-col h-full bg-[#0B0C15] relative">
            <header className="h-16 flex items-center px-6 border-b border-white/5 bg-[#151725]/80 backdrop-blur-md sticky top-0 z-20">
                <HashtagIcon className="h-5 w-5 text-slate-400 mr-3" />
                <h2 className="text-lg font-bold text-white tracking-tight">{channel.name.substring(1)}</h2>
                <div className="ml-4 h-4 w-px bg-white/10"></div>
                <span className="ml-4 text-xs text-slate-500">Este é o início do canal {channel.name}.</span>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-[#0B0C15] to-[#11131f]">
                {messages.length === 0 && (
                     <div className="text-center py-10 opacity-50">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HashtagIcon className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-sm text-slate-500">Sem mensagens ainda. Comece a conversa!</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const user = getUser(msg.userId);
                    const showHeader = index === 0 || messages[index - 1].userId !== msg.userId;
                    
                    return (
                        <div key={msg.id} className={`flex gap-4 group ${!showHeader ? 'mt-1' : 'mt-4'}`}>
                            {showHeader ? (
                                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {user?.name.charAt(0)}
                                </div>
                            ) : (
                                <div className="w-10"></div> // Spacer
                            )}
                            
                            <div className="flex-1 min-w-0">
                                {showHeader && (
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-bold text-white hover:underline cursor-pointer">{user?.name}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                )}
                                <p className="text-slate-300 text-[15px] leading-relaxed break-words">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            <div className="p-6 bg-[#151725] border-t border-white/5 relative z-20">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Conversar em ${channel.name}...`}
                        className="w-full bg-[#0B0C15] border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/30 transition-all shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="absolute right-2 top-2 p-2 bg-transparent text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                        <SendIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
