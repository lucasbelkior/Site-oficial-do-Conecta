
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav'; // Import BottomNav
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { AdminPanel } from './AdminPanel';
import { SocialPanel } from './SocialPanel';
import { TeamsPanel } from './TeamsPanel';
import { PlanningPanel } from './PlanningPanel'; 
import { CalendarView } from './CalendarView';
import { ChannelChat } from './ChannelChat';
import { processCommand, getTechNews } from '../services/geminiService';
import type { User, Task, Channel, Message, GeminiResponse, Post, TechNewsItem, ChannelMessage, Team, Attachment, GlobalReminder, SocialMessage } from '../types';
import { TaskStatus, MessageSender, Role } from '../types';
import { 
    subscribeToTasks, 
    subscribeToChannels, 
    subscribeToChannelMessages,
    subscribeToTeams, 
    subscribeToReminders, 
    subscribeToDirectMessages,
    subscribeToPosts,
    addPostToFirestore,
    addTaskToFirestore, 
    updateTaskInFirestore, 
    deleteTaskFromFirestore,
    addMessageToFirestore,
    addDirectMessageToFirestore,
    updateUserPoints
} from '../database';

interface MainLayoutProps {
    currentUser: User;
    onLogout: () => void;
    allUsers: User[];
    allChannels: Channel[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, onLogout, allUsers }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [reminders, setReminders] = useState<GlobalReminder[]>([]); 
    const [directMessages, setDirectMessages] = useState<SocialMessage[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);

    const [messages, setMessages] = useState<Message[]>([
      { id: 1, text: `Olá ${currentUser.name}! Sou o assistente da Conecta. Como posso ajudar a equipe hoje?`, sender: MessageSender.ASSISTANT}
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatInputText, setChatInputText] = useState('');
    
    const [view, setView] = useState<'assistant' | 'admin' | 'social' | 'calendar' | 'channel' | 'teams' | 'planning'>('assistant');
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [viewingMember, setViewingMember] = useState<User | null>(null);
    
    const [techNews, setTechNews] = useState<TechNewsItem[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(false);

    const chatInputRef = useRef<HTMLInputElement>(null);

    // --- Realtime Subscriptions ---
    useEffect(() => {
        const unsubTasks = subscribeToTasks(setTasks);
        const unsubChannels = subscribeToChannels(setChannels);
        const unsubMessages = subscribeToChannelMessages(setChannelMessages);
        const unsubTeams = subscribeToTeams(setTeams);
        const unsubReminders = subscribeToReminders(setReminders);
        const unsubDirectMessages = subscribeToDirectMessages(setDirectMessages);
        const unsubPosts = subscribeToPosts(setPosts);

        return () => {
            unsubTasks();
            unsubChannels();
            unsubMessages();
            unsubTeams();
            unsubReminders();
            unsubDirectMessages();
            unsubPosts();
        };
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            // Fetch news only if viewing social and the user allows feed (Members)
            // Or if we want Boss to see news but not feed? The prompt implies hiding the "tweet" part.
            // If we hide feed, SocialPanel hides the news column too.
            if (view === 'social' && currentUser.role !== Role.PATRAO && techNews.length === 0) {
                setIsLoadingNews(true);
                try {
                    const news = await getTechNews();
                    setTechNews(news);
                } catch (error) {
                    console.error("Failed to fetch tech news:", error);
                } finally {
                    setIsLoadingNews(false);
                }
            }
        };
        fetchNews();
    }, [view, techNews.length, currentUser.role]);

    const visibleUsers = useMemo(() => {
        const myTeamIds = teams
            .filter(team => team.members.includes(currentUser.id))
            .map(team => team.id);

        const allowedUserIds = new Set<string>();
        allowedUserIds.add(currentUser.id); 

        teams.forEach(team => {
            if (myTeamIds.includes(team.id)) {
                team.members.forEach(memberId => allowedUserIds.add(memberId));
            }
        });
        
        if (currentUser.role === Role.PATRAO) {
             return allUsers;
        }

        return allUsers.filter(user => allowedUserIds.has(user.id));
    }, [allUsers, teams, currentUser.id, currentUser.role]);


    const handleCreateTask = async (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Date.now(), 
            title: taskData.title || 'Nova Tarefa',
            description: taskData.description || '',
            channel: taskData.channel || '#geral',
            responsible: taskData.responsible || [],
            points: taskData.points || 0,
            deadline: taskData.deadline,
            status: TaskStatus.PENDENTE,
        };
        await addTaskToFirestore(newTask);
    };

