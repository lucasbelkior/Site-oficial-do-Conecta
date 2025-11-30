
import React, { useState, useMemo } from 'react';
import type { Task, GlobalReminder } from '../types';
import { TaskStatus } from '../types';
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ClockIcon, BellIcon } from './Icons';

interface CalendarViewProps {
    tasks: Task[];
    globalReminders?: GlobalReminder[]; // Props updated to accept real reminders
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, globalReminders = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

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
        const dayReminders = globalReminders.filter(r => r.date && isSameDate(r.date, dateObj));

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
            days.push(<div key={`empty-${i}`} className="min-h-[60px] md:h-24 lg:h-32 bg-transparent opacity-0"></div>);
        }

        // Calendar Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const { tasks: dayTasks, reminders: dayReminders } = getDayContent(day);
            
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const isSelected = selectedDate.toDateString() === dateObj.toDateString();
            
            days.push(
                <button 
                    key={day} 
                    onClick={() => setSelectedDate(dateObj)}
                    className={`min-h-[60px] md:h-24 lg:h-32 relative rounded-xl md:rounded-2xl border transition-all duration-300 flex flex-col items-start justify-between p-1.5 md:p-3 group overflow-hidden ${
                        isSelected 
                            ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/50 shadow-[0_0_20px_rgba(91,197,242,0.2)]' 
                            : isToday 
                                ? 'bg-white/5 border-white/20' 
                                : 'bg-[#151725]/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                >
                    <span className={`text-xs md:text-sm font-bold flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full ${isToday ? 'bg-cyan-500 text-white' : isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {day}
                    </span>

                    <div className="w-full space-y-1 pl-0.5 md:pl-1 mt-1">
                        {dayTasks.length > 0 && (
                            <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
                                <span className="text-[9px] md:text-[10px] text-slate-400 font-medium hidden sm:inline">{dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                            </div>
                        )}
                         {dayReminders.length > 0 && (
                            <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(192,132,252,0.8)]"></span>
                                <span className="text-[9px] md:text-[10px] text-slate-400 font-medium hidden sm:inline">{dayReminders.length} {dayReminders.length === 1 ? 'Event' : 'Events'}</span>
                            </div>
                        )}
                    </div>
                    
                    {isSelected && <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-xl md:rounded-2xl pointer-events-none"></div>}
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
        const dayReminders = globalReminders.filter(r => r.date === dateStr);
        
        return { dayTasks, dayReminders };
    }, [selectedDate, tasks, globalReminders]);

    return (
        <div className="flex flex-col lg:flex-row h-full bg-[#0B0C15] overflow-y-auto lg:overflow-hidden">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:overflow-hidden min-h-[500px]">
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <CalendarIcon className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
                            Planejamento
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm mt-1 ml-9 md:ml-11">Gerencie prazos e eventos.</p>
                    </div>
                    
                    <div className="flex items-center justify-between w-full md:w-auto space-x-6 bg-[#151725]/50 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                        <button onClick={handlePrevMonth} className="p-2 md:p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <span className="text-lg md:text-xl font-bold text-white min-w-[140px] md:min-w-[180px] text-center tracking-wide">
                            {monthNames[currentDate.getMonth()].substring(0, 3)} {currentDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 md:p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5 rotate-180" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2 text-center px-1">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{day.substring(0, 3)}</div>
                    ))}
                </div>

                <div className="flex-1 lg:overflow-y-auto custom-scrollbar pr-0 md:pr-2 pb-6 lg:pb-0">
                    <div className="grid grid-cols-7 gap-2 md:gap-3">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>

            {/* Side Agenda Panel - Stacks below on mobile/tablet */}
            <div className="w-full lg:w-96 bg-[#0B0C15] lg:bg-[#0B0C15]/90 backdrop-blur-xl lg:border-l border-t lg:border-t-0 border-white/5 p-6 md:p-8 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.3)] z-20 h-auto lg:h-full lg:overflow-y-auto">
                <div className="mb-6 md:mb-8">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Agenda do Dia</h3>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {selectedDate.getDate()} <span className="text-xl md:text-2xl text-slate-400 font-normal">{monthNames[selectedDate.getMonth()]}</span>
                    </h2>
                    <p className="text-slate-500 mt-1 capitalize">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                </div>

                <div className="space-y-6">
                    {selectedDayContent.dayReminders.length === 0 && selectedDayContent.dayTasks.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                            <BellIcon className="h-10 w-10 md:h-12 md:w-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Nada agendado para este dia.</p>
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
