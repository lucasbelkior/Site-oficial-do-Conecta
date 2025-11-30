
import React, { useState, useEffect, useRef } from 'react';
import { User, Post } from '../types';
import { updateUserProfile } from '../database';
import { EditIcon, CheckCircleIcon, UserIcon, TrophyIcon, SparklesIcon } from './Icons';

interface UserProfileProps {
    user: User;
    posts: Post[];
    isOwnProfile: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, posts, isOwnProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [name, setName] = useState(user.name);
    const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [coverUrl, setCoverUrl] = useState(user.coverUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    // Refs for file inputs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Sync when user prop changes (external updates)
    useEffect(() => {
        if (!isEditing) {
            resetForm();
        }
    }, [user, isEditing]);

    const resetForm = () => {
        setName(user.name);
        setJobTitle(user.jobTitle || '');
        setBio(user.bio || '');
        setLocation(user.location || '');
        setAvatarUrl(user.avatarUrl || '');
        setCoverUrl(user.coverUrl || '');
    };

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile(user.id, {
                name,
                jobTitle,
                bio,
                location,
                avatarUrl,
                coverUrl
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Erro ao salvar perfil.");
        } finally {
            setIsSaving(false);
        }
    };

    // Function to handle file selection and convert to Base64
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation: Limit size to ~800KB to prevent Firestore issues
            if (file.size > 800 * 1024) {
                alert("A imagem selecionada é muito grande. Por favor, escolha uma imagem menor que 800KB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'avatar') {
                    setAvatarUrl(result);
                } else {
                    setCoverUrl(result);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input value to allow selecting the same file again if needed
        e.target.value = '';
    };

    const userPosts = posts.filter(p => p.authorId === user.id);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#0B0C15]">
            
            {/* --- Banner Section --- */}
            <div className="relative h-40 md:h-64 w-full group">
                {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover transition-opacity duration-300" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-cyan-900"></div>
                )}
                
                {/* Visual overlay for editing Cover */}
                {isEditing && (
                    <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors z-10"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        <div className="bg-black/60 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-2 border border-white/20 hover:border-cyan-400 hover:text-cyan-400 transition-all pointer-events-none">
                            <EditIcon className="h-4 w-4" />
                            Alterar Capa
                        </div>
                        <input 
                            type="file" 
                            ref={coverInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'cover')}
                        />
                    </div>
                )}
            </div>

            {/* --- Profile Header Info --- */}
            <div className="px-4 md:px-10 relative mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-12 mb-4 gap-4 md:gap-6">
                    