    const handleEditTask = async (taskId: number, taskData: Partial<Task>) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.firestoreId) {
            await updateTaskInFirestore(task.firestoreId, taskData);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.firestoreId) {
            await deleteTaskFromFirestore(task.firestoreId);
        }
    };

    const handleCompleteTask = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status === TaskStatus.PENDENTE && task.firestoreId) {
            await updateTaskInFirestore(task.firestoreId, { status: TaskStatus.CONCLUIDA });
            const points = task.points;
            const responsibleNames = task.responsible.map(r => r.replace('@',''));
            const usersToUpdate = allUsers.filter(u => responsibleNames.includes(u.name) && u.role === Role.MEMBRO);
            for (const user of usersToUpdate) {
                await updateUserPoints(user.id, user.points + points);
            }
        }
    };
    
    const handleStateUpdate = (response: GeminiResponse) => {
        switch (response.action) {
            case 'CREATE_TASK':
                if (response.payload.task) handleCreateTask(response.payload.task);
                break;
            case 'EDIT_TASK':
                 if (response.payload.taskId && response.payload.task) {
                     handleEditTask(response.payload.taskId, response.payload.task);
                 }
                 break;
            case 'DELETE_TASK':
                if (response.payload.taskId) handleDeleteTask(response.payload.taskId);
                break;
            case 'COMPLETE_TASK':
                if (response.payload.taskId) handleCompleteTask(response.payload.taskId);
                break;
            default:
                break;
        }
    };

    const handleSendMessage = async () => {
        if (!chatInputText.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: chatInputText,
            sender: MessageSender.USER
        };

        setMessages(prev => [...prev, userMessage]);
        setChatInputText('');
        setIsLoading(true);

        try {
            const state = { users: allUsers, tasks };
            const response = await processCommand(chatInputText, messages, state, currentUser);
            handleStateUpdate(response);
            const aiMessage: Message = {
                id: Date.now() + 1,
                text: response.assistantResponse,
                sender: MessageSender.ASSISTANT
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Desculpe, tive um problema ao processar sua solicitação de IA.",
                sender: MessageSender.ASSISTANT
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    };

    // Navigation Handlers
    const handleToggleAdminView = () => { setView('admin'); setViewingMember(null); setActiveChannelId(null); };
    const handleToggleSocialView = () => { setView('social'); setActiveChannelId(null); };
    const handleToggleTeamsView = () => { setView('teams'); setActiveChannelId(null); };
    const handleTogglePlanningView = () => { setView('planning'); setActiveChannelId(null); };
    const handleToggleAssistantView = () => { setView('assistant'); setViewingMember(null); setActiveChannelId(null); };
    const handleToggleCalendarView = () => { setView('calendar'); setViewingMember(null); setActiveChannelId(null); };

    const handleSelectChannel = (channelId: string) => { setView('channel'); setActiveChannelId(channelId); setViewingMember(null); };
    const handleViewMember = (userId: string) => { const member = allUsers.find(u => u.id === userId); if (member) { setViewingMember(member); setView('admin'); setActiveChannelId(null); } };
    const handleBackToDashboard = () => { setViewingMember(null); };
    
    const handleSendChannelMessage = async (text: string, specificChannelId?: string, attachments?: Attachment[]) => {
        const targetChannelId = specificChannelId || activeChannelId;
        if (!targetChannelId) return;
        const newMessage: ChannelMessage = {
            id: `cm-${Date.now()}`,
            channelId: targetChannelId,
            userId: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
            attachments
        };
        await addMessageToFirestore(newMessage);
    };

    const handleSendDirectMessage = async (text: string, receiverId: string, attachments?: Attachment[]) => {
        const newMessage: SocialMessage = {
            id: `dm-${Date.now()}`,
            senderId: currentUser.id,
            receiverId: receiverId,
            text,
            timestamp: new Date().toISOString(),
            attachments
        };
        await addDirectMessageToFirestore(newMessage);
    };

    const handleLogoClick = () => { window.location.reload(); };
    const adminCreateTask = (task: Partial<Task>) => handleCreateTask(task);
    const adminEditTask = (id: number, task: Partial<Task>) => handleEditTask(id, task);
    const adminDeleteTask = (id: number) => handleDeleteTask(id);

    const renderMainContent = () => {
        if (view === 'calendar') {
            return <CalendarView tasks={tasks} globalReminders={reminders} />;
        }
        if (view === 'planning' && currentUser.role === Role.PATRAO) {
             return <PlanningPanel reminders={reminders} currentUser={currentUser} />;
        }
        if (view === 'teams') {
            return (
                <TeamsPanel 
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allTeams={teams}
                    allChannels={channels}
                    allChannelMessages={channelMessages}
                    onSendChannelMessage={handleSendChannelMessage}
                />
            );
        }
        if (view === 'channel' && activeChannelId) {
            const activeChannel = channels.find(c => c.id === activeChannelId);
            const messages = channelMessages.filter(m => m.channelId === activeChannelId);
            if (activeChannel) {
                return (
                    <ChannelChat 
                        channel={activeChannel}
                        messages={messages}
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onSendMessage={(text, attachments) => handleSendChannelMessage(text, undefined, attachments)}
                    />
                );
            }
        }
        if (view === 'admin' && currentUser.role === Role.PATRAO) {
            return (
                <AdminPanel 
                    tasks={tasks} 
                    users={allUsers}
                    channels={channels}
                    onCreateTask={adminCreateTask}
                    onEditTask={adminEditTask}
                    onDeleteTask={adminDeleteTask}
                    viewingMember={viewingMember}
                    onBackToDashboard={handleBackToDashboard}
                />
            );
        }
        if (view === 'social') {
            // Boss can NO LONGER see feed. Only Direct Messages.
            return (
                <SocialPanel 
                    currentUser={currentUser}
                    allUsers={visibleUsers}
                    posts={posts}
                    techNews={techNews}
                    isLoadingNews={isLoadingNews}
                    teams={teams}
                    showFeed={currentUser.role !== Role.PATRAO} // Only members see the feed/posts
                    directMessages={directMessages}
                    onSendDirectMessage={handleSendDirectMessage}
                    onLogout={onLogout}
                    onCreatePost={async (text) => {
                        const newPost: Post = {
                            id: `p-${Date.now()}`,
                            authorId: currentUser.id,
                            text: text,
                            timestamp: new Date().toISOString()
                        };
                        await addPostToFirestore(newPost);
                    }}
                />
            );
        }
        // Assistant View
        return (
            <div className="flex flex-col h-full relative">
                <ChatWindow messages={messages} isLoading={isLoading} />
                <ChatInput 
                    ref={chatInputRef}
                    value={chatInputText}
                    onChange={setChatInputText}
                    onSubmit={handleSendMessage}
                    isLoading={isLoading}
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B0C15] text-brand-text overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white transition-colors duration-300">
            {/* Header hidden on mobile if needed, or simplified. For now we keep it but it needs to play nice with mobile layout */}
            <div className="hidden md:block relative z-20">
                <Header onLogoClick={handleLogoClick} />
            </div>
            
            {/* Mobile Header (Fixed) - Fixing the scroll bug */}
             <div className="md:hidden h-14 border-b border-white/5 bg-[#0B0C15]/95 backdrop-blur-xl flex items-center justify-center fixed top-0 w-full z-50 shadow-lg">
                <img src="https://i.imgur.com/syClG5w.png" alt="Conecta" className="h-6 opacity-90 drop-shadow-[0_0_8px_rgba(91,197,242,0.5)]" />
                <button 
                    onClick={onLogout} 
                    className="absolute right-4 text-xs text-slate-400 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors z-50 bg-[#0B0C15]"
                >
                    Sair
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative md:pt-0 pt-14"> {/* Added PT-14 for mobile to account for fixed header */}
                {/* Desktop/Tablet Sidebar - Hidden on Mobile */}
                <div className="hidden md:flex relative z-30">
                    <Sidebar 
                        channels={channels}
                        users={visibleUsers}
                        tasks={tasks}
                        currentUser={currentUser}
                        view={view}
                        activeChannelId={activeChannelId}
                        onLogout={onLogout}
                        onInitiateEdit={(taskId) => {
                            if (currentUser.role === Role.PATRAO) {
                                setView('admin');
                            }
                        }}
                        onToggleAdminView={handleToggleAdminView}
                        onToggleSocialView={handleToggleSocialView}
                        onToggleAssistantView={handleToggleAssistantView}
                        onToggleCalendarView={handleToggleCalendarView}
                        onToggleTeamsView={handleToggleTeamsView}
                        onTogglePlanningView={handleTogglePlanningView}
                        onSelectChannel={handleSelectChannel}
                        onViewMember={handleViewMember}
                    />
                </div>

                <main className="flex-1 flex flex-col min-w-0 bg-[#0B0C15] relative transition-colors duration-300 pb-16 md:pb-0">
                     {/* Background Ambient Effect - Beautiful Glows */}
                     <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}}></div>
                         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '12s'}}></div>
                         <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px] animate-pulse" style={{animationDuration: '10s'}}></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full bg-[#0B0C15]/30 backdrop-blur-sm">
                        {renderMainContent()}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav view={view} currentUser={currentUser} onToggleView={setView} />
        </div>
    );
};
