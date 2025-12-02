
import React from 'react';
import { GamepadIcon, TrophyIcon, SparklesIcon } from './Icons';

export const QuizPanel: React.FC = () => {
    const gameUrl = "https://heitortravaz.itch.io/conectaquiz";

    return (
        <div className="flex flex-col h-full bg-[#0B0C15] text-white relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s'}}></div>
            </div>

            <header className="p-6 md:p-8 border-b border-white/5 flex items-center gap-4 bg-[#151725]/80 backdrop-blur-md sticky top-0 z-10 shadow-lg">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <GamepadIcon className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Quiz Conecta</h2>
                    <p className="text-sm text-slate-400">Desafie seus colegas e suba no ranking!</p>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 overflow-y-auto custom-scrollbar">
                
                <div className="max-w-md w-full bg-[#151725]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                    {/* Decorative Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/40 animate-[bounce_3s_infinite]">
                        <TrophyIcon className="h-10 w-10 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">Pronto para jogar?</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                        Teste seus conhecimentos sobre a cultura da empresa e ganhe pontos extras para o ranking mensal!
                    </p>

                    <a 
                        href={gameUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-purple-900/30 transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group/btn"
                    >
                        <GamepadIcon className="h-6 w-6 group-hover/btn:rotate-12 transition-transform" />
                        <span>Iniciar Quiz</span>
                    </a>
                    
                    <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest opacity-60">
                        Abre em nova janela para melhor performance
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center max-w-4xl w-full">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                            <SparklesIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <h4 className="font-bold text-white text-sm">Ganhe Pontos</h4>
                        <p className="text-xs text-slate-400 mt-1">Acumule score no perfil</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                            <TrophyIcon className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h4 className="font-bold text-white text-sm">Ranking</h4>
                        <p className="text-xs text-slate-400 mt-1">Dispute a liderança</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                            <GamepadIcon className="h-5 w-5 text-green-400" />
                        </div>
                        <h4 className="font-bold text-white text-sm">Diversão</h4>
                        <p className="text-xs text-slate-400 mt-1">Aprenda brincando</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
