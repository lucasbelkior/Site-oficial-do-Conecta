
import { db } from './services/firebase';
import { 
    collection, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    doc, 
    deleteDoc, 
    query, 
    orderBy,
    getDocs,
    setDoc,
    where
} from 'firebase/firestore';
import { User, Task, Channel, Role, TaskStatus, ChannelMessage, Team, GlobalReminder, SocialMessage } from './types';

// --- Helper to clean undefined values ---
const cleanData = (data: any) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {} as any);
};

// --- Default Data for Seeding (Used only if DB is empty) ---
export const defaultUsers: User[] = [
    { 
        id: 'u1', 
        name: 'Katarina', // Alterado de Ana para Katarina
        email: 'katarina@conecta.com', 
        role: Role.PATRAO, 
        points: 0,
        jobTitle: 'CEO & Founder',
        bio: 'Visionária e líder. Transformando a comunicação corporativa.',
        location: 'São Paulo, SP',
        followers: 1500,
        following: 200,
        avatarUrl: '',
        coverUrl: '' 
    },
    { 
        id: 'u2', 
        name: 'Carlos', 
        email: 'carlos@conecta.com', 
        role: Role.MEMBRO, 
        points: 80,
        jobTitle: 'Desenvolvedor Senior',
        bio: 'Fullstack Developer | React & Node.js enthusiast. Sempre buscando código limpo.',
        location: 'Remoto',
        followers: 450,
        following: 120,
        avatarUrl: '',
        coverUrl: '' 
    },
    { 
        id: 'u3', 
        name: 'Luana', 
        email: 'luana@conecta.com', 
        role: Role.MEMBRO, 
        points: 120,
        jobTitle: 'UX/UI Designer',
        bio: 'Criando experiências digitais incríveis. Foco em acessibilidade e design system.',
        location: 'Rio de Janeiro, RJ',
        followers: 890,
        following: 400,
        avatarUrl: '',
        coverUrl: '' 
    },
    { 
        id: 'u4', 
        name: 'Mari', 
        email: 'mari@conecta.com', 
        role: Role.MEMBRO, 
        points: 50,
        jobTitle: 'Gerente de Marketing',
        bio: 'Growth Hacking e Estratégias Digitais. Data-driven marketing.',
        location: 'Curitiba, PR',
        followers: 600,
        following: 500,
        avatarUrl: '',
        coverUrl: '' 
    },
];

const defaultChannels: Channel[] = [
    { id: 'c1', name: '#geral' },
    { id: 'c2', name: '#projetos' },
    { id: 'c3', name: '#marketing' },
];

const defaultTasks: Task[] = [
    { id: 1, title: 'Revisar design do novo app', description: 'Revisar o protótipo no Figma e dar feedback', channel: '#projetos', responsible: ['@Luana'], points: 30, deadline: '25/12/2024', status: TaskStatus.PENDENTE },
    { id: 2, title: 'Preparar relatório de vendas Q4', description: 'Compilar todos os dados de vendas do último trimestre', channel: '#geral', responsible: ['@Carlos'], points: 50, deadline: '28/12/2024', status: TaskStatus.PENDENTE },
];

// --- Database Operations ---

// Seed Database if empty
export const seedDatabase = async () => {
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
        console.log("Seeding Database...");
        // Add Users (Note: In a real app, users are created via Auth, but we can seed the 'users' collection for display)
        for (const user of defaultUsers) {
            await setDoc(doc(db, 'users', user.id), user);
        }
        // Add Channels
        for (const channel of defaultChannels) {
            await setDoc(doc(db, 'channels', channel.id), channel);
        }
        // Add Tasks
        for (const task of defaultTasks) {
            // Firestore creates auto-ids usually, but we can use numeric IDs if we convert to string or let firestore handle it
            // For simplicity in migration, we let firestore generate ID and store the numeric 'id' inside the object if needed, 
            // or we just rely on firestore IDs. For this app's existing logic, let's store them.
            await addDoc(collection(db, 'tasks'), task);
        }
    }
};

// --- Real-time Subscriptions ---

export const subscribeToUsers = (callback: (users: User[]) => void) => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        callback(users);
    });
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
    const q = query(collection(db, 'tasks')); // Add orderBy if needed
    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => {
             const data = doc.data();
             // Ensure ID is maintained or map firestore ID to object
             return { ...data, firestoreId: doc.id } as Task; 
        });
        callback(tasks);
    });
};

export const subscribeToChannels = (callback: (channels: Channel[]) => void) => {
    const q = query(collection(db, 'channels'));
    return onSnapshot(q, (snapshot) => {
        const channels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel));
        callback(channels);
    });
};

export const subscribeToTeams = (callback: (teams: Team[]) => void) => {
    const q = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        callback(teams);
    });
};

export const subscribeToChannelMessages = (callback: (messages: ChannelMessage[]) => void) => {
    const q = query(collection(db, 'channel_messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChannelMessage));
        callback(messages);
    });
};

export const subscribeToReminders = (callback: (reminders: GlobalReminder[]) => void) => {
    const q = query(collection(db, 'global_reminders'));
    return onSnapshot(q, (snapshot) => {
        const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GlobalReminder));
        callback(reminders);
    });
};

export const subscribeToDirectMessages = (callback: (messages: SocialMessage[]) => void) => {
    const q = query(collection(db, 'direct_messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialMessage));
        callback(messages);
    });
};

// --- Write Operations ---

export const addTaskToFirestore = async (task: Task) => {
    // Remove the 'id' if you want Firestore to generate it, or keep it for legacy compatibility
    const { id, ...taskData } = task; 
    // We store the numeric ID for compatibility with existing components
    // Clean data to remove undefined values
    await addDoc(collection(db, 'tasks'), { ...cleanData(taskData), id: Date.now() }); 
};

export const updateTaskInFirestore = async (firestoreId: string, data: Partial<Task>) => {
    const taskRef = doc(db, 'tasks', firestoreId);
    await updateDoc(taskRef, cleanData(data));
};

export const deleteTaskFromFirestore = async (firestoreId: string) => {
    const taskRef = doc(db, 'tasks', firestoreId);
    await deleteDoc(taskRef);
};

export const addMessageToFirestore = async (message: ChannelMessage) => {
    await addDoc(collection(db, 'channel_messages'), cleanData(message));
};

export const addDirectMessageToFirestore = async (message: SocialMessage) => {
    await addDoc(collection(db, 'direct_messages'), cleanData(message));
};

export const updateUserPoints = async (userId: string, newPoints: number) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { points: newPoints });
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, cleanData(data));
};

export const updateUserRole = async (userId: string, newRole: Role) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
};

export const addTeamToFirestore = async (team: Omit<Team, 'id'>) => {
    await addDoc(collection(db, 'teams'), cleanData(team));
};

export const addChannelToFirestore = async (channel: Omit<Channel, 'id'>) => {
    await addDoc(collection(db, 'channels'), cleanData(channel));
};

export const joinTeamInFirestore = async (teamId: string, userId: string, currentMembers: string[]) => {
    if (!currentMembers.includes(userId)) {
        const teamRef = doc(db, 'teams', teamId);
        await updateDoc(teamRef, { members: [...currentMembers, userId] });
    }
};

export const addReminderToFirestore = async (reminder: Omit<GlobalReminder, 'id'>) => {
    await addDoc(collection(db, 'global_reminders'), cleanData(reminder));
};

export const deleteReminderFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, 'global_reminders', id));
};

// Exports for compatibility
export const initialUsers = defaultUsers; 
export const initialChannels = defaultChannels;
export const initialTasks = defaultTasks;
export const initialChannelMessages: ChannelMessage[] = [];
