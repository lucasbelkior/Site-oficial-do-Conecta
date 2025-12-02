
import React, { useState, useRef, useEffect } from 'react';
import type { Channel, ChannelMessage, User, Attachment } from '../types';
import { HashtagIcon, SendIcon, PaperclipIcon, MicIcon, StopIcon } from './Icons';

interface ChannelChatProps {
    channel: Channel;
    messages: ChannelMessage[];
    currentUser: User;
    allUsers: User[];
    onSendMessage: (text: string, attachments?: Attachment[]) => void;
}

export const ChannelChat: React.FC<ChannelChatProps> = ({ channel, messages, currentUser, allUsers, onSendMessage }) => {
    const [inputText, setInputText] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    
    // Audio Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<number | null>(null);

    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, attachments]);

    // Timer logic for recording
    useEffect(() => {
        if (isRecording) {
            setRecordingTime(0);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() && attachments.length === 0) return;
        
        onSendMessage(inputText, attachments.length > 0 ? attachments : undefined);
        setInputText('');
        setAttachments([]);
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
        // Reset to allow selecting same file again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // --- Audio Recording Logic ---
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
                    setAttachments(prev => [...prev, { 
                        type: 'audio', 
                        url: reader.result as string, 
                        name: `Áudio ${new Date().toLocaleTimeString()}` 
                    }]);
                };
                reader.readAsDataURL(blob);
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    const getUser = (userId: string) => allUsers.find(u => u.id === userId);

    const renderAttachment = (att: Attachment) => {
        if (att.type === 'image') {
            return <img src={att.url} alt="attachment" className="max-w-xs md:max-w-sm rounded-lg border border-white/10 mt-2" />;
        }
        if (att.type === 'video') {
            return <video src={att.url} controls className="max-w-xs md:max-w-sm rounded-lg border border-white/10 mt-2" />;
        }
        if (att.type === 'audio') {
            return (
                <div className="mt-2 w-full max-w-xs bg-[#151725] p-2 rounded-lg border border-white/10">
                    <audio src={att.url} controls className="w-full h-8" />
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 bg-[#151725] p-3 rounded-lg border border-white/10 mt-2 max-w-xs">
                <PaperclipIcon className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-blue-400 underline truncate">{att.name || 'Arquivo'}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0C15] relative">
            <header className="h-16 flex items-center px-6 border-b border-white/5 bg-[#151725]/80 backdrop-blur-md sticky top-0 z-20">
                <HashtagIcon className="h-5 w-5 text-slate-400 mr-3" />
                <h2 className="text-lg font-bold text-white tracking-tight">{channel.name.substring(1)}</h2>
                <div className="ml-4 h-4 w-px bg-white/10"></div>
                <span className="ml-4 text-xs text-slate-500 hidden md:inline">Este é o início do canal {channel.name}.</span>
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
                                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                                    {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/> : user?.name.charAt(0)}
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
                                {msg.text && <p className="text-slate-300 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {msg.attachments.map((att, i) => (
                                            <div key={i}>{renderAttachment(att)}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Attachments Preview Area */}
            {attachments.length > 0 && (
                <div className="px-6 pt-4 bg-[#151725] border-t border-white/5 flex gap-3 overflow-x-auto">
                    {attachments.map((att, i) => (
                        <div key={i} className="relative group flex-shrink-0">
                            {att.type === 'image' || att.type === 'video' ? (
                                <div className="h-16 w-16 rounded-lg overflow-hidden border border-white/20">
                                     {att.type === 'image' ? <img src={att.url} className="w-full h-full object-cover" alt="" /> : <video src={att.url} className="w-full h-full object-cover" />}
                                </div>
                            ) : (
                                <div className="h-16 w-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                                    {att.type === 'audio' ? <MicIcon className="h-6 w-6 text-slate-400" /> : <PaperclipIcon className="h-6 w-6 text-slate-400" />}
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

            <div className="p-6 bg-[#151725] border-t border-white/5 relative z-20">
                <form onSubmit={handleSubmit} className="relative">
                     <div className="relative flex items-center gap-2">
                        {/* File Upload Button */}
                        <div className="relative">
                            <button 
                                type="button"
                                onClick={() => !isRecording && fileInputRef.current?.click()}
                                className={`p-3 rounded-xl transition-all ${isRecording ? 'opacity-30 cursor-not-allowed' : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'}`}
                                title="Anexar arquivo"
                                disabled={isRecording}
                            >
                                <PaperclipIcon className="h-5 w-5" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
                        </div>

                        {/* Mic Button */}
                        <button 
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'}`}
                            title={isRecording ? "Parar gravação" : "Gravar áudio"}
                        >
                            {isRecording ? <StopIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
                        </button>

                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={isRecording ? "" : `Conversar em ${channel.name}...`}
                                className={`w-full bg-[#0B0C15] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/30 transition-all shadow-inner ${isRecording ? 'pl-20' : ''}`}
                                disabled={isRecording}
                            />
                            {isRecording && (
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-red-400 font-mono text-sm pointer-events-none">
                                    <span className="animate-pulse">●</span>
                                    <span>{formatTime(recordingTime)}</span>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={(!inputText.trim() && attachments.length === 0) || isRecording}
                            className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
