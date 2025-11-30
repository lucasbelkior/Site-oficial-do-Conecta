
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
        <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto custom-scrollbar relative">
            <div className="space-y-6 relative z-10 max-w-4xl mx-auto pb-6">
                {messages.map((message) => {
                    const isUser = message.sender === MessageSender.USER;
                    return (
                        <div key={message.id} className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                             <div className={`flex-shrink-0 h-9 w-9 md:h-10 md:w-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                                 isUser 
                                 ? 'bg-slate-700 text-slate-300 border border-white/10' 
                                 : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'
                             }`}>
                                {isUser ? <UserIcon className="h-5 w-5" /> : <ConectaLogoIcon className="h-5 w-5" />}
                            </div>
                            
                            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                                <div className={`py-3.5 px-5 rounded-[1.5rem] text-[15px] leading-relaxed shadow-lg backdrop-blur-md relative ${
                                    isUser 
                                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm shadow-blue-500/10' 
                                    : 'bg-[#151725]/90 text-slate-200 border border-white/10 rounded-tl-sm shadow-black/20'
                                }`}>
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-2 tracking-wider uppercase">
                                    {isUser ? 'Você' : 'Conecta AI'}
                                </span>
                            </div>
                        </div>
                    );
                })}
                
                 {isLoading && (
                    <div className="flex items-start gap-4 animate-pulse">
                        <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <ConectaLogoIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="py-4 px-6 rounded-[1.5rem] bg-[#151725]/80 border border-cyan-500/20 rounded-tl-sm shadow-lg">
                             <div className="flex items-center space-x-1.5">
                                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};