                    {/* Avatar */}
                    <div className="relative group z-20 self-start md:self-auto ml-2 md:ml-0">
                        <div className="h-28 w-28 md:h-40 md:w-40 rounded-full border-4 border-[#0B0C15] shadow-2xl overflow-hidden bg-[#151725] flex items-center justify-center relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="h-14 w-14 md:h-16 md:w-16 text-slate-600" />
                            )}
                            
                            {/* Visual indicator for editing Avatar */}
                            {isEditing && (
                                <div 
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                                    onClick={() => avatarInputRef.current?.click()}
                                >
                                    <div className="text-white flex flex-col items-center gap-1 pointer-events-none">
                                        <div className="bg-cyan-600 p-2 rounded-full">
                                            <EditIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-bold">Alterar</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={avatarInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'avatar')}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Online Indicator */}
                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-4 border-[#0B0C15] rounded-full pointer-events-none" title="Online"></div>
                    </div>

                    {/* Name & Title & Inputs */}
                    <div className="flex-1 pt-2 md:pt-0 w-full">
                        {isEditing ? (
                            <div className="space-y-4 w-full max-w-xl">
                                {/* Instructions */}
                                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center gap-3">
                                    <div className="bg-blue-500/20 p-1.5 rounded-full">
                                        <SparklesIcon className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <p className="text-xs text-blue-200">
                                        Clique na <strong>Foto de Perfil</strong> ou na <strong>Imagem de Capa</strong> acima para fazer upload.
                                    </p>
                                </div>

                                {/* Personal Info */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome</label>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={e => setName(e.target.value)} 
                                            className="w-full bg-[#151725] text-white text-lg md:text-xl font-bold px-3 py-2 rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                                            placeholder="Seu Nome"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cargo / Função</label>
                                            <input 
                                                type="text" 
                                                value={jobTitle} 
                                                onChange={e => setJobTitle(e.target.value)} 
                                                className="w-full bg-[#151725] text-slate-300 text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                                                placeholder="Ex: Designer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Localização</label>
                                            <input 
                                                type="text" 
                                                value={location} 
                                                onChange={e => setLocation(e.target.value)} 
                                                className="w-full bg-[#151725] text-slate-400 text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-cyan-500 outline-none"
                                                placeholder="Ex: São Paulo"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                                    {name}
                                    {isOwnProfile && <span className="text-cyan-500 text-base md:text-lg" title="Perfil Verificado"><CheckCircleIcon className="h-4 w-4 md:h-5 md:w-5"/></span>}
                                </h1>
                                <p className="text-base md:text-lg text-slate-300 font-medium">{jobTitle || 'Membro da Equipe'}</p>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                    <span className="opacity-80">{location || 'Localização não definida'}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 md:gap-3 mt-0 md:mt-0 self-start md:self-end mb-4">
                        {isOwnProfile ? (
                            isEditing ? (
                                <div className="flex gap-2">
                                     <button 
                                        onClick={handleCancel}
                                        className="px-4 md:px-6 py-2 rounded-full border border-slate-600 text-slate-300 hover:bg-white/5 transition-colors font-medium text-xs md:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 md:px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-900/40 transition-all text-xs md:text-sm"
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 md:px-6 py-2 rounded-full border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium flex items-center gap-2 text-xs md:text-sm"
                                >
                                    <EditIcon className="h-4 w-4" /> Editar Perfil
                                </button>
                            )
                        ) : (
                             <button className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/40 transition-all text-sm">
                                Seguir
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Bio Section --- */}
                <div className="mt-2 mb-8 max-w-3xl">
                    {isEditing ? (
                        <div className="mt-4">
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Biografia</label>
                            <textarea 
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full bg-[#151725] text-slate-300 p-4 rounded-xl border border-white/10 focus:border-cyan-500 outline-none min-h-[100px]"
                                placeholder="Escreva sobre você..."
                            />
                        </div>
                    ) : (
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{bio || 'Nenhuma biografia adicionada.'}</p>
                    )}
                </div>

                {/* --- Stats Grid --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 max-w-4xl">
                     <div className="bg-[#151725]/50 border border-white/5 p-4 rounded-2xl">
                        <span className="block text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Seguidores</span>
                        <span className="text-xl md:text-2xl font-bold text-white">{user.followers || 0}</span>
                     </div>
                     <div className="bg-[#151725]/50 border border-white/5 p-4 rounded-2xl">
                        <span className="block text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Seguindo</span>
                        <span className="text-xl md:text-2xl font-bold text-white">{user.following || 0}</span>
                     </div>
                     <div className="bg-[#151725]/50 border border-white/5 p-4 rounded-2xl">
                        <span className="block text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">Score <TrophyIcon className="h-3 w-3 text-amber-400"/></span>
                        <span className="text-xl md:text-2xl font-bold text-amber-400">{user.points}</span>
                     </div>
                      <div className="bg-[#151725]/50 border border-white/5 p-4 rounded-2xl">
                        <span className="block text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Publicações</span>
                        <span className="text-xl md:text-2xl font-bold text-white">{userPosts.length}</span>
                     </div>
                </div>

                {/* --- Content Tabs --- */}
                <div className="border-t border-white/10">
                    <div className="flex gap-6 md:gap-8 mt-6 mb-6 overflow-x-auto">
                        <button className="text-cyan-400 font-bold border-b-2 border-cyan-400 pb-2 px-1 text-sm md:text-base flex-shrink-0">Publicações</button>
                        <button className="text-slate-500 font-medium hover:text-slate-300 transition-colors pb-2 px-1 text-sm md:text-base flex-shrink-0">Sobre</button>
                        <button className="text-slate-500 font-medium hover:text-slate-300 transition-colors pb-2 px-1 text-sm md:text-base flex-shrink-0">Atividade</button>
                    </div>

                    <div className="space-y-6 pb-24 md:pb-10 max-w-3xl">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <div key={post.id} className="bg-[#151725]/30 border border-white/5 p-4 md:p-6 rounded-2xl hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden">
                                            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover"/> : <UserIcon className="h-6 w-6 m-2 text-slate-400"/>}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{name}</p>
                                            <p className="text-slate-500 text-xs">{new Date(post.timestamp).toLocaleDateString()} • Publicado</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{post.text}</p>
                                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                                        <button className="text-slate-500 hover:text-cyan-400 text-xs font-bold flex items-center gap-1"><SparklesIcon className="h-3 w-3"/> Curtir</button>
                                        <button className="text-slate-500 hover:text-white text-xs font-bold">Comentar</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500 italic">
                                Nenhuma publicação recente.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
