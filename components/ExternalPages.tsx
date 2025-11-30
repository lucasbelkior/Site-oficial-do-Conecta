
import React, { useEffect, useState, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { Role } from "../types";

// --- STYLES INJECTION ---
const COMMON_STYLES = `
  .external-page * {
      box-sizing: border-box;
      font-family: "Oddval", sans-serif;
  }
  .external-page {
     font-family: "Oddval", sans-serif;
     width: 100vw;
     height: 100vh;
     overflow-y: auto;
     overflow-x: hidden;
     position: relative;
     background-color: #0B0C15;
  }
`;

interface PageProps {
    onNavigate: (page: string) => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ==========================================
// SPLASH PAGE (Intro)
// ==========================================
export const SplashPage: React.FC<PageProps> = ({ onNavigate }) => {
    // Start with Intro NOT finished, but content visible behind it
    const [introFinished, setIntroFinished] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const finishIntro = () => {
        setIntroFinished(true);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            finishIntro();
        }, 3500); // Segurança máxima: em 3.5s o intro some de qualquer jeito

        // Tenta dar play
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                // Se falhar autoplay, finaliza imediatamente para não travar
                finishIntro();
            });
        }

        return () => clearTimeout(timer);
    }, []);

    const styles = `
    #fundo-animado {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      z-index: 0;
      overflow: hidden;
    }
    #fundo-animado video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.4;
    }
    /* Vinheta is now an overlay that disappears */
    #vinheta-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999; /* Fica acima de tudo */
      transition: opacity 0.8s ease, visibility 0.8s;
      opacity: 1;
      visibility: visible;
    }
    #vinheta-overlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .splash-content {
      position: relative;
      z-index: 50; /* Conteúdo sempre lá, apenas abaixo da vinheta */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      opacity: 0; 
      animation: fadeInContent 1s forwards;
      animation-delay: 0.5s; /* Pequeno delay para suavizar */
    }
    @keyframes fadeInContent {
        to { opacity: 1; }
    }
    .logo-img {
        max-width: 100%;
        height: auto;
        display: block;
        transition: transform 0.3s ease;
    }
    .logo-container {
        cursor: pointer;
    }
    .logo-container:hover .logo-img {
        transform: scale(1.05);
    }
    .btn-splash {
      margin-top: 25px;
      padding: 12px 30px;
      background-color: #1371e2;
      color: white;
      border: none;
      border-radius: 30px;
      font-size: 1.1em;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 0 15px rgba(19, 113, 226, 0.4);
    }
    .btn-splash:hover {
      background-color: #0e5dbb;
      box-shadow: 0 0 25px rgba(19, 113, 226, 0.8);
      transform: translateY(-2px);
    }
    .skip-btn {
        position: absolute;
        bottom: 40px;
        right: 30px;
        z-index: 1000;
        color: white;
        background: rgba(255,255,255,0.1);
        padding: 10px 24px;
        border-radius: 30px;
        font-size: 0.9rem;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(5px);
        transition: all 0.2s;
    }
    .skip-btn:hover {
        background: rgba(255,255,255,0.25);
    }
    `;

    return (
        <div className="external-page">
            <style>{COMMON_STYLES}{styles}</style>
            
            {/* Background Loop (Always Playing) */}
            <div id="fundo-animado">
                <video 
                    src="https://cdn.pixabay.com/video/2019/05/16/23645-336369040_large.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                />
            </div>

            {/* Intro Video Layer (Overlay that fades out) */}
            <div 
                id="vinheta-overlay" 
                className={introFinished ? 'hidden' : ''} 
                onClick={finishIntro}
            >
                <video 
                    ref={videoRef}
                    src="https://i.imgur.com/Nig6dt1.mp4" 
                    muted 
                    playsInline
                    onEnded={finishIntro}
                    onError={(e) => {
                        console.warn("Video intro failed to load", e);
                        finishIntro();
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button className="skip-btn" onClick={(e) => {
                    e.stopPropagation();
                    finishIntro();
                }}>
                    Pular Intro
                </button>
            </div>

            {/* Main Content Layer (Always rendered, just underneath) */}
            <div className="splash-content">
                <header className="mb-8">
                    <div 
                        className="logo-container" 
                        style={{ width: '380px' }} 
                        onClick={() => { window.location.reload(); }}
                        title="Reload"
                    >
                         <img 
                            src="https://i.imgur.com/syClG5w.png" 
                            alt="Conecta Logo" 
                            className="logo-img"
                            style={{ filter: 'drop-shadow(0 0 15px rgba(91,197,242,0.4))' }} 
                        />
                    </div>
                </header>

                <main className="flex flex-col items-center text-center px-4">
                    <h1 style={{ fontSize: '2.5em', fontWeight: '700', color: 'white', marginBottom: '10px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        Bem-vindo ao Conecta.ai
                    </h1>
                    <p style={{ fontSize: '1.2em', color: '#90bbf9', maxWidth: '600px' }}>
                        A plataforma definitiva para colaboração de equipes e gestão inteligente.
                    </p>
                    <button onClick={() => onNavigate('explore')} className="btn-splash">
                        Começar Agora
                    </button>
                </main>
            </div>
        </div>
    );
};

// ==========================================
// EXPLORE PAGE
// ==========================================
export const ExplorePage: React.FC<PageProps> = ({ onNavigate }) => {
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('ativo');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.recurso').forEach(el => observer.observe(el));
        
        const timer = setTimeout(() => {
             document.querySelector('.explore-page')?.classList.add('fade-in');
        }, 50);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    const styles = `
    .explore-page {
        color: white;
        opacity: 0;
        transition: opacity 1.2s ease;
        overflow-x: hidden;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .explore-page.fade-in {
        opacity: 1;
    }
    #background-video {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(11, 12, 21, 0.7), rgba(11, 12, 21, 0.95));
      z-index: -1;
    }
    .explore-header {
      width: 100%;
      padding: 20px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      position: relative;
      z-index: 10;
    }
    .btn-login {
      padding: 10px 25px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      border-radius: 50px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: 0.3s;
      text-decoration: none;
      backdrop-filter: blur(10px);
      font-weight: 600;
    }
    .btn-login:hover {
      background: white;
      color: #0B0C15;
    }
    .hero-section {
        text-align: center;
        padding: 60px 20px 40px;
        position: relative;
        z-index: 1;
    }
    .titulo {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -1px;
      text-shadow: 0 10px 30px rgba(0,0,0,0.5);
      margin-bottom: 15px;
      line-height: 1.1;
    }
    .titulo span {
        background: linear-gradient(135deg, #3dcaff 0%, #1371e2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .sub {
      font-size: 1.2rem;
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .recursos-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      padding: 20px 60px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
      width: 100%;
    }
    .recurso {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
      padding: 30px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.4s ease;
      opacity: 0;
      transform: translateY(30px);
      position: relative;
      overflow: hidden;
    }
    .recurso::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at top right, rgba(61, 202, 255, 0.1), transparent 60%);
        opacity: 0;
        transition: opacity 0.4s;
    }
    .recurso.ativo {
      opacity: 1;
      transform: translateY(0);
    }
    .recurso:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-5px);
      border-color: rgba(91, 197, 242, 0.3);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .recurso:hover::before {
        opacity: 1;
    }
    .recurso-icone {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, rgba(61, 202, 255, 0.2), rgba(19, 113, 226, 0.2));
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #3dcaff;
      border: 1px solid rgba(61, 202, 255, 0.3);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    .recurso h3 { 
        font-size: 1.4rem; 
        margin-bottom: 10px; 
        color: white; 
        font-weight: 700;
    }
    .recurso p { 
        font-size: 0.95rem; 
        color: #94a3b8; 
        line-height: 1.6; 
        margin: 0; 
    }
    .destaque {
      text-align: center;
      padding: 80px 20px;
      position: relative;
      z-index: 1;
      background: linear-gradient(to top, #0B0C15, transparent);
      margin-top: auto;
    }
    .destaque h2 { font-size: 2rem; margin-bottom: 15px; font-weight: 700; }
    .destaque p { font-size: 1.1rem; max-width: 600px; margin: 0 auto 30px; color: #94a3b8; }
    .btn-destaque {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 16px 40px;
      background: linear-gradient(90deg, #1371e2, #3dcaff);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: 0.3s;
      text-decoration: none;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(19, 113, 226, 0.4);
    }
    .btn-destaque:hover {
        transform: scale(1.05);
        box-shadow: 0 15px 40px rgba(19, 113, 226, 0.6);
    }

    /* MOBILE SPECIFIC STYLES */
    @media (max-width: 768px) {
      .explore-header {
        padding: 15px 20px;
      }
      .logo-img-header {
        height: 24px;
      }
      .hero-section {
        padding: 40px 20px 20px;
        text-align: left;
      }
      .titulo {
        font-size: 2.5rem;
        text-align: left;
      }
      .sub {
        text-align: left;
        font-size: 1rem;
      }
      .recursos-container {
        grid-template-columns: 1fr; /* Single column */
        padding: 20px;
        gap: 15px;
      }
      .recurso {
        flex-direction: row; /* Icon left, text right */
        align-items: center;
        padding: 20px;
        text-align: left;
        gap: 20px;
      }
      .recurso-icone {
        width: 50px;
        height: 50px;
        font-size: 1.4rem;
        flex-shrink: 0;
      }
      .recurso-conteudo h3 {
        font-size: 1.1rem;
        margin-bottom: 4px;
      }
      .recurso-conteudo p {
        font-size: 0.85rem;
        line-height: 1.4;
      }
      .destaque {
        padding: 60px 20px 100px; /* More bottom padding for scroll */
      }
      .destaque h2 {
        font-size: 1.8rem;
      }
      .btn-destaque {
        width: 100%;
      }
    }
    `;

    return (
        <div className="external-page explore-page">
             <style>{COMMON_STYLES}{styles}</style>
             
             {/* Background Video */}
             <video autoPlay muted loop id="background-video">
                <source src="https://cdn.pixabay.com/video/2019/05/16/23645-336369040_large.mp4" type="video/mp4" />
             </video>
             <div className="overlay"></div>

             <header className="explore-header">
                <div style={{ width: '140px' }} onClick={() => onNavigate('splash')}>
                    <img src="https://i.imgur.com/d0MPLlg.png" alt="Conecta Logo" className="w-full h-auto logo-img-header" />
                </div>
                <button onClick={() => onNavigate('login')} className="btn-login">Entrar</button>
             </header>

             <section className="hero-section">
                 <h1 className="titulo">O futuro do<br/><span>trabalho em equipe</span></h1>
                 <p className="sub">Uma plataforma unificada para comunicação, gestão e gamificação. Transforme a produtividade da sua empresa hoje.</p>
             </section>

             <div className="recursos-container">
                <div className="recurso">
                  <div className="recurso-icone"><i className="fas fa-comments"></i></div>
                  <div className="recurso-conteudo">
                    <h3>Chat Inteligente</h3>
                    <p>Troque mensagens com sua equipe de forma rápida e organizada. Com IA integrada.</p>
                  </div>
                </div>
                <div className="recurso">
                  <div className="recurso-icone"><i className="fas fa-video"></i></div>
                  <div className="recurso-conteudo">
                    <h3>Videochamadas</h3>
                    <p>Reuniões em HD com compartilhamento de tela e gravação automática.</p>
                  </div>
                </div>
                <div className="recurso">
                  <div className="recurso-icone"><i className="fas fa-trophy"></i></div>
                  <div className="recurso-conteudo">
                    <h3>Gamificação</h3>
                    <p>Engaje sua equipe com sistema de pontos, rankings e recompensas.</p>
                  </div>
                </div>
                <div className="recurso">
                  <div className="recurso-icone"><i className="fas fa-robot"></i></div>
                  <div className="recurso-conteudo">
                    <h3>Assistente IA</h3>
                    <p>Automatize tarefas e obtenha insights com nossa IA integrada.</p>
                  </div>
                </div>
             </div>

             <div className="destaque">
                <h2>Pronto para começar?</h2>
                <p>Junte-se a milhares de equipes produtivas.</p>
                <button onClick={() => onNavigate('register')} className="btn-destaque">Criar Conta Grátis</button>
             </div>
        </div>
    );
};


// ==========================================
// REGISTER PAGE
// ==========================================
export const RegisterPage: React.FC<PageProps> = ({ onNavigate, onShowToast }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPass) {
            onShowToast?.("As senhas não coincidem.", "error");
            return;
        }

        if (password.length < 6) {
             onShowToast?.("A senha deve ter pelo menos 6 caracteres.", "error");
             return;
        }

        setLoading(true);
        try {
            // 1. Create User in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Display Name
            await updateProfile(user, { displayName: name });

            // 3. Create User Document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                id: user.uid,
                name: name,
                email: email,
                role: Role.MEMBRO, // Default role
                points: 0
            });

            onShowToast?.("Cadastro realizado com sucesso! Bem-vindo.", "success");
            onNavigate('app');
        } catch (error: any) {
            console.error("Erro no cadastro:", error);
            let msg = "Erro ao cadastrar. Tente novamente.";
            
            if (error.code === 'auth/email-already-in-use') {
                msg = "Este e-mail já está em uso.";
            } else if (error.code === 'auth/invalid-email') {
                msg = "Formato de e-mail inválido.";
            } else if (error.code === 'auth/weak-password') {
                msg = "A senha é muito fraca.";
            }

            onShowToast?.(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const styles = `
    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
    }
    .register-box {
        width: 500px;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        color: #1371e2;
        padding: 40px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        z-index: 1;
        backdrop-filter: blur(5px);
    }
    .register-box h1 {
        font-size: 28px;
        text-align: center;
        margin-bottom: 40px;
        position: relative;
        font-weight: 600;
        color: #1371e2;
    }
    .register-box h1:after {
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
    }
    .login-btn-submit {
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
    }
    .login-btn-submit:hover {
        background-color: #0f5bb5;
        transform: translateY(-3px);
    }
    .login-btn-submit:disabled {
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
    }
    .register-link a:hover {
        text-decoration: underline;
    }
    `;

    return (
        <div className="external-page">
            <style>{COMMON_STYLES}{styles}</style>
            <video autoPlay muted loop id="background-video" style={{position: 'fixed', width: '100%', height: '100%', objectFit: 'cover', zIndex: -2}}>
                <source src="https://cdn.pixabay.com/video/2019/05/16/23645-336369040_large.mp4" type="video/mp4" />
            </video>
            <div style={{position: 'fixed', top:0, left:0, width:'100%', height:'100%', background: 'rgba(0,0,0,0.5)', zIndex:-1}}></div>

            <div className="register-container">
                <main className="register-box">
                    <div className="text-center mb-4">
                         <div 
                            style={{ width: '200px', margin: '0 auto', cursor: 'pointer' }}
                            onClick={() => onNavigate('splash')}
                            title="Voltar para Intro"
                        >
                            {/* BLUE/BLACK COLORED LOGO FOR WHITE REGISTER BOX */}
                            <img 
                                src="https://i.imgur.com/syClG5w.png" 
                                alt="Conecta Logo" 
                                className="w-full h-auto hover:scale-105 transition-transform duration-300" 
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h1>Cadastre-se</h1>
                        
                        <div className="input-box">
                            <label>Nome Completo</label>
                            <input type="text" placeholder="Nome" required value={name} onChange={e => setName(e.target.value)}/>
                        </div>
                        <div className="input-box">
                            <label>E-mail</label>
                            <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)}/>
                            <i className="bx bxs-user"></i>
                        </div>
                        <div className="input-box">
                            <label>Senha</label>
                            <input type="password" placeholder="Senha" required value={password} onChange={e => setPassword(e.target.value)}/>
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                         <div className="input-box">
                            <label>Confirme sua senha</label>
                            <input type="password" placeholder="Digite novamente" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)}/>
                            <i className="bx bxs-lock-alt"></i>
                        </div>

                        <button type="submit" className="login-btn-submit" disabled={loading}>
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </button>
                        
                        <div className="register-link">
                            <p>Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Logue agora</a></p>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};
