
import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { MessageSender } from '../types';
import { ConectaLogoIcon, UserIcon } from './Icons';

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    return (
        <div className="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar relative">
            <div className="space-y-8 relative z-10 max-w-4xl mx-auto pb-6">
                {messages.map((message) => {
                    const isUser = message.sender === MessageSender.USER;
                    return (
                        <div key={message.id} className={`flex items-start gap-5 ${isUser ? 'flex-row-reverse' : ''} group animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                             <div className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isUser ? 'bg-gradient-to-br from-slate-600 to-slate-800 text-slate-300 border border-white/5' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'}`}>
                                {isUser ? <UserIcon className="h-5 w-5" /> : <ConectaLogoIcon className="h-5 w-5" />}
                            </div>
                            
                            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                <div className={`py-4 px-6 rounded-3xl text-[15px] leading-relaxed shadow-md backdrop-blur-md ${
                                    isUser 
                                    ? 'bg-slate-800/80 text-white border border-white/10 rounded-tr-none' 
                                    : 'bg-[#151725]/80 text-slate-100 border border-cyan-500/10 rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                                }`}>
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                                <span className="text-[10px] font-medium text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 tracking-wide uppercase">
                                    {isUser ? 'Você' : 'Assistente Conecta'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                
                 {isLoading && (
                    <div className="flex items-start gap-5 animate-pulse">
                        <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <ConectaLogoIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="py-4 px-6 rounded-3xl bg-[#151725]/80 border border-cyan-500/10 rounded-tl-none shadow-md">
                             <div className="flex items-center space-x-1.5">
                                <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                                <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};
