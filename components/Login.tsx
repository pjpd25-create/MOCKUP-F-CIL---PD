
import React, { useState, useEffect } from 'react';
import { LogoIcon, ChevronLeftIcon, CubeIcon, PhotoIcon, SparklesIcon } from './icons';
import { supabase } from '../services/supabaseClient';
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
    { url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1200&auto=format&fit=crop", label: "Identidade Visual Corporativa" },
    { url: "https://images.unsplash.com/photo-1635405074683-96d6921a2a2c?q=80&w=1200&auto=format&fit=crop", label: "Papelaria Premium" },
    { url: "https://images.unsplash.com/photo-1572044162444-ad60f128bde3?q=80&w=1200&auto=format&fit=crop", label: "Branding de Escritório" },
    { url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop", label: "Design de Embalagens" },
    { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop", label: "Vestuário Minimalista" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop", label: "Apresentação Digital" },
    { url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop", label: "Sinalização de Fachada" },
    { url: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop", label: "Interface de Usuário" },
    { url: "https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=1200&auto=format&fit=crop", label: "Ambiente Corporativo" },
    { url: "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?q=80&w=1200&auto=format&fit=crop", label: "Moda e Estilo" },
    { url: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?q=80&w=1200&auto=format&fit=crop", label: "Material de Marketing" },
    { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop", label: "Tecnologia e Design" },
    { url: "https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?q=80&w=1200&auto=format&fit=crop", label: "Criação de Logo" },
    { url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop", label: "Web Design Pro" },
    { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", label: "Análise de Dados" },
    { url: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop", label: "Trabalho em Equipe" },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop", label: "Sede de Empresa" },
    { url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop", label: "Consultoria Criativa" },
    { url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop", label: "Coworking Moderno" },
    { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop", label: "Design de Interiores" },
    { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop", label: "Arquitetura Corporativa" },
    { url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=1200&auto=format&fit=crop", label: "Finanças e Negócios" },
    { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop", label: "Inovação Tecnológica" },
    { url: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?q=80&w=1200&auto=format&fit=crop", label: "Planejamento Estratégico" },
    { url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop", label: "Lançamento de Marca" }
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
            {/* Background Carousel */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                 {SHOWCASE_IMAGES.map((img, i) => (
                    <div 
                        key={i}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] transform scale-110 ${currentSlide === i ? 'opacity-40' : 'opacity-0'}`} 
                        style={{ backgroundImage: `url(${img.url})` }} 
                    />
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/90" />
            </div>

            <nav className="relative z-10 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3 font-black text-2xl tracking-tighter group cursor-default">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)] group-hover:rotate-12 transition-all">
                        <CubeIcon className="h-6 w-6 text-white" />
                    </div>
                    MOCKUP <span className="text-red-600">FÁCIL</span>
                </div>
                <div className="flex gap-8 items-center">
                    <button onClick={() => setViewMode('auth')} className="font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-500 transition-colors">Acessar</button>
                    <button onClick={() => { setIsRegistering(true); setViewMode('auth'); }} className="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:-translate-y-1">Criar Conta</button>
                </div>
            </nav>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pt-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-full mb-10 animate-pulse">
                    <SparklesIcon className="h-4 w-4 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">IA Generativa de Mockups Profissionais</span>
                </div>
                
                <h1 className="text-4xl md:text-7xl font-black mb-10 leading-[1.1] max-w-5xl uppercase tracking-tighter">
                    Transforme Suas Ideias de Designs <br className="hidden md:block"/> 
                    Planos em <span className="text-red-600 underline decoration-red-900/50 underline-offset-8">Produtos Foto Realistas</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mb-8 font-bold uppercase tracking-widest leading-relaxed">
                    Crie apresentações incríveis em segundos para <span className="text-white">E-books, Livros Físicos, Bolsas, Mochilas, Carteiras</span> e Identidade Visual Corporativa completa com o poder da Inteligência Artificial.
                </p>

                {/* Monetização Landing Page */}
                <AdSpace type="horizontal" className="max-w-4xl mb-12" />

                <div className="flex flex-col sm:flex-row gap-6">
                    <button onClick={() => { setIsRegistering(true); setViewMode('auth'); }} className="bg-red-600 text-white px-20 py-7 rounded-full font-black text-2xl hover:bg-red-500 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.4)] uppercase tracking-widest hover:scale-105 active:scale-95">
                        Gerar Meu Mockup Agora
                    </button>
                </div>

                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40">
                    <div className="flex flex-col items-center gap-2">
                        <PhotoIcon className="h-8 w-8 text-red-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Foto Realismo</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <CubeIcon className="h-8 w-8 text-red-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Render Pro 3D</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <SparklesIcon className="h-8 w-8 text-red-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Material Realista</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <LogoIcon className="h-8 w-8 text-red-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Qualidade 8K</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-12 w-full px-12 flex justify-between items-center z-10">
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">&copy; 2025 MOCKUP FÁCIL PRO</div>
                <div className="flex gap-4">
                    {SHOWCASE_IMAGES.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentSlide(i)}
                            className={`h-1 rounded-full transition-all duration-700 ${currentSlide === i ? 'w-16 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]' : 'w-4 bg-gray-900'}`} 
                        />
                    ))}
                </div>
                <div className="text-[10px] font-black text-red-900 uppercase tracking-[0.3em]">IA v3.0 Powered</div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="bg-gray-900/80 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-red-900/20 w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative z-10">
            <button onClick={() => setViewMode('landing')} className="text-gray-600 mb-10 flex items-center gap-3 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest">
                <ChevronLeftIcon className="h-5 w-5"/> Voltar ao Início
            </button>
            <h2 className="text-4xl md:text-5xl font-black mb-10 uppercase tracking-tighter">
                {isRegistering ? <><span className="text-red-600">Novo</span> Registro</> : <><span className="text-red-600">Login</span> Seguro</>}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {isRegistering && (
                    <div className="relative">
                        <input type="text" placeholder="Seu Nome Completo" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black border border-gray-800 p-6 rounded-3xl outline-none focus:border-red-600 transition-all font-bold text-sm uppercase tracking-widest placeholder:text-gray-700"/>
                    </div>
                )}
                <div className="relative">
                    <input type="email" placeholder="Endereço de E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black border border-gray-800 p-6 rounded-3xl outline-none focus:border-red-600 transition-all font-bold text-sm uppercase tracking-widest placeholder:text-gray-700"/>
                </div>
                <div className="relative">
                    <input type="password" placeholder="Senha Secreta" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black border border-gray-800 p-6 rounded-3xl outline-none focus:border-red-600 transition-all font-bold text-sm uppercase tracking-widest placeholder:text-gray-700"/>
                </div>
                {error && <p className="text-red-500 text-[10px] font-black bg-red-600/10 p-4 rounded-2xl border border-red-600/30 uppercase tracking-widest text-center animate-shake">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-red-600 py-6 rounded-3xl font-black text-lg text-white hover:bg-red-500 transition-all shadow-[0_20px_40px_rgba(220,38,38,0.3)] uppercase tracking-[0.2em] relative overflow-hidden group">
                    <span className="relative z-10">{loading ? "Validando..." : (isRegistering ? "Confirmar Registro" : "Entrar no Painel")}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
            </form>
            <p className="mt-10 text-center text-gray-600 font-bold uppercase text-[10px] tracking-widest">
                {isRegistering ? "Já possui uma licença?" : "Ainda não possui conta?"} 
                <button onClick={() => setIsRegistering(!isRegistering)} className="text-red-600 font-black ml-3 hover:underline underline-offset-4 decoration-2">
                    {isRegistering ? "Fazer Login" : "Registrar Agora"}
                </button>
            </p>
        </div>
    </div>
  );
};
