
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { AdminPanel } from './AdminPanel';
import { SocialPanel } from './SocialPanel';
import { TeamsPanel } from './TeamsPanel';
import { PlanningPanel } from './PlanningPanel'; // New component
import { CalendarView } from './CalendarView';
import { ChannelChat } from './ChannelChat';
import { processCommand, getTechNews } from '../services/geminiService';
import type { User, Task, Channel, Message, GeminiResponse, Post, TechNewsItem, ChannelMessage, Team, Attachment, GlobalReminder } from '../types';
import { TaskStatus, MessageSender, Role } from '../types';
import { 
    subscribeToTasks, 
    subscribeToChannels, 
    subscribeToChannelMessages,
    subscribeToTeams, 
    subscribeToReminders, // New subscription
    addTaskToFirestore, 
    updateTaskInFirestore, 
    deleteTaskFromFirestore,
    addMessageToFirestore,
    updateUserPoints
} from '../database';
import { initialPosts } from '../socialDatabase';

interface MainLayoutProps {
    currentUser: User;
    onLogout: () => void;
    allUsers: User[];
    allChannels: Channel[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, onLogout, allUsers }) => {
    // We use allUsers passed from App.tsx which is live-synced
    const [tasks, setTasks] = useState<Task[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [reminders, setReminders] = useState<GlobalReminder[]>([]); // New state

    const [messages, setMessages] = useState<Message[]>([
      { id: 1, text: `Olá ${currentUser.name}! Sou o assistente da Conecta. Como posso ajudar a equipe hoje?`, sender: MessageSender.ASSISTANT}
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatInputText, setChatInputText] = useState('');
    
    // Updated view state to include calendar, channel, teams, and planning
    const [view, setView] = useState<'assistant' | 'admin' | 'social' | 'calendar' | 'channel' | 'teams' | 'planning'>('assistant');
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [viewingMember, setViewingMember] = useState<User | null>(null);
    
    // Social State
    const [posts, setPosts] = useState<Post[]>(initialPosts);
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

        return () => {
            unsubTasks();
            unsubChannels();
            unsubMessages();
            unsubTeams();
            unsubReminders();
        };
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            // Only fetch news if view is social AND user is not BOSS (since boss has no news feed)
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

    // --- Visibility Logic (Shared Teams) ---
    const visibleUsers = useMemo(() => {
        // 1. Find IDs of teams the current user belongs to
        const myTeamIds = teams
            .filter(team => team.members.includes(currentUser.id))
            .map(team => team.id);

        // 2. Collect all user IDs that are in those teams
        const allowedUserIds = new Set<string>();
        allowedUserIds.add(currentUser.id); // User always sees themselves

        teams.forEach(team => {
            if (myTeamIds.includes(team.id)) {
                team.members.forEach(memberId => allowedUserIds.add(memberId));
            }
        });
        
        // BOSS Override: Boss can see everyone if not explicitly in teams, but sticking to team logic is safer.
        // If we want Boss to see everyone regardless:
        if (currentUser.role === Role.PATRAO) {
             return allUsers;
        }

        // 3. Filter the main user list
        return allUsers.filter(user => allowedUserIds.has(user.id));
    }, [allUsers, teams, currentUser.id, currentUser.role]);


    // --- Task Handlers (Persisted) ---

    const handleCreateTask = async (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Date.now(), // Local numeric ID for legacy logic
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
        // Find the task to get its firestore ID
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
            // Update Task Status
            await updateTaskInFirestore(task.firestoreId, { status: TaskStatus.CONCLUIDA });
            
            // Award Points
            const points = task.points;
            const responsibleNames = task.responsible.map(r => r.replace('@',''));
            
            // Find users to update
            const usersToUpdate = allUsers.filter(u => responsibleNames.includes(u.name) && u.role === Role.MEMBRO);
            
            // Update points for each user in Firestore
            for (const user of usersToUpdate) {
                await updateUserPoints(user.id, user.points + points);
            }
        }
    };
    
    // --- AI Integration ---
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
    const handleToggleAdminView = () => {
        setView(prev => prev === 'admin' ? 'assistant' : 'admin');
        setViewingMember(null);
        setActiveChannelId(null);
    };

    const handleToggleSocialView = () => {
        setView(prev => prev === 'social' ? 'assistant' : 'social');
        setActiveChannelId(null);
    };

    const handleToggleTeamsView = () => {
        setView(prev => prev === 'teams' ? 'assistant' : 'teams');
        setActiveChannelId(null);
    };
    
    const handleTogglePlanningView = () => {
         setView(prev => prev === 'planning' ? 'assistant' : 'planning');
         setActiveChannelId(null);
    };
    
    const handleToggleAssistantView = () => {
        setView('assistant');
        setViewingMember(null);
        setActiveChannelId(null);
    };

    const handleToggleCalendarView = () => {
        setView('calendar');
        setViewingMember(null);
        setActiveChannelId(null);
    };

    const handleSelectChannel = (channelId: string) => {
        setView('channel');
        setActiveChannelId(channelId);
        setViewingMember(null);
    };

    const handleViewMember = (userId: string) => {
        const member = allUsers.find(u => u.id === userId);
        if (member) {
            setViewingMember(member);
            setView('admin');
            setActiveChannelId(null);
        }
    };

    const handleBackToDashboard = () => {
        setViewingMember(null);
    };
    
    const handleSendChannelMessage = async (text: string, specificChannelId?: string, attachments?: Attachment[]) => {
        const targetChannelId = specificChannelId || activeChannelId;
        if (!targetChannelId) return;
        const newMessage: ChannelMessage = {
            id: `cm-${Date.now()}`,
            channelId: targetChannelId,
            userId: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
            attachments // Pass attachments
        };
        await addMessageToFirestore(newMessage);
    };

    // Reload page to return to vinheta/intro
    const handleLogoClick = () => {
        window.location.reload();
    };

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
                    users={allUsers} // Admin must see everyone
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
            // Boss sees simplified chat (no feed), Members see full social
            const isBoss = currentUser.role === Role.PATRAO;
            return (
                <SocialPanel 
                    currentUser={currentUser}
                    allUsers={visibleUsers} // Social feed restricted to team members
                    posts={posts}
                    techNews={techNews}
                    isLoadingNews={isLoadingNews}
                    teams={teams} // Pass teams for filtering contacts
                    showFeed={!isBoss} // HIDE feed for Boss
                    onCreatePost={(text) => {
                        const newPost: Post = {
                            id: `p-${Date.now()}`,
                            authorId: currentUser.id,
                            text: text,
                            timestamp: new Date().toISOString()
                        };
                        setPosts(prev => [newPost, ...prev]);
                    }}
                />
            );
        }

        // Default: Assistant Chat
        return (
            <>
                <ChatWindow messages={messages} isLoading={isLoading} />
                <ChatInput 
                    ref={chatInputRef}
                    value={chatInputText}
                    onChange={setChatInputText}
                    onSubmit={handleSendMessage}
                    isLoading={isLoading}
                />
            </>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-brand-dark text-brand-text overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white transition-colors duration-300">
            <Header onLogoClick={handleLogoClick} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    channels={channels}
                    users={visibleUsers} // Sidebar list restricted to team members
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
                
                <main className="flex-1 flex flex-col min-w-0 bg-brand-dark relative transition-colors duration-300">
                     <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]"></div>
                         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        {renderMainContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};
