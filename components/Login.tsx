
import React, { useState, useEffect } from 'react';
import { LogoIcon, ChevronLeftIcon, CubeIcon, PhotoIcon, SparklesIcon } from './icons';
import { supabase } from '../services/supabaseClient';
import { SocialProof } from './SocialProof';
import { AdSpace } from './AdSpace';

export interface UserData {
    name: string;
    email: string;
    id?: string;
}

interface LoginProps {
  onLogin: (userData: UserData) => void; 
}

const SHOWCASE_IMAGES = [
    { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80&auto=format&fit=crop", label: "Furniture" },
    { url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&q=80&auto=format&fit=crop", label: "Branding" },
    { url: "https://images.unsplash.com/photo-1635405074683-96d6921a2a2c?w=800&q=80&auto=format&fit=crop", label: "Stationery" },
    { url: "https://images.unsplash.com/photo-1572044162444-ad60f128bde3?w=800&q=80&auto=format&fit=crop", label: "Creative" },
    { url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80&auto=format&fit=crop", label: "Art" }
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [viewMode, setViewMode] = useState<'landing' | 'auth'>('landing');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
        const normalizedEmail = email.trim().toLowerCase();
        if (isRegistering) {
            const { data, error: err } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: { data: { full_name: name } }
            });
            if (err) throw err;
            if (data.session) onLogin({ name, email, id: data.user?.id });
            else setError("Verifique seu e-mail para confirmar a conta.");
        } else {
            const { data, error: err } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
            if (err) throw err;
            onLogin({ name: data.user?.user_metadata.full_name || 'Usuário', email, id: data.user?.id });
        }
    } catch (err: any) {
        setError(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message);
    } finally { setLoading(false); }
  };

  if (viewMode === 'landing') {
    return (
        <div className="relative min-h-screen text-white flex flex-col overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden">
                 {SHOWCASE_IMAGES.map((img, i) => (
                    <div 
                        key={i}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2500ms] transform scale-110 ${currentSlide === i ? 'opacity-40' : 'opacity-0'}`} 
                        style={{ backgroundImage: `url('${img.url}')` }} 
                    />
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/20 via-brand-dark/80 to-brand-dark" />
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(220,38,38,0.3)_0%,rgba(0,0,0,0)_60%)]" />
            </div>

            <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3 font-black text-2xl tracking-tighter group cursor-pointer" onClick={() => window.location.reload()}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-brand-red to-brand-orange rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.6)] group-hover:rotate-6 transition-all">
                        <CubeIcon className="h-6 w-6 text-white" />
                    </div>
                    MOCKUP <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">FÁCIL</span>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={() => { setIsRegistering(false); setViewMode('auth'); }} className="hidden sm:block font-black text-[12px] uppercase tracking-widest hover:text-brand-orange transition-colors">Acessar</button>
                    <button onClick={() => { setIsRegistering(true); setViewMode('auth'); }} className="bg-gradient-to-r from-brand-red to-brand-orange text-white px-8 py-3 rounded-full font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all shadow-2xl">Começar Agora</button>
                </div>
            </nav>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pt-12">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-brand-orange/10 border border-brand-orange/30 rounded-full mb-8 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                    <SparklesIcon className="h-5 w-5 text-brand-orange" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-orange">Tecnologia IA Generativa 2025</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-6 uppercase tracking-tighter leading-none max-w-5xl">
                    CRIE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">BRANDING</span> DE ELITE COM UM CLIQUE
                </h2>
                
                <p className="text-base md:text-xl text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed">
                    Transforme seus logos e designs em mockups foto-realistas deslumbrantes que vendem sua ideia instantaneamente.
                </p>

                <div className="flex flex-col items-center mb-16 w-full max-w-4xl">
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <button onClick={() => { setIsRegistering(true); setViewMode('auth'); }} className="bg-white text-black px-12 py-5 rounded-full font-black text-xl hover:bg-brand-orange hover:text-white transition-all shadow-2xl uppercase tracking-widest active:scale-95">
                            CRIAR MEU PRIMEIRO MOCKUP
                        </button>
                    </div>

                    {/* Carrossel de Showcase - O Coração Visual */}
                    <div className="w-screen overflow-hidden relative mb-12">
                        <div className="flex gap-6 animate-scroll whitespace-nowrap py-4">
                            {[...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES].map((img, i) => (
                                <div key={i} className="w-40 md:w-64 aspect-square flex-shrink-0 rounded-[3rem] overflow-hidden border border-white/10 group relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-brand-surface">
                                    <img 
                                        src={img.url} 
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                                        loading="lazy" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-red/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{img.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ANÚNCIO ESTRATÉGICO DEBAIXO DO CARROSSEL */}
                    <AdSpace type="horizontal" className="max-w-4xl w-full opacity-80 hover:opacity-100 transition-opacity border-brand-orange/20 animate-glow" />
                </div>
            </div>

            <footer className="relative z-10 p-8 w-full flex flex-col items-center gap-4 bg-brand-dark/50 backdrop-blur-md border-t border-white/5">
                <SocialProof inline variant="tiny" />
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] text-center">
                    PASMAB COMERCIAL © 2025 • TODOS OS DIREITOS RESERVADOS
                </div>
            </footer>
            
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
            `}</style>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row overflow-hidden font-sans">
        {/* Lado Visual - Desktop */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
             {SHOWCASE_IMAGES.map((img, i) => (
                <div 
                    key={i}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] transform scale-110 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`} 
                    style={{ backgroundImage: `url('${img.url}')` }} 
                />
             ))}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-dark/20 to-brand-dark" />
             <div className="absolute inset-0 bg-brand-red/10 mix-blend-overlay" />
             <div className="absolute bottom-16 left-16 z-20 max-w-md">
                 <div className="flex items-center gap-3 font-black text-5xl tracking-tighter mb-6 text-white">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-red to-brand-orange rounded-2xl flex items-center justify-center shadow-2xl">
                        <CubeIcon className="h-8 w-8 text-white" />
                    </div>
                    MOCKUP <span className="text-brand-orange">FÁCIL</span>
                 </div>
                 <p className="text-white font-bold uppercase text-sm tracking-[0.3em] leading-relaxed drop-shadow-2xl opacity-80 border-l-4 border-brand-red pl-6">
                    A maior plataforma de identidade visual por inteligência artificial do mercado brasileiro.
                 </p>
             </div>
        </div>

        {/* Lado Form - Mobile & Desktop */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-8 md:p-16 relative bg-brand-dark overflow-y-auto">
            <div className="md:hidden absolute inset-0 z-0 opacity-30">
                 <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${SHOWCASE_IMAGES[currentSlide].url}')` }} />
                 <div className="absolute inset-0 bg-brand-dark/90" />
            </div>

            <div className="w-full max-w-md relative z-10 py-10">
                <button onClick={() => setViewMode('landing')} className="text-brand-orange mb-12 flex items-center gap-3 hover:text-white transition-all uppercase font-black text-[11px] tracking-widest w-fit">
                    <ChevronLeftIcon className="h-4 w-4"/> Voltar ao Início
                </button>

                <h2 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tighter text-left text-white leading-none">
                    {isRegistering ? 'CRIAR CONTA' : 'BEM-VINDO'}
                </h2>
                <p className="text-gray-500 font-bold uppercase text-[12px] tracking-widest mb-12 text-left">
                    {isRegistering ? 'Junte-se à revolução do branding IA' : 'Acesse seu painel criativo'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegistering && (
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nome Completo</label>
                             <input type="text" placeholder="JOÃO SILVA" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none focus:border-brand-orange transition-all font-bold text-sm text-white placeholder:text-gray-700"/>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                        <input type="email" placeholder="EMAIL@EXEMPLO.COM" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none focus:border-brand-orange transition-all font-bold text-sm text-white placeholder:text-gray-700"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Sua Senha</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none focus:border-brand-orange transition-all font-bold text-sm text-white placeholder:text-gray-700"/>
                    </div>
                    
                    {error && (
                        <div className="bg-brand-red/10 p-4 rounded-2xl border border-brand-red/30">
                            <p className="text-brand-red text-[11px] font-black uppercase text-center">{error}</p>
                        </div>
                    )}
                    
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-red to-brand-orange py-5 rounded-3xl font-black text-lg text-white hover:brightness-110 transition-all shadow-[0_20px_40px_rgba(220,38,38,0.3)] uppercase tracking-widest mt-6">
                        {loading ? "PROCESSANDO..." : (isRegistering ? "FINALIZAR CADASTRO" : "ENTRAR NO PAINEL")}
                    </button>

                    {/* ANÚNCIO ESTRATÉGICO DEBAIXO DO BOTÃO DE LOGIN */}
                    <AdSpace type="horizontal" className="opacity-60 hover:opacity-100 transition-opacity border-white/5 h-24 mt-8" />
                </form>

                <p className="mt-12 text-center text-gray-500 font-bold uppercase text-[12px] tracking-widest">
                    {isRegistering ? "Já tem acesso?" : "Novo por aqui?"} 
                    <button onClick={() => setIsRegistering(!isRegistering)} className="text-brand-orange font-black ml-3 hover:text-white transition-colors underline underline-offset-4 decoration-brand-orange/30">
                        {isRegistering ? "FAZER LOGIN" : "CRIAR CONTA GRÁTIS"}
                    </button>
                </p>
                
                <div className="mt-16 text-center border-t border-white/5 pt-12">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">
                        PLATAFORMA PASMAB COMERCIAL • 2025
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
