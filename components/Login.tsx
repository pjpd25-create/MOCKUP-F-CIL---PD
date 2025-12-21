
import React, { useState, useEffect } from 'react';
import { LogoIcon, ChevronLeftIcon, CubeIcon, PhotoIcon, SparklesIcon } from './icons';
import { supabase } from '../services/supabaseClient';
import { AdSpace } from './AdSpace';
import { SocialProof } from './SocialProof';

export interface UserData {
    name: string;
    email: string;
    id?: string;
}

interface LoginProps {
  onLogin: (userData: UserData) => void; 
}

const SHOWCASE_IMAGES = [
    { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop", label: "Furniture" },
    { url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=1200&auto=format&fit=crop", label: "Branding" },
    { url: "https://images.unsplash.com/photo-1635405074683-96d6921a2a2c?w=1200&auto=format&fit=crop", label: "Stationery" },
    { url: "https://images.unsplash.com/photo-1572044162444-ad60f128bde3?w=1200&auto=format&fit=crop", label: "Creative" },
    { url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop", label: "Art" },
    { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop", label: "T-Shirt" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop", label: "Design" },
    { url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&auto=format&fit=crop", label: "Digital" },
    { url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop", label: "Interface" },
    { url: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200&auto=format&fit=crop", label: "Business" },
    { url: "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?w=1200&auto=format&fit=crop", label: "Apparel" },
    { url: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=1200&auto=format&fit=crop", label: "Abstract" },
    { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&auto=format&fit=crop", label: "Technology" },
    { url: "https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?w=1200&auto=format&fit=crop", label: "Logo" },
    { url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop", label: "Portfolio" },
    { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop", label: "Marketing" },
    { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop", label: "Development" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop", label: "Modern" },
    { url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop", label: "Consulting" },
    { url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop", label: "Studio" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop", label: "Building" },
    { url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1200&auto=format&fit=crop", label: "Finance" },
    { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop", label: "Startup" },
    { url: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=1200&auto=format&fit=crop", label: "Office" },
    { url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop", label: "Launch" }
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

    const normalizedEmail = email.trim().toLowerCase();
    try {
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
        <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                 {SHOWCASE_IMAGES.map((img, i) => (
                    <div 
                        key={i}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2500ms] transform scale-105 ${currentSlide === i ? 'opacity-50' : 'opacity-0'}`} 
                        style={{ backgroundImage: `url('${img.url}')` }} 
                    />
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/40" />
            </div>

            <nav className="relative z-10 p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 font-black text-lg md:text-xl tracking-tighter group cursor-default">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] group-hover:rotate-12 transition-all">
                        <CubeIcon className="h-5 w-5 text-white" />
                    </div>
                    MOCKUP <span className="text-red-600">FÁCIL</span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex gap-4 md:gap-6 items-center">
                        <button onClick={() => { setIsRegistering(false); setViewMode('auth'); }} className="font-black text-[9px] uppercase tracking-[0.3em] hover:text-red-500 transition-colors">Acessar</button>
                        <button onClick={() => { setIsRegistering(true); setViewMode('auth'); }} className="bg-red-600 text-white px-4 md:px-6 py-2 rounded-full font-black uppercase text-[8px] md:text-[9px] tracking-[0.3em] hover:bg-red-500 transition-all shadow-lg">Criar Conta</button>
                    </div>
                    {/* Notificação abaixo do botão Criar Conta / no canto superior direito */}
                    <div className="mt-1 mr-1">
                        <SocialProof inline variant="tiny" />
                    </div>
                </div>
            </nav>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pt-12 pb-24">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 animate-pulse">
                    <SparklesIcon className="h-3 w-3 text-red-600" />
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] text-red-500">IA de Mockups Profissionais Generativa</span>
                </div>
                
                <h2 className="text-xl md:text-3xl lg:text-4xl font-black mb-4 uppercase tracking-tighter text-red-600 leading-tight drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] max-w-4xl">
                    DEIXE A SUA MARCA COM IDENTIDADE VISUAL PROFISSIONAL QUE ATRAIA CLIENTES
                </h2>
                
                <h1 className="text-sm md:text-lg text-gray-400 max-w-2xl mb-12 font-bold leading-relaxed px-4">
                    Transforme Suas Ideias de Designs em Produtos Incríveis Foto Realistas.
                </h1>

                <div className="flex flex-col items-center mb-16 w-full max-w-xs sm:max-w-none justify-center">
                    <button onClick={() => { setIsRegistering(true); setViewMode('auth'); }} className="bg-red-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-base md:text-xl hover:bg-red-500 transition-all shadow-[0_15px_40px_rgba(220,38,38,0.5)] uppercase tracking-widest hover:scale-105 active:scale-95">
                        COMEÇAR AGORA
                    </button>
                    {/* Notificação removida deste local como solicitado ("SAI") */}
                </div>

                <div className="w-full overflow-hidden relative">
                    <div className="flex gap-4 animate-scroll whitespace-nowrap">
                        {SHOWCASE_IMAGES.map((img, i) => (
                            <div key={i} className="w-32 md:w-44 aspect-square flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 group relative shadow-2xl bg-gray-900">
                                <img src={img.url} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" loading="lazy" />
                                <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[6px] md:text-[7px] font-black uppercase text-white tracking-widest bg-black/70 px-2 md:px-3 py-1 md:py-1.5 rounded-full">{img.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 p-6 md:p-8 w-full flex flex-col items-center gap-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="flex gap-2">
                    {SHOWCASE_IMAGES.slice(0, 15).map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-700 ${currentSlide % 15 === i ? 'w-6 md:w-10 bg-red-600' : 'w-1.5 md:w-2 bg-gray-900'}`} />
                    ))}
                </div>
                <div className="text-[7px] md:text-[9px] font-black text-red-900 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center max-w-2xl px-4">
                    © 2025 MOCKUP FÁCIL PRO PLATAFORMA DESENVOLVIDA PELA PASMAB COMERCIAL
                </div>
            </div>
            
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-scroll {
                    animation: scroll 60s linear infinite;
                }
            `}</style>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row overflow-hidden font-sans">
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-black">
             {SHOWCASE_IMAGES.map((img, i) => (
                <div 
                    key={i}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] transform scale-105 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`} 
                    style={{ backgroundImage: `url('${img.url}')` }} 
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/90" />
                </div>
             ))}
             
             <div className="absolute bottom-12 left-12 z-20 max-w-md">
                 <div className="flex items-center gap-2 font-black text-3xl tracking-tighter mb-4">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
                        <CubeIcon className="h-6 w-6 text-white" />
                    </div>
                    MOCKUP <span className="text-red-600">FÁCIL</span>
                 </div>
                 <p className="text-white font-bold uppercase text-[11px] tracking-widest leading-relaxed drop-shadow-lg max-w-sm">
                    Sua jornada profissional começa aqui. Crie apresentações que vendem com a nossa tecnologia generativa.
                 </p>
             </div>
        </div>

        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 md:p-12 relative min-h-screen">
            <div className="md:hidden absolute inset-0 z-0 opacity-20 bg-black">
                 <div 
                    className="w-full h-full bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url('${SHOWCASE_IMAGES[currentSlide].url}')` }}
                 />
                 <div className="absolute inset-0 bg-black/60" />
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 md:w-96 h-80 md:h-96 bg-red-600/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10 flex flex-col">
                <button onClick={() => setViewMode('landing')} className="text-gray-400 mb-8 md:mb-12 flex items-center gap-2 hover:text-red-500 transition-colors uppercase font-black text-[9px] md:text-[10px] tracking-[0.2em] w-fit">
                    <ChevronLeftIcon className="h-4 w-4"/> Voltar ao Início
                </button>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 uppercase tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis text-center w-full">
                    {isRegistering ? <span className="text-red-600">Crie Sua Nova Conta</span> : <span className="text-red-600">Acesse Seu Painel Pro</span>}
                </h2>
                <p className="text-gray-500 font-bold uppercase text-[10px] md:text-[11px] tracking-widest mb-10 md:mb-12 text-center w-full">
                    Seja Bem-vindo (a)
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {isRegistering && (
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input type="text" placeholder="João Silva" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-900 border border-gray-800 p-4 md:p-5 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-sm text-white placeholder:text-gray-800"/>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-1">Endereço de E-mail</label>
                        <input type="email" placeholder="exemplo@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-900 border border-gray-800 p-4 md:p-5 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-sm text-white placeholder:text-gray-800"/>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-1">Senha Segura</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-800 p-4 md:p-5 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-sm text-white placeholder:text-gray-800"/>
                    </div>
                    
                    {error && (
                        <div className="bg-red-600/10 p-4 rounded-xl border border-red-600/30">
                            <p className="text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
                        </div>
                    )}
                    
                    <button type="submit" disabled={loading} className="w-full bg-red-600 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg text-white hover:bg-red-500 transition-all shadow-xl uppercase tracking-widest mt-4">
                        {loading ? "Processando..." : (isRegistering ? "Confirmar Cadastro" : "Entrar no Painel")}
                    </button>
                    <SocialProof inline />
                </form>

                <p className="mt-8 md:mt-10 text-center text-gray-600 font-bold uppercase text-[10px] md:text-[11px] tracking-widest">
                    {isRegistering ? "Já possui acesso?" : "Ainda não tem conta?"} 
                    <button onClick={() => setIsRegistering(!isRegistering)} className="text-red-600 font-black ml-2 hover:underline">
                        {isRegistering ? "Fazer Login" : "Registrar Agora"}
                    </button>
                </p>
                
                <div className="mt-auto pt-16 text-center">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-800 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">
                        PLATAFORMA DESENVOLVIDA PELA PASMAB COMERCIAL<br/>
                        © 2025 MOCKUP FÁCIL
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};
