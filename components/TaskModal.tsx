import React, { useState, useEffect } from 'react';
import type { Task, User, Channel } from '../types';
import { Role } from '../types';

interface TaskModalProps {
    task: Task | null;
    users: User[];
    channels: Channel[];
    onSave: (taskData: Partial<Task>) => void;
    onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, users, channels, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [channel, setChannel] = useState('');
    const [responsible, setResponsible] = useState<string[]>([]);
    const [points, setPoints] = useState(0);
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setChannel(task.channel);
            setResponsible(task.responsible);
            setPoints(task.points);
            setDeadline(task.deadline || '');
        } else {
           setChannel(channels[0]?.name || '');
        }
    }, [task, channels]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            description,
            channel,
            responsible,
            points,
            deadline: deadline || undefined,
        });
    };

    const handleResponsibleChange = (userName: string) => {
        setResponsible(prev => 
            prev.includes(userName) 
                ? prev.filter(r => r !== userName) 
                : [...prev, userName]
        );
    };

    const memberUsers = users.filter(u => u.role === Role.MEMBRO);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-4">{task ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Título</label>
                                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="channel" className="block text-sm font-medium text-slate-300 mb-1">Canal</label>
                                    <select id="channel" value={channel} onChange={e => setChannel(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {channels.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Responsável(eis)</label>
                                    <div className="bg-slate-700 border border-slate-600 rounded-md p-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                        {memberUsers.map(user => (
                                            <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={responsible.includes(`@${user.name}`)} onChange={() => handleResponsibleChange(`@${user.name}`)} className="form-checkbox h-4 w-4 rounded bg-slate-600 border-slate-500 text-blue-500 focus:ring-blue-500" />
                                                <span className="text-sm text-slate-200">{user.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="points" className="block text-sm font-medium text-slate-300 mb-1">Pontos</label>
                                    <input type="number" id="points" value={points} onChange={e => setPoints(Number(e.target.value))} min="0" required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-1">Prazo (opcional)</label>
                                    <input type="text" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="dd/mm/aaaa" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="bg-slate-700/50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-transparent hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-md transition-colors">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">{task ? 'Salvar Alterações' : 'Criar Tarefa'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};