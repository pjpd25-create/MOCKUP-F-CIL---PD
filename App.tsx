
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { SceneUploader } from './components/SceneUploader';
import { CategorySelector, SelectedCategory } from './components/CategorySelector';
import { StyleSelector } from './components/StyleSelector';
import { SizeSelector } from './components/SizeSelector';
import { PlacementSelector } from './components/PlacementSelector';
import { ColorSelector } from './components/ColorSelector';
import { MOCKUP_CATEGORIES, STYLE_OPTIONS, COLOR_OPTIONS, BACKGROUND_TYPES, MATERIAL_OPTIONS, getSizeOptionsForCategory, getPlacementOptionsForCategory, MAX_BATCH_SIZE } from './constants';
import { generateMockup, cleanImage } from './services/geminiService';
import { MockupPreview } from './components/MockupPreview';
import { Lightbox } from './components/Lightbox';
import { SparklesIcon, HistoryIcon, TrashIcon, DownloadIcon, MicrophoneIcon, PhotoIcon, CubeIcon, CheckIcon } from './components/icons';
import { Login, UserData } from './components/Login';
import { supabase } from './services/supabaseClient';
import { VoiceControl } from './components/VoiceControl';
import { AdSpace } from './components/AdSpace';
import { SocialProof } from './components/SocialProof';

declare global {
  interface Window {
    JSZip: any;
  }
}

interface HistoryItem {
  id: string;
  image: string;
  category: string;
  date: Date;
  originalFileName: string | null;
}

export const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  
  const [backgroundType, setBackgroundType] = useState<string>('studio');
  const [sceneImage, setSceneImage] = useState<string | null>(null);
  const [sceneMimeType, setSceneMimeType] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0]);
  const [globalMockupMode, setGlobalMockupMode] = useState<'standard' | '3d'>('standard');
  
  const [placement, setPlacement] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIAL_OPTIONS[0].id);
  const [variationsCount, setVariationsCount] = useState<number>(1);

  const [generatedImages, setGeneratedImages] = useState<{ category: string, image: string | null, type?: 'standard' | '3d' }[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  
  const [lightboxState, setLightboxState] = useState<{ index: number, source: 'current' | 'history' } | null>(null);

  const isMultiSelect = selectedCategories.length > 1;

  useEffect(() => {
    let mounted = true;
    const initializeSession = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            if (mounted && data.session?.user) {
                setUser({
                    name: data.session.user.user_metadata.full_name || 'Usuário',
                    email: data.session.user.email || '',
                    id: data.session.user.id
                });
            }
        } catch (error) { console.error("Session error:", error); } finally {
            if (mounted) setIsLoadingSession(false);
        }
    };
    initializeSession();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
            if (session?.user) {
                setUser({ name: session.user.user_metadata.full_name || 'Usuário', email: session.user.email || '', id: session.user.id });
            } else { setUser(null); setHistory([]); }
        }
    });
    return () => { mounted = false; authListener.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (user?.id) fetchHistory(user.id); }, [user?.id]);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      const firstCat = selectedCategories[0].name;
      const pOptions = getPlacementOptionsForCategory(firstCat);
      const sOptions = getSizeOptionsForCategory(firstCat);
      if (!pOptions.includes(placement)) setPlacement(pOptions[0]);
      if (!sOptions.includes(selectedSize)) setSelectedSize(sOptions[0]);
    }
  }, [selectedCategories]);

  const fetchHistory = async (userId: string) => {
    try {
        const { data } = await supabase.from('mockups').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) {
            setHistory(data.map((item: any) => ({
                id: item.id,
                image: item.image_data,
                category: item.category,
                date: new Date(item.created_at),
                originalFileName: item.original_filename || null
            })));
        }
    } catch (e) { console.error("History fetch error:", e); }
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || !imageMimeType) { setError('Envie um design primeiro.'); return; }
    if (selectedCategories.length === 0) { setError('Selecione ao menos um produto.'); return; }
    
    const jobs: { cat: string, type: 'standard' | '3d' }[] = [];
    selectedCategories.forEach(cat => {
        for(let v = 0; v < variationsCount; v++) { 
            jobs.push({ cat: cat.name, type: globalMockupMode }); 
        }
    });

    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setActiveTab('current'); 
    setGeneratedImages([]);

    const results: { category: string, image: string | null, type?: 'standard' | '3d' }[] = [];

    try {
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const currentPlacement = isMultiSelect ? "Otimizado pela IA" : placement;
            const currentSize = isMultiSelect ? "Padrão Sugerido" : selectedSize;

            const result = await generateMockup(uploadedImage, imageMimeType, job.cat, selectedStyle, currentPlacement, selectedColor, currentSize, backgroundType === 'custom' ? sceneImage : null, sceneMimeType, "", job.type, backgroundType, selectedMaterial);
            
            if (result) {
                const label = `${job.cat} (${job.type === '3d' ? '3D' : 'Foto'})`;
                results.push({ category: label, image: result, type: job.type });
                await supabase.from('mockups').insert([{ user_id: user?.id, image_data: result, category: label, original_filename: originalFileName }]);
                setHistory(prev => [{ id: Date.now().toString(), image: result, category: label, date: new Date(), originalFileName }, ...prev]);
                setGeneratedImages([...results]);
            }
            setProgress(Math.round(((i + 1) / jobs.length) * 100));
            if (i < jobs.length - 1) await new Promise(r => setTimeout(r, 3500));
        }
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
    } catch (err: any) { 
        setError("Erro no processamento. Tente novamente em alguns segundos."); 
    }
    finally { setIsGenerating(false); }
  }, [uploadedImage, imageMimeType, selectedCategories, variationsCount, selectedStyle, placement, selectedColor, selectedSize, sceneImage, sceneMimeType, originalFileName, user, backgroundType, selectedMaterial, isMultiSelect, globalMockupMode]);

  if (isLoadingSession) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 border-4 border-t-brand-orange border-white/5 rounded-2xl animate-spin mb-8 shadow-[0_0_30px_rgba(249,115,22,0.4)]"></div>
      <p className="text-[12px] font-black uppercase tracking-[0.6em] text-brand-orange text-center animate-pulse">Sincronizando Ativos Criativos...</p>
    </div>
  );
  
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen text-gray-200 font-sans flex flex-col relative pb-20">
       {showSuccessToast && (
         <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
            <div className="bg-gradient-to-r from-brand-red to-brand-orange text-white px-12 py-6 rounded-[3rem] shadow-[0_30px_90px_rgba(249,115,22,0.5)] flex items-center gap-6 border border-white/30 backdrop-blur-xl">
                <CheckIcon className="h-8 w-8" />
                <div className="flex flex-col">
                    <p className="font-black uppercase tracking-[0.3em] text-base">Produção Concluída!</p>
                    <p className="text-[10px] font-bold opacity-90 uppercase tracking-[0.2em]">Seus mockups de alta resolução já estão disponíveis.</p>
                </div>
            </div>
         </div>
       )}

       <header className="bg-brand-dark/40 backdrop-blur-3xl border-b border-white/5 p-6 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
                  <div className="w-11 h-11 bg-gradient-to-tr from-brand-red to-brand-orange rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <CubeIcon className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="font-black text-3xl text-white uppercase tracking-tighter">MOCKUP <span className="text-brand-orange">FÁCIL</span></h1>
              </div>
              <div className="flex items-center gap-8">
                  <div className="hidden sm:flex flex-col items-end">
                      <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Painel Profissional</span>
                      <span className="text-white text-sm font-black uppercase">{user.name}</span>
                  </div>
                  <button onClick={() => supabase.auth.signOut()} className="text-brand-red font-black uppercase text-[10px] tracking-[0.3em] border border-brand-red/30 px-6 py-2.5 rounded-full hover:bg-brand-red/10 transition-all active:scale-95">Sair</button>
              </div>
          </div>
      </header>

      <div className="p-6 md:p-12 max-w-7xl mx-auto flex-grow w-full">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Coluna de Controles - Esquerda */}
          <div className="lg:col-span-4 glass-card p-10 rounded-[4rem] h-fit space-y-10 shadow-2xl animate-fade-in">
            <section>
              <h2 className="text-[12px] font-black text-brand-orange uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  01. Upload de Design
              </h2>
              <ImageUploader onImageUpload={(b, m, f) => { setUploadedImage(b); setImageMimeType(m); setOriginalFileName(f); }} onCleanImage={() => {}} onRemoveImage={() => setUploadedImage(null)} isCleaning={false} uploadedImage={uploadedImage} />
            </section>

            <section>
              <h2 className="text-[12px] font-black text-brand-orange uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  02. Catálogo de Ativos
              </h2>
              <CategorySelector categories={MOCKUP_CATEGORIES} selectedCategories={selectedCategories} onSelectionChange={setSelectedCategories} maxSelection={MAX_BATCH_SIZE} />
              
              {isMultiSelect && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-brand-orange/20 to-brand-red/10 border border-brand-orange/30 rounded-[2.5rem] animate-fade-in shadow-inner">
                      <p className="text-[11px] font-black text-brand-orange uppercase tracking-widest leading-relaxed flex items-center gap-4">
                          <SparklesIcon className="h-6 w-6" /> 
                          <span>MOTOR IA ATIVO: OTIMIZAÇÃO AUTOMÁTICA EM LOTE</span>
                      </p>
                  </div>
              )}
            </section>
            
            <section>
              <h2 className="text-[12px] font-black text-brand-orange uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  03. Configuração Estética
              </h2>
              <ColorSelector colors={COLOR_OPTIONS} selectedColor={selectedColor} onSelectColor={setSelectedColor} selectedMaterial={selectedMaterial} onSelectMaterial={setSelectedMaterial} />
              
              <div className="mt-10 space-y-5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Ambientação & Estilo</label>
                  <StyleSelector styles={STYLE_OPTIONS} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
              </div>

              <div className="mt-10 space-y-5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-2">Tecnologia de Render</label>
                  <div className="flex gap-4 p-2 bg-black/40 border border-white/5 rounded-3xl">
                      <button 
                          onClick={() => setGlobalMockupMode('standard')}
                          className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase transition-all ${globalMockupMode === 'standard' ? 'bg-white text-brand-dark shadow-2xl' : 'text-gray-600 hover:text-white'}`}
                      >
                          Foto Realista
                      </button>
                      <button 
                          onClick={() => setGlobalMockupMode('3d')}
                          className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase transition-all ${globalMockupMode === '3d' ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-2xl' : 'text-gray-600 hover:text-white'}`}
                      >
                          Cena 3D
                      </button>
                  </div>
              </div>
            </section>

            <section className={isMultiSelect ? "opacity-20 grayscale blur-[1px] pointer-events-none" : ""}>
                <h2 className="text-[12px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6">04. Refinamento de Posição</h2>
                <div className="space-y-8">
                    <PlacementSelector placements={getPlacementOptionsForCategory(selectedCategories[0]?.name || '')} selectedPlacement={placement} onSelectPlacement={setPlacement} disabled={isMultiSelect} />
                    <SizeSelector sizes={getSizeOptionsForCategory(selectedCategories[0]?.name || '')} selectedSize={selectedSize} onSelectSize={setSelectedSize} disabled={isMultiSelect} />
                </div>
            </section>

            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !uploadedImage || selectedCategories.length === 0} 
              className="w-full bg-gradient-to-r from-brand-red to-brand-orange hover:brightness-110 text-white font-black py-7 rounded-[3rem] shadow-[0_25px_60px_rgba(220,38,38,0.4)] transition-all disabled:opacity-20 uppercase tracking-[0.3em] text-xl active:scale-95"
            >
                {isGenerating ? `PROCESSANDO (${progress}%)` : "GERAR MOCKUPS EM LOTE"}
            </button>
          </div>

          {/* Coluna de Resultados - Direita */}
          <div className="lg:col-span-8 space-y-10">
            <AdSpace type="horizontal" className="w-full shadow-2xl animate-glow" />
            
            <div className="glass-card p-10 md:p-14 rounded-[5rem] min-h-[800px] relative shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <div className="flex border-b border-white/5 mb-12 gap-12 items-center justify-between overflow-x-auto no-scrollbar">
                <div className="flex gap-12 flex-shrink-0">
                    <button onClick={() => setActiveTab('current')} className={`pb-6 font-black uppercase text-[14px] tracking-[0.4em] relative transition-all ${activeTab === 'current' ? 'text-brand-orange' : 'text-gray-700 hover:text-gray-400'}`}>BATCH ATUAL {activeTab === 'current' && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-red to-brand-orange rounded-full shadow-[0_0_10px_rgba(249,115,22,0.6)]" />}</button>
                    <button onClick={() => setActiveTab('history')} className={`pb-6 font-black uppercase text-[14px] tracking-[0.4em] relative transition-all ${activeTab === 'history' ? 'text-brand-orange' : 'text-gray-700 hover:text-gray-400'}`}>MINHA COLEÇÃO {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-red to-brand-orange rounded-full shadow-[0_0_10px_rgba(249,115,22,0.6)]" />}</button>
                </div>
              </div>

              {activeTab === 'current' ? (
                isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-[600px] text-center px-10">
                    <div className="w-24 h-24 border-4 border-t-brand-orange border-white/5 rounded-[2.5rem] animate-spin mb-10 shadow-2xl"></div>
                    <p className="text-brand-orange font-black uppercase tracking-[0.5em] text-lg animate-pulse">CRIANDO IMAGENS COM IA...</p>
                    <p className="text-[12px] text-gray-600 mt-6 font-black tracking-widest">{progress}% DA PRODUÇÃO CONCLUÍDA</p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 animate-fade-in">
                    {generatedImages.map((img, i) => (
                      <div key={i} className="rounded-[3.5rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl transition-all hover:scale-[1.03] hover:border-brand-orange/40 group">
                        <MockupPreview imageData={img.image} isLoading={false} onDelete={() => {}} onOpen={() => setLightboxState({index: i, source: 'current'})} originalFileName={originalFileName} onDownload={() => {}} />
                        <div className="p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-center"><span className="text-[10px] font-black text-gray-500 group-hover:text-brand-orange uppercase tracking-widest truncate">{img.category}</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center text-gray-800 border-4 border-dashed border-white/5 rounded-[6rem] p-16 text-center group hover:border-brand-orange/20 transition-all">
                    <PhotoIcon className="h-20 w-20 opacity-10 mb-8 group-hover:scale-110 transition-transform"/><p className="font-black uppercase tracking-[0.5em] text-[13px] max-w-sm leading-relaxed">ENVIE SEU DESIGN E SELECIONE OS PRODUTOS PARA INICIAR A PRODUÇÃO.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 animate-fade-in pb-20">
                  {history.map((item, i) => (
                    <div key={item.id} className="rounded-[3.5rem] overflow-hidden border border-white/5 bg-black/40 shadow-2xl group relative transition-all hover:border-brand-orange/20">
                        <MockupPreview imageData={item.image} isLoading={false} onDelete={() => {}} onOpen={() => setLightboxState({index: i, source: 'history'})} originalFileName={item.originalFileName} onDownload={() => {}} />
                        <div className="absolute top-6 left-6 bg-brand-orange/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <VoiceControl onUpdate={() => {}} hasUploadedImage={!!uploadedImage} />
      <SocialProof />
      
      <Lightbox isOpen={!!lightboxState} image={lightboxState?.source === 'current' ? generatedImages[lightboxState.index]?.image : history[lightboxState?.index || 0]?.image} onClose={() => setLightboxState(null)} currentIndex={lightboxState?.index || 0} totalImages={lightboxState?.source === 'current' ? generatedImages.length : history.length} onNext={() => setLightboxState(prev => prev ? {...prev, index: (prev.index + 1) % (prev.source === 'current' ? generatedImages.length : history.length)} : null)} onPrev={() => setLightboxState(prev => prev ? {...prev, index: (prev.index - 1 + (prev.source === 'current' ? generatedImages.length : history.length)) % (prev.source === 'current' ? generatedImages.length : history.length)} : null)} hasNext={true} hasPrev={true} />
      
      <footer className="p-16 text-center bg-brand-dark/80 backdrop-blur-md border-t border-white/5 mt-20">
          <p className="text-[11px] font-black uppercase tracking-[0.8em] text-gray-700">PLATAFORMA DE BRANDING IA • PASMAB COMERCIAL • EST. 2025</p>
      </footer>
    </div>
  );
};
