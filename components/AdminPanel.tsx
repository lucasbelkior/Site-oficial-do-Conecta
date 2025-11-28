
import React, { useState } from 'react';
import type { Task, User, Channel } from '../types';
import { TaskStatus, Role } from '../types';
import { EditIcon, TrashIcon, CheckCircleIcon, ArrowLeftIcon, TrophyIcon, DashboardIcon, SparklesIcon, UsersIcon } from './Icons';
import { TaskModal } from './TaskModal';
import { updateUserRole } from '../database';

interface AdminPanelProps {
    tasks: Task[];
    users: User[];
    channels: Channel[];
    onCreateTask: (taskData: Partial<Task>) => void;
    onEditTask: (taskId: number, taskData: Partial<Task>) => void;
    onDeleteTask: (taskId: number) => void;
    viewingMember: User | null;
    onBackToDashboard: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ tasks, users, channels, onCreateTask, onEditTask, onDeleteTask, viewingMember, onBackToDashboard }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = (taskData: Partial<Task>) => {
        if (editingTask) {
            onEditTask(editingTask.id, taskData);
        } else {
            onCreateTask(taskData);
        }
        handleCloseModal();
    };

    const handleDeleteClick = (taskId: number, taskTitle: string) => {
        if (window.confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}"?`)) {
            onDeleteTask(taskId);
        }
    };

    const handleToggleRole = async (user: User) => {
        const newRole = user.role === Role.PATRAO ? Role.MEMBRO : Role.PATRAO;
        const action = newRole === Role.PATRAO ? "promover" : "rebaixar";
        
        if (window.confirm(`Deseja realmente ${action} ${user.name} para ${newRole}?`)) {
            try {
                await updateUserRole(user.id, newRole);
            } catch (error) {
                console.error("Erro ao alterar cargo:", error);
                alert("Erro ao atualizar usuário.");
            }
        }
    };
    
    const MainDashboard = () => {
        const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDENTE);
        const completedTasks = tasks.filter(t => t.status === TaskStatus.CONCLUIDA);
        const totalPointsAwarded = completedTasks.reduce((sum, task) => sum + task.points, 0);

        const StatCard = ({ title, value, color, icon }: any) => (
            <div className="bg-[#151725]/60 backdrop-blur-md border border-white/5 p-6 rounded-[1.5rem] relative overflow-hidden group hover:border-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-${color}-500/20 transition-colors`}></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/10`}>
                            {icon}
                        </div>
                        <p className={`text-${color}-400/60 text-[10px] font-bold uppercase tracking-widest`}>{title}</p>
                    </div>
                    <h3 className="text-4xl font-bold text-white tracking-tight">{value}</h3>
                </div>
            </div>
        );

        const TaskList = ({ title, tasklist }: { title: string, tasklist: Task[]}) => (
            <div className="bg-[#151725]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col h-full">
                <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <h3 className="font-semibold text-white tracking-wide text-sm">{title}</h3>
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-mono">{tasklist.length}</span>
                </div>
                <div className="divide-y divide-white/5 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {tasklist.length > 0 ? tasklist.map(task => (
                        <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === TaskStatus.PENDENTE ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}></div>
                                    <p className="font-medium text-slate-200 truncate text-sm">{task.title}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pl-5">
                                    <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/10">{task.channel}</span>
                                    <span>{task.responsible.join(', ')}</span>
                                    <span className="text-amber-400 font-mono font-bold">{task.points} pts</span>
                                    {task.deadline && (
                                        <span className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">Prazo: {task.deadline}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                 <button onClick={() => handleOpenEditModal(task)} className="p-2 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"><EditIcon className="h-4 w-4" /></button>
                                 <button onClick={() => handleDeleteClick(task.id, task.title)} className="p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    )) : <div className="p-10 text-center text-slate-600 italic text-sm">Nenhum registro encontrado.</div>}
                </div>
            </div>
        );

        // New User Management List
        const UserManagementList = () => (
             <div className="bg-[#151725]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col h-full">
                <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <h3 className="font-semibold text-white tracking-wide text-sm">Gestão de Usuários</h3>
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-mono">{users.length}</span>
                </div>
                <div className="divide-y divide-white/5 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {users.map(user => (
                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                             <div className="flex items-center space-x-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${user.role === Role.PATRAO ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                    <p className="text-[10px] text-slate-500">{user.email || 'Sem email'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${user.role === Role.PATRAO ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : 'text-slate-400 border-slate-600/30 bg-slate-600/10'}`}>
                                    {user.role}
                                </span>
                                <button 
                                    onClick={() => handleToggleRole(user)}
                                    className="text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded transition-all"
                                >
                                    Trocar Cargo
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        return (
            <div className="max-w-7xl mx-auto space-y-8 p-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Visão Geral</h1>
                        <p className="text-slate-400 text-sm mt-1">Gerencie o desempenho e as tarefas da equipe em tempo real.</p>
                    </div>
                    <button onClick={handleOpenCreateModal} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(42,106,178,0.4)] hover:shadow-[0_0_30px_rgba(91,197,242,0.6)] active:scale-95 flex items-center space-x-2 border border-white/10">
                        <span>+ Nova Tarefa</span>
                    </button>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total de Tarefas" value={tasks.length} color="blue" icon={<DashboardIcon className="h-6 w-6"/>} />
                    <StatCard title="Pendências" value={pendingTasks.length} color="amber" icon={<CheckCircleIcon className="h-6 w-6"/>} />
                    <StatCard title="Pontos Distribuídos" value={totalPointsAwarded} color="green" icon={<TrophyIcon className="h-6 w-6"/>} />
                </section>
                
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                    <div className="flex flex-col gap-8 h-full">
                         <TaskList title="Fila de Pendências" tasklist={pendingTasks} />
                    </div>
                    <div className="flex flex-col gap-8 h-full">
                         <UserManagementList />
                    </div>
                </section>
            </div>
        );
    };

    const MemberDetailPanel = ({ member }: { member: User }) => {
        const memberTasks = tasks.filter(t => t.responsible.includes(`@${member.name}`));
        const pendingTasks = memberTasks.filter(t => t.status === TaskStatus.PENDENTE);
        const completedTasks = memberTasks.filter(t => t.status === TaskStatus.CONCLUIDA);
        const completionRate = memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0;

        const handlePromote = async () => {
            if (window.confirm(`Tem certeza que deseja promover ${member.name} a Patrão? Este usuário terá acesso total ao painel.`)) {
                try {
                    await updateUserRole(member.id, Role.PATRAO);
                    onBackToDashboard();
                } catch (error) {
                    console.error("Error promoting user:", error);
                    alert("Erro ao promover usuário.");
                }
            }
        };
        
        const handleDemote = async () => {
             if (window.confirm(`Tem certeza que deseja rebaixar ${member.name} para Membro?`)) {
                try {
                    await updateUserRole(member.id, Role.MEMBRO);
                    onBackToDashboard();
                } catch (error) {
                    console.error("Error demoting user:", error);
                    alert("Erro ao rebaixar usuário.");
                }
            }
        };

        const ReadOnlyTaskList = ({ title, tasklist }: { title: string, tasklist: Task[]}) => (
             <div className="bg-[#151725]/60 backdrop-blur-md border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col h-full">
                <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                     <h3 className="font-semibold text-white text-sm">{title}</h3>
                </div>
                <div className="divide-y divide-white/5 overflow-y-auto custom-scrollbar">
                    {tasklist.length > 0 ? tasklist.map(task => (
                        <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-medium text-slate-200 text-sm">{task.title}</p>
                                <span className="text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/10">{task.points} pts</span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">{task.channel}</span>
                                {task.deadline && <span>• Prazo: {task.deadline}</span>}
                            </p>
                        </div>
                    )) : <div className="p-8 text-center text-slate-600 italic text-sm">Nada para mostrar.</div>}
                </div>
            </div>
        );

        return (
            <div className="max-w-5xl mx-auto p-6">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center">
                        <button onClick={onBackToDashboard} className="mr-5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-300 transition-all group">
                            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                             <h1 className="text-3xl font-bold text-white">Perfil do Colaborador</h1>
                             <p className="text-slate-400 text-sm mt-1">Análise detalhada de <span className="text-cyan-400 font-semibold">{member.name}</span></p>
                        </div>
                    </div>
                    {member.role === Role.MEMBRO ? (
                        <button 
                            onClick={handlePromote}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 px-6 rounded-xl shadow-lg shadow-purple-900/40 transition-all text-sm flex items-center gap-2"
                        >
                            <SparklesIcon className="h-4 w-4" />
                            Promover a Admin
                        </button>
                    ) : (
                         <button 
                            onClick={handleDemote}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-6 rounded-xl transition-all text-sm flex items-center gap-2 border border-slate-600"
                        >
                            Rebaixar para Membro
                        </button>
                    )}
                </header>

                 <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#151725]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                            <TrophyIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Score Total</h3>
                        <p className="text-5xl font-bold text-white tracking-tighter">{member.points}</p>
                    </div>
                    <div className="bg-[#151725]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 text-center shadow-lg relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                        <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            <DashboardIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Tarefas Atribuídas</h3>
                        <p className="text-5xl font-bold text-white tracking-tighter">{memberTasks.length}</p>
                    </div>
                    <div className="bg-[#151725]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 text-center shadow-lg relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
                        <div className="inline-flex p-4 rounded-2xl bg-green-500/10 text-green-400 mb-4 border border-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                            <CheckCircleIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Taxa de Conclusão</h3>
                        <p className="text-5xl font-bold text-white tracking-tighter">{completionRate}%</p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
                    <ReadOnlyTaskList title="Em Aberto" tasklist={pendingTasks} />
                    <ReadOnlyTaskList title="Concluídas" tasklist={completedTasks} />
                </section>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            {viewingMember ? <MemberDetailPanel member={viewingMember} /> : <MainDashboard />}
            
            {isModalOpen && (
                <TaskModal 
                    task={editingTask}
                    users={users}
                    channels={channels}
                    onSave={handleSaveTask}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};
