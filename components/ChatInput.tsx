
import React, { forwardRef } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
    value: string;
    onChange: (text: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
    ({ value, onChange, onSubmit, isLoading }, ref) => {
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSubmit();
            }
        };

        return (
            <div className="p-6 pt-2 pb-8 relative z-20">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500 group-focus-within:opacity-60"></div>
                        
                        <div className="relative flex items-center bg-[#151725] border border-white/10 rounded-full shadow-2xl transition-all focus-within:border-cyan-500/30 focus-within:bg-[#1a1d2e]">
                            <input
                                ref={ref}
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="Digite um comando para o assistente..."
                                className="flex-1 bg-transparent px-8 py-4.5 text-white placeholder-slate-500 focus:outline-none font-medium text-base h-16"
                                disabled={isLoading}
                            />
                            <div className="pr-2">
                                <button
                                    type="submit"
                                    className="p-3.5 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white hover:shadow-[0_0_15px_rgba(91,197,242,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 disabled:shadow-none"
                                    disabled={isLoading || !value.trim()}
                                >
                                    <SendIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="text-center mt-4">
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase opacity-70">
                            Dica: Tente "Mostrar ranking" ou "Criar tarefa no canal #projetos"
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);
