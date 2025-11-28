
import React, { useState } from 'react';
import type { GlobalReminder } from '../types';
import { addReminderToFirestore, deleteReminderFromFirestore } from '../database';
import { CalendarIcon, ClockIcon, TrashIcon, CheckCircleIcon } from './Icons';

interface PlanningPanelProps {
    reminders: GlobalReminder[];
    currentUser: any;
}

export const PlanningPanel: React.FC<PlanningPanelProps> = ({ reminders, currentUser }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState<'meeting' | 'event' | 'holiday'>('meeting');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        // Convert YYYY-MM-DD to DD/MM/YYYY for compatibility
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}/${month}/${year}`;

        await addReminderToFirestore({
            title,
            date: formattedDate,
            time,
            type,
            createdBy: currentUser.id
        });

        setTitle('');
        setDate('');
        setTime('');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
            await deleteReminderFromFirestore(id);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8 text-amber-400" />
                    Planejamento Global
                </h1>
                <p className="text-slate-400 mt-1">Crie eventos e lembretes que aparecerão no calendário de toda a equipe.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-[#151725]/60 border border-white/10 rounded-2xl p-6 h-fit">
                    <h2 className="text-lg font-bold text-white mb-4">Novo Evento</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-amber-500 outline-none"
                                placeholder="Ex: Reunião Geral"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Data</label>
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-amber-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Hora (Opcional)</label>
                                <input 
                                    type="time" 
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-amber-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Tipo</label>
                            <select 
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className="w-full bg-[#0B0C15] border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-amber-500 outline-none"
                            >
                                <option value="meeting">Reunião</option>
                                <option value="event">Evento</option>
                                <option value="holiday">Feriado/Folga</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 mt-2"
                        >
                            Adicionar ao Calendário
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-white mb-4">Eventos Agendados</h2>
                    <div className="space-y-3">
                        {reminders.length === 0 && (
                            <p className="text-slate-500 italic">Nenhum evento global agendado.</p>
                        )}
                        {reminders.map(reminder => (
                            <div key={reminder.id} className="bg-[#151725] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center 
                                        ${reminder.type === 'meeting' ? 'bg-blue-500/10 text-blue-400' : 
                                          reminder.type === 'holiday' ? 'bg-green-500/10 text-green-400' : 
                                          'bg-purple-500/10 text-purple-400'}`}>
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{reminder.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                            <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3"/> {reminder.date}</span>
                                            {reminder.time && <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3"/> {reminder.time}</span>}
                                            <span className="uppercase font-bold tracking-wider bg-white/5 px-2 py-0.5 rounded text-[9px]">{reminder.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(reminder.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
