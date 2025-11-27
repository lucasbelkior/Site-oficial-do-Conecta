
import React from 'react';
import { useTheme } from './ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
    onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-20 flex items-center justify-between px-8 border-b border-brand-border bg-brand-dark/40 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
            <div className="flex items-center space-x-4">
                <div 
                    className="relative w-32 cursor-pointer transition-transform hover:scale-105" 
                    onClick={onLogoClick}
                    title="Voltar para a Intro"
                >
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                    <img 
                        src="https://i.imgur.com/syClG5w.png" 
                        alt="Conecta" 
                        className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_8px_rgba(91,197,242,0.6)]" 
                    />
                </div>
                <div className="h-4 w-px bg-brand-border mx-4"></div>
                <span className="text-xs text-brand-muted font-medium tracking-widest uppercase">Workspace</span>
            </div>

            <div className="flex items-center">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-panel border border-transparent hover:border-brand-border transition-all duration-300"
                    title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                >
                    {theme === 'dark' ? (
                        <SunIcon className="h-5 w-5" />
                    ) : (
                        <MoonIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
        </header>
    );
};
