
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import type { User } from '../types';

interface LoginScreenProps {
    users: User[];
    onLogin: (user: User) => void;
    onNavigateRegister?: () => void;
    onNavigateSplash?: () => void;
    onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onNavigateRegister, onNavigateSplash, onShowToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onShowToast("Login realizado com sucesso!", "success");
            // App.tsx handles the state change via onAuthStateChanged
        } catch (error: any) {
            console.error("Login Error:", error);
            let errorMessage = "Ocorreu um erro ao entrar.";
            
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = "E-mail ou senha incorretos.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Muitas tentativas falhas. Tente novamente mais tarde.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Formato de e-mail inválido.";
            }

            onShowToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // User's CSS injected directly
    const styles = `
    .login-page-body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        position: relative;
        overflow: hidden;
        font-family: "Oddval", sans-serif;
        color: #1371e2;
        background-color: #0B0C15;
    }
    #background-video {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -2;
    }
    .video-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
    }
    .container-login {
        width: 100%;
        max-width: 450px;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        color: #1371e2;
        padding: 30px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
        min-height: 550px;
        position: relative;
        z-index: 1;
        backdrop-filter: blur(5px);
    }
    @media (min-width: 640px) {
        .container-login {
            padding: 40px;
        }
    }
    .container-login:hover {
        transform: translateY(-5px);
    }
    .container-login h1 {
        font-size: 28px;
        text-align: center;
        margin-bottom: 40px;
        position: relative;
        font-weight: 600;
        color: #1371e2;
    }
    .container-login h1:after {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 70px;
        height: 4px;
        background: #1371e2;
        border-radius: 2px;
    }
    .input-box {
        position: relative;
        width: 100%;
        height: 55px;
        margin: 25px 0;
    }
    .input-box label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #1371e2;
    }
    .input-box input {
        width: 100%;
        height: 100%;
        background-color: transparent;
        border: 2px solid #e0e0e0;
        border-radius: 50px;
        outline: none;
        font-size: 16px;
        color: #1371e2;
        padding: 20px 50px 20px 20px;
        transition: all 0.3s ease;
        font-weight: 600;
    }
    .input-box input:focus {
        border-color: #1371e2;
        box-shadow: 0 0 12px rgba(19, 113, 226, 0.3);
    }
    .input-box i {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(10%);
        font-size: 20px;
        color: #1371e2;
        opacity: 0.7;
    }
    .toggle-password {
        position: absolute;
        right: 35px;
        top: 50%;
        transform: translateY(-20%);
        background: none;
        border: none;
        cursor: pointer;
        color: #1371e2;
        font-size: 18px;
        opacity: 0.6;
        transition: opacity 0.3s ease;
    }
    .toggle-password:hover { opacity: 1; }
    .remember-forgot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 30px 0;
        flex-wrap: wrap;
    }
    .remember-forgot label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;
        color: #1371e2;
        font-weight: 600;
    }
    .remember-forgot a {
        text-decoration: none;
        color: #1371e2;
        font-weight: 600;
        transition: color 0.3s ease;
    }
    .remember-forgot a:hover {
        color: #0f5bb5;
        text-decoration: underline;
    }
    .login-btn-custom {
        width: 100%;
        height: 55px;
        background-color: #1371e2;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        font-size: 16px;
        color: #fff;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(19, 113, 226, 0.3);
        margin-top: 15px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    .login-btn-custom:hover {
        background-color: #0f5bb5;
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(19, 113, 226, 0.4);
    }
    .login-btn-custom:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    .register-link {
        font-size: 14px;
        text-align: center;
        margin: 30px 0 15px;
        color: #1371e2;
    }
    .register-link a {
        text-decoration: none;
        color: #1371e2;
        font-weight: 600;
        transition: color 0.3s ease;
    }
    .register-link a:hover {
        color: #0f5bb5;
        text-decoration: underline;
    }
    `;

    return (
        <div className="login-page-body">
            <style>{styles}</style>
            
            <video autoPlay muted loop id="background-video">
                <source src="https://cdn.pixabay.com/video/2019/05/16/23645-336369040_large.mp4" type="video/mp4" />
            </video>
            
            <div className="video-overlay"></div>

            <main className="container-login">
                <div className="text-center mb-5">
                    <div 
                        style={{ width: '280px', maxWidth: '100%', margin: '0 auto', cursor: 'pointer' }}
                        onClick={onNavigateSplash}
                        title="Voltar para a Intro"
                    >
                         {/* BLUE/BLACK LOGO FOR WHITE BOX */}
                         <img 
                            src="https://i.imgur.com/syClG5w.png" 
                            alt="Conecta Logo" 
                            className="w-full h-auto hover:scale-105 transition-transform duration-300" 
                         />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>

                    <div className="input-box">
                        <label htmlFor="email">E-mail</label>
                        <input 
                            id="email" 
                            type="email" 
                            placeholder="Seu e-mail" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <i className="bx bxs-user"></i>
                    </div>

                    <div className="input-box">
                        <label htmlFor="senha">Senha</label>
                        <input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Sua senha" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i className="bx bxs-lock-alt"></i>
                        <button 
                            type="button" 
                            className="toggle-password" 
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}></i>
                        </button>
                    </div>

                    <div className="remember-forgot">
                        <label>
                            <input type="checkbox" name="remember" className="mr-2" />
                            Lembrar-me
                        </label>
                        <a href="#">Esqueci minha senha</a>
                    </div>

                    <button type="submit" className="login-btn-custom" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                    
                    <div className="register-link">
                        <p>Não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); onNavigateRegister && onNavigateRegister(); }}>Cadastre-se agora</a></p>
                    </div>
                </form>
            </main>
        </div>
    );
};
