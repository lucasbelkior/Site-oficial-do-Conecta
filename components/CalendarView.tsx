
import React, { useState, useMemo } from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ClockIcon, BellIcon } from './Icons';

interface CalendarViewProps {
    tasks: Task[];
}

interface Reminder {
    id: number;
    title: string;
    date: string; // DD/MM/YYYY
    type: 'meeting' | 'holiday' | 'event';
    time?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock Reminders generator based on current month to ensure visibility
    const reminders: Reminder[] = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        
        return [
            { id: 101, title: 'Sprint Review', date: `05/${month}/${year}`, type: 'meeting', time: '10:00' },
            { id: 102, title: 'Almoço de Equipe', date: `12/${month}/${year}`, type: 'event', time: '12:30' },
            { id: 103, title: 'Feriado Local', date: `20/${month}/${year}`, type: 'holiday' },
            { id: 104, title: 'Planejamento Q3', date: `28/${month}/${year}`, type: 'meeting', time: '14:00' },
        ];
    }, [currentDate]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const isSameDate = (dateStr: string, dateObj: Date) => {
        // format of dateStr is DD/MM/YYYY
        const [d, m, y] = dateStr.split('/');
        return parseInt(d) === dateObj.getDate() && 
               parseInt(m) === dateObj.getMonth() + 1 && 
               parseInt(y) === dateObj.getFullYear();
    };

    const getDayContent = (day: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateObj = new Date(year, month, day);

        const dayTasks = tasks.filter(t => t.deadline && isSameDate(t.deadline, dateObj));
        const dayReminders = reminders.filter(r => isSameDate(r.date, dateObj));

        return { tasks: dayTasks, reminders: dayReminders };
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-transparent opacity-0"></div>);
        }

        // Calendar Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const { tasks: dayTasks, reminders: dayReminders } = getDayContent(day);
            
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const isSelected = selectedDate.toDateString() === dateObj.toDateString();
            
            const hasContent = dayTasks.length > 0 || dayReminders.length > 0;

            days.push(
                <button 
                    key={day} 
                    onClick={() => setSelectedDate(dateObj)}
                    className={`h-24 md:h-32 relative rounded-2xl border transition-all duration-300 flex flex-col items-start justify-between p-3 group overflow-hidden ${
                        isSelected 
                            ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/50 shadow-[0_0_20px_rgba(91,197,242,0.2)]' 
                            : isToday 
                                ? 'bg-white/5 border-white/20' 
                                : 'bg-[#151725]/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                >
                    <span className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-cyan-500 text-white' : isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {day}
                    </span>

                    <div className="w-full space-y-1.5 pl-1">
                        {dayTasks.length > 0 && (
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
                                <span className="text-[10px] text-slate-400 font-medium hidden md:inline">{dayTasks.length} Entrega{dayTasks.length > 1 ? 's' : ''}</span>
                            </div>
                        )}
                         {dayReminders.length > 0 && (
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(192,132,252,0.8)]"></span>
                                <span className="text-[10px] text-slate-400 font-medium hidden md:inline">{dayReminders.length} Evento{dayReminders.length > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                    
                    {isSelected && <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-2xl pointer-events-none"></div>}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    // Side Panel Data
    const selectedDayContent = useMemo(() => {
        const dateStr = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
        
        const dayTasks = tasks.filter(t => t.deadline === dateStr);
        const dayReminders = reminders.filter(r => r.date === dateStr);
        
        return { dayTasks, dayReminders };
    }, [selectedDate, tasks, reminders]);

    return (
        <div className="flex h-full bg-[#0B0C15]">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-cyan-400" />
                            Planejamento
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 ml-11">Gerencie prazos, eventos e entregas da equipe.</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 bg-[#151725]/50 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                        <button onClick={handlePrevMonth} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-xl font-bold text-white min-w-[180px] text-center tracking-wide">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ArrowLeftIcon className="h-5 w-5 rotate-180" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-7 gap-4 mb-4 text-center px-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="text-slate-500 text-xs font-bold uppercase tracking-widest">{day}</div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-7 gap-3">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>

            {/* Side Agenda Panel */}
            <div className="w-96 bg-[#0B0C15]/90 backdrop-blur-xl border-l border-white/5 p-8 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.3)] z-20">
                <div className="mb-8">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Agenda do Dia</h3>
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        {selectedDate.getDate()} <span className="text-2xl text-slate-400 font-normal">{monthNames[selectedDate.getMonth()]}</span>
                    </h2>
                    <p className="text-slate-500 mt-1">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                    {selectedDayContent.dayReminders.length === 0 && selectedDayContent.dayTasks.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                            <BellIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Nada agendado para este dia.</p>
                            <button className="mt-4 text-cyan-400 text-xs font-bold hover:underline">Adicionar Lembrete</button>
                        </div>
                    )}

                    {/* Reminders Section */}
                    {selectedDayContent.dayReminders.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                <ClockIcon className="h-3 w-3" /> Eventos & Lembretes
                            </h4>
                            {selectedDayContent.dayReminders.map(reminder => (
                                <div key={reminder.id} className="bg-[#151725] border-l-4 border-purple-500 rounded-r-xl p-4 shadow-lg hover:bg-[#1a1d2e] transition-colors">
                                    <h5 className="font-bold text-white text-sm">{reminder.title}</h5>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 uppercase font-semibold">
                                            {reminder.type}
                                        </span>
                                        {reminder.time && <span className="text-xs text-slate-400 font-mono">{reminder.time}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tasks Section */}
                    {selectedDayContent.dayTasks.length > 0 && (
                        <div className="space-y-3 pt-2">
                             <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircleIcon className="h-3 w-3" /> Entregas Previstas
                            </h4>
                            {selectedDayContent.dayTasks.map(task => (
                                <div key={task.id} className="bg-[#151725] border-l-4 border-cyan-500 rounded-r-xl p-4 shadow-lg hover:bg-[#1a1d2e] transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-bold text-white text-sm line-clamp-1">{task.title}</h5>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${task.status === TaskStatus.CONCLUIDA ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{task.channel}</span>
                                        <div className="flex -space-x-1.5">
                                            {task.responsible.map((resp, i) => (
                                                <div key={i} className="w-5 h-5 rounded-full bg-slate-700 border border-[#151725] flex items-center justify-center text-[8px] text-white font-bold" title={resp}>
                                                    {resp.charAt(1)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
