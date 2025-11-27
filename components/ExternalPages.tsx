
import React, { useEffect, useState } from 'react';
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
    const [introFinished, setIntroFinished] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const handleVideoEnd = () => {
        // Added 3 seconds delay before fading out video to make intro longer
        setTimeout(() => {
            setIntroFinished(true);
            setTimeout(() => setShowContent(true), 500);
        }, 3000); 
    };

    const handleLogoClick = () => {
        // Reset states to replay the intro
        setShowContent(false);
        setIntroFinished(false);
    };

    useEffect(() => {
        // Increased fallback timer to 10s to account for video length + delay
        const timer = setTimeout(() => {
            if (!introFinished) {
                handleVideoEnd();
            }
        }, 10000); 

        return () => clearTimeout(timer);
    }, [introFinished]);

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
      opacity: 0.6;
    }
    #vinheta {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999;
      transition: opacity 0.8s ease, visibility 0.8s;
      margin: 0;
      padding: 0;
      border: none;
      overflow: hidden;
    }
    #vinheta video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border: none;
        outline: none;
    }
    .splash-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      opacity: 0;
      transition: opacity 1s ease;
    }
    .splash-content.visible {
      opacity: 1;
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
    }
    .btn-splash:hover {
      background-color: #0e5dbb;
      box-shadow: 0 0 20px rgba(19, 113, 226, 0.6);
    }
    .splash-h1 {
      font-size: 2.4em;
      margin-top: 20px;
      font-weight: 600;
      color: #fff;
      text-align: center;
      text-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .splash-p {
      font-size: 1.2em;
      margin-top: 5px;
      font-weight: 500;
      color: #90bbf9;
      text-align: center;
    }
    `;

    return (
        <div className="external-page">
            <style>{COMMON_STYLES}{styles}</style>
            
            {/* Online Video Background */}
            <div id="fundo-animado">
                <video 
                    src="https://cdn.pixabay.com/video/2019/05/16/23645-336369040_large.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                />
            </div>

            {/* Intro Video (Vinheta) */}
            <div id="vinheta" style={{ opacity: introFinished ? 0 : 1, visibility: introFinished ? 'hidden' : 'visible' }}>
                 {!introFinished && (
                    <video 
                        src="https://i.imgur.com/Nig6dt1.mp4" 
                        autoPlay 
                        muted 
                        playsInline
                        onEnded={handleVideoEnd}
                    />
                 )}
            </div>

            {/* Main Content */}
            <div className={`splash-content ${showContent ? 'visible' : ''}`}>
                <header className="mb-8">
                    <div 
                        className="logo-container" 
                        style={{ width: '380px' }} 
                        onClick={handleLogoClick}
                        title="Clique para rever a intro"
                    >
                        {/* CORRECT LOGO (UPDATED) */}
                         <img 
                            src="https://i.imgur.com/syClG5w.png" 
                            alt="Conecta Logo" 
                            className="logo-img"
                            style={{ filter: 'drop-shadow(0 0 15px rgba(91,197,242,0.4))' }} 
                        />
                    </div>
                </header>

                <main className="flex flex-col items-center">
                    <h1 className="splash-h1">Bem-vindo ao Conecta.ai</h1>
                    <p className="splash-p">Conectando ideias e tecnologia.</p>
                    <button onClick={() => onNavigate('explore')} className="btn-splash">Explorar</button>
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
      background: rgba(0, 0, 0, 0.6);
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
      z-index: 1;
    }
    .btn-login {
      padding: 10px 25px;
      background: #1371e2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.3s;
      text-decoration: none;
    }
    .btn-login:hover {
      background: #0f5bb5;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .titulo {
      text-align: center;
      margin-top: 60px;
      font-size: 3.5rem;
      font-weight: 600;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .sub {
      text-align: center;
      margin-top: 10px;
      font-size: 1.6rem;
      color: #3dcaff;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .recursos-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      padding: 40px 60px;
      margin-top: 20px;
      position: relative;
      z-index: 1;
    }
    .recurso {
      display: flex;
      align-items: center;
      gap: 25px;
      padding: 30px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.4s ease;
      opacity: 0;
      transform: translateY(30px);
    }
    .recurso.ativo {
      opacity: 1;
      transform: translateY(0);
    }
    .recurso:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-5px);
      border-color: rgba(91, 197, 242, 0.3);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .recurso-icone {
      flex: 0 0 70px;
      height: 70px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #3dcaff;
      transition: all 0.3s ease;
    }
    .recurso h3 { font-size: 1.5rem; margin-bottom: 8px; color: white; }
    .recurso p { font-size: 1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.5; margin: 0; }
    .destaque {
      text-align: center;
      padding: 60px 40px;
      position: relative;
      z-index: 1;
    }
    .destaque h2 { font-size: 2.5rem; margin-bottom: 20px; }
    .destaque p { font-size: 1.3rem; max-width: 700px; margin: 0 auto 30px; color: rgba(255, 255, 255, 0.9); }
    .btn-destaque {
      display: inline-block;
      padding: 15px 40px;
      background: #1371e2;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.2rem;
      cursor: pointer;
      transition: 0.3s;
      text-decoration: none;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(19, 113, 226, 0.4);
    }
    @media (max-width: 900px) {
      .recursos-container { grid-template-columns: 1fr; padding: 40px 20px; }
      .recurso { flex-direction: column; text-align: center; padding: 25px; }
    }
    `;

    return (
        <div className="external-page explore-page">
             <style>{COMMON_STYLES}{styles}</style>
             
             {/* Public Video Link */}
             <video autoPlay muted loop id="background-video">
                <source src="https://cdn.pixabay.com/video/2019/05/16/23645-336369040_large.mp4" type="video/mp4" />
             </video>
             <div className="overlay"></div>

             <header className="explore-header">
                <div style={{ width: '180px' }}>
                    {/* WHITE LOGO FOR DARK EXPLORE PAGE */}
                    <img src="https://i.imgur.com/d0MPLlg.png" alt="Conecta Logo" className="w-full h-auto" />
                </div>
                <button onClick={() => onNavigate('login')} className="btn-login">Cadastrar / Login</button>
             </header>

             <h1 className="titulo">Explore o Conecta.ai</h1>
             <p className="sub">Tecnologia, comunicação e colaboração em um único lugar.</p>

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
                    <h3>Chamadas de Vídeo</h3>
                    <p>Reuniões profissionais com estabilidade e qualidade excepcionais.</p>
                  </div>
                </div>
                <div className="recurso">
                  <div className="recurso-icone"><i className="fas fa-users"></i></div>
                  <div className="recurso-conteudo">
                    <h3>Grupos</h3>
                    <p>Espaços dedicados para cada setor, projeto ou equipe.</p>
                  </div>
                </div>
                <div className="recurso">
                  <div className="recurso-icone"><i className="fas fa-tasks"></i></div>
                  <div className="recurso-conteudo">
                    <h3>Organização</h3>
                    <p>Tarefas, agenda, documentos e tudo no mesmo sistema.</p>
                  </div>
                </div>
             </div>

             <div className="destaque">
                <h2>Pronto para transformar sua comunicação?</h2>
                <p>Junte-se a milhares de empresas que já utilizam o Conecta.ai.</p>
                <button onClick={() => onNavigate('register')} className="btn-destaque">Experimente Gratuitamente</button>
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
