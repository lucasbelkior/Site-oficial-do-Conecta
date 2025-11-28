
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { SplashPage, ExplorePage, RegisterPage } from './components/ExternalPages';
import { seedDatabase, subscribeToUsers, updateUserRole } from './database';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { ThemeProvider } from './components/ThemeContext';
import type { User } from './types';
import { Role } from './types';

type Page = 'splash' | 'explore' | 'login' | 'register' | 'app';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('splash');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    
    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch extra user details from Firestore (Role, Points)
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    
                    if (userSnap.exists()) {
                        setCurrentUser(userSnap.data() as User);
                    } else {
                        // Fallback if user exists in Auth but not Firestore
                        const tempUser: User = {
                             id: user.uid,
                             name: user.displayName || 'Usuário',
                             email: user.email || '',
                             role: 'Membro' as any,
                             points: 0
                        };
                        setCurrentUser(tempUser);
                    }
                    
                    setCurrentPage(prev => {
                        if (['splash', 'login', 'register'].includes(prev)) {
                            return 'app';
                        }
                        return prev;
                    });

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    addToast("Erro ao carregar dados do usuário.", "error");
                    await signOut(auth);
                    setCurrentUser(null);
                    setCurrentPage('login');
                }
            } else {
                setCurrentUser(null);
                setUsers([]);
                setCurrentPage(prev => (prev === 'app' ? 'login' : prev));
            }
            setIsLoadingUser(false);
        });

        return () => unsubscribe();
    }, []);

    // Data Sync
    useEffect(() => {
        let unsubscribeUsers: (() => void) | undefined;

        if (currentUser) {
            seedDatabase().catch(err => console.error("Database seeding check failed:", err));
            unsubscribeUsers = subscribeToUsers((fetchedUsers) => {
                setUsers(fetchedUsers);
            });
            
            // --- BACKDOOR PARA DESENVOLVEDOR ---
            // Expõe a função promoteMe() no console do navegador
            (window as any).promoteMe = async () => {
                console.log("🚀 Iniciando promoção para Patrão...");
                try {
                    await updateUserRole(currentUser.id, Role.PATRAO);
                    console.log("👑 SUCESSO! Cargo atualizado no banco de dados.");
                    console.log("🔄 Recarregando a página para aplicar...");
                    window.location.reload();
                } catch (e) {
                    console.error("Erro ao promover:", e);
                }
            };
            console.log("🔧 DEV MODE: Digite promoteMe() no console para virar Patrão.");
        }

        return () => {
            if (unsubscribeUsers) unsubscribeUsers();
            delete (window as any).promoteMe;
        };
    }, [currentUser]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setCurrentPage('app');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setCurrentPage('login');
            addToast("Você saiu do sistema.", "info");
        } catch (error) {
            console.error("Logout error:", error);
            addToast("Erro ao sair.", "error");
        }
    };

    const navigate = (page: string) => {
        if (['splash', 'explore', 'login', 'register', 'app'].includes(page)) {
            setCurrentPage(page as Page);
        }
    };

    if (isLoadingUser) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-brand-dark transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-cyan-500 font-oddval animate-pulse">Carregando Conecta...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            
            {(() => {
                switch (currentPage) {
                    case 'splash':
                        return <SplashPage onNavigate={navigate} />;
                    case 'explore':
                        return <ExplorePage onNavigate={navigate} />;
                    case 'register':
                        return <RegisterPage onNavigate={navigate} onShowToast={addToast} />;
                    case 'login':
                        return (
                            <LoginScreen 
                                users={users} 
                                onLogin={handleLogin} 
                                onNavigateRegister={() => navigate('register')} 
                                onNavigateSplash={() => navigate('splash')}
                                onShowToast={addToast}
                            />
                        );
                    case 'app':
                        if (!currentUser) {
                            return (
                                <LoginScreen 
                                    users={users} 
                                    onLogin={handleLogin} 
                                    onNavigateRegister={() => navigate('register')} 
                                    onShowToast={addToast}
                                />
                            );
                        }
                        return (
                            <MainLayout 
                                currentUser={currentUser} 
                                onLogout={handleLogout} 
                                allUsers={users} 
                                allChannels={[]} 
                            />
                        );
                    default:
                        return <SplashPage onNavigate={navigate} />;
                }
            })()}
        </ThemeProvider>
    );
};

export default App;
