
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
import { User, Task, Channel, Role, TaskStatus, ChannelMessage, Team } from './types';

// --- Default Data for Seeding (Used only if DB is empty) ---
export const defaultUsers: User[] = [
    { 
        id: 'u1', 
        name: 'Ana', 
        email: 'ana@conecta.com', 
        role: Role.PATRAO, 
        points: 0,
        jobTitle: 'CEO & Founder',
        bio: 'Liderando a inovação na Conecta. Apaixonada por tecnologia e gestão de pessoas.',
        location: 'São Paulo, SP',
        followers: 1250,
        following: 300,
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

// --- Write Operations ---

export const addTaskToFirestore = async (task: Task) => {
    // Remove the 'id' if you want Firestore to generate it, or keep it for legacy compatibility
    const { id, ...taskData } = task; 
    // We store the numeric ID for compatibility with existing components
    await addDoc(collection(db, 'tasks'), { ...taskData, id: Date.now() }); 
};

export const updateTaskInFirestore = async (firestoreId: string, data: Partial<Task>) => {
    const taskRef = doc(db, 'tasks', firestoreId);
    await updateDoc(taskRef, data);
};

export const deleteTaskFromFirestore = async (firestoreId: string) => {
    const taskRef = doc(db, 'tasks', firestoreId);
    await deleteDoc(taskRef);
};

export const addMessageToFirestore = async (message: ChannelMessage) => {
    await addDoc(collection(db, 'channel_messages'), message);
};

export const updateUserPoints = async (userId: string, newPoints: number) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { points: newPoints });
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
};

export const updateUserRole = async (userId: string, newRole: Role) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
};

export const addTeamToFirestore = async (team: Omit<Team, 'id'>) => {
    await addDoc(collection(db, 'teams'), team);
};

export const addChannelToFirestore = async (channel: Omit<Channel, 'id'>) => {
    await addDoc(collection(db, 'channels'), channel);
};

export const joinTeamInFirestore = async (teamId: string, userId: string, currentMembers: string[]) => {
    if (!currentMembers.includes(userId)) {
        const teamRef = doc(db, 'teams', teamId);
        await updateDoc(teamRef, { members: [...currentMembers, userId] });
    }
};

// Exports for compatibility with existing imports (though they will be replaced by real data flow)
export const initialUsers = defaultUsers; 
export const initialChannels = defaultChannels;
export const initialTasks = defaultTasks;
export const initialChannelMessages: ChannelMessage[] = [];
