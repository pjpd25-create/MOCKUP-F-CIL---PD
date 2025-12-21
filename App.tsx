
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

  const clearHistory = async () => {
    if (!user?.id) return;
    if (!confirm("Confirmar exclusão de todo o histórico?")) return;
    try {
        const { error } = await supabase.from('mockups').delete().eq('user_id', user.id);
        if (error) throw error;
        setHistory([]);
    } catch (e) { console.error(e); }
  };

  const saveToHistoryDb = async (imageData: string, category: string, fileName: string | null) => {
      if (!user?.id) return null;
      try {
          const { data } = await supabase.from('mockups').insert([{ user_id: user.id, image_data: imageData, category, original_filename: fileName }]).select();
          return data?.[0] || null;
      } catch (e) { return null; }
  };

  const handleCleanImage = async () => {
    if (!uploadedImage || !imageMimeType) return;
    setIsCleaning(true);
    setError(null);
    try {
      const res = await cleanImage(uploadedImage, imageMimeType);
      if (res) { setUploadedImage(res); setImageMimeType('image/png'); }
      else { setError("Não foi possível limpar esta imagem."); }
    } catch (e: any) { setError("Erro ao processar imagem."); }
    finally { setIsCleaning(false); }
  };

  const handleDownloadAllZip = async () => {
    if (generatedImages.length === 0 || !window.JSZip) return;
    setIsZipping(true);
    try {
        const zip = new window.JSZip();
        const folder = zip.folder("mockups-gerados");
        
        generatedImages.forEach((img, index) => {
            if (img.image) {
                const base64Data = img.image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                const fileName = `${img.category.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${index + 1}.png`;
                folder.file(fileName, base64Data, { base64: true });
            }
        });

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `mockups_${user?.name?.toLowerCase().replace(/\s/g, '_')}_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Erro ao gerar ZIP:", err);
        setError("Erro ao gerar arquivo compactado.");
    } finally {
        setIsZipping(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || !imageMimeType) { setError('Envie um design primeiro.'); return; }
    if (selectedCategories.length === 0) { setError('Selecione ao menos um produto.'); return; }
    
    const jobs: { cat: string, type: 'standard' | '3d' }[] = [];
    
    selectedCategories.forEach(cat => {
        const types: ('standard' | '3d')[] = [];
        if (cat.mode === 'standard' || cat.mode === 'both') types.push('standard');
        if (cat.mode === '3d' || cat.mode === 'both') types.push('3d');
        types.forEach(type => {
            for(let v = 0; v < variationsCount; v++) { jobs.push({ cat: cat.name, type }); }
        });
    });

    // Removido o bloqueio para permitir geração massiva/ilimitada.
    // Apenas mostramos um aviso visual se for realmente muito grande.
    if (jobs.length > 50) { 
        console.warn("Lote grande detectado. O processamento pode demorar alguns minutos.");
    }
    
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    setActiveTab('current'); 
    setGeneratedImages([]);

    const results: { category: string, image: string | null, type?: 'standard' | '3d' }[] = [];

    try {
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const isSingle = selectedCategories.length === 1;
            
            // Aqui passamos a cor explicitamente escolhida pelo usuário
            const result = await generateMockup(uploadedImage, imageMimeType, job.cat, selectedStyle, isSingle ? placement : "Otimizado", selectedColor, isSingle ? selectedSize : "Padrão", backgroundType === 'custom' ? sceneImage : null, sceneMimeType, "", job.type, backgroundType, selectedMaterial);
            
            if (result) {
                const label = `${job.cat} (${job.type === '3d' ? '3D' : 'Foto'})`;
                results.push({ category: label, image: result, type: job.type });
                const dbRes = await saveToHistoryDb(result, label, originalFileName);
                setHistory(prev => [{ id: dbRes?.id || Date.now().toString(), image: result, category: label, date: new Date(), originalFileName }, ...prev]);
                
                // Atualizamos a lista de imagens em tempo real para o usuário ver o progresso
                setGeneratedImages([...results]);
            }
            setProgress(Math.round(((i + 1) / jobs.length) * 100));
            
            // Delay curto para evitar sobrecarga, mas mantendo a velocidade para produção massiva
            if (i < jobs.length - 1) await new Promise(r => setTimeout(r, 4500));
        }
        if (results.length > 0) {
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
        }
    } catch (err: any) { 
        setError("Limite temporário atingido. O sistema retomará a produção ilimitada em instantes. Tente novamente em 30 segundos."); 
    }
    finally { setIsGenerating(false); }
  }, [uploadedImage, imageMimeType, selectedCategories, variationsCount, selectedStyle, placement, selectedColor, selectedSize, sceneImage, sceneMimeType, originalFileName, user, backgroundType, selectedMaterial]);

  const handleLogout = () => supabase.auth.signOut();

  if (isLoadingSession) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 border-4 border-t-red-600 border-gray-800 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 text-center animate-pulse">Iniciando Mockup Fácil Pro...</p>
    </div>
  );
  
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col relative">
       {showSuccessToast && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
            <div className="bg-green-600 text-white px-8 py-4 rounded-2xl shadow-[0_15px_40px_rgba(22,163,74,0.4)] flex items-center gap-3 border border-green-400/30">
                <CheckIcon className="h-6 w-6" />
                <div className="flex flex-col">
                    <p className="font-black uppercase tracking-widest text-xs">Parabéns, {user.name}!</p>
                    <p className="text-[10px] font-bold opacity-90 uppercase">Você gerou seus produtos ilimitados!</p>
                </div>
            </div>
         </div>
       )}

       <header className="bg-gray-900/95 backdrop-blur-md border-b border-red-900/30 p-4 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] group-hover:rotate-12 transition-all">
                      <CubeIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h1 className="font-black text-lg md:text-xl text-red-600 uppercase tracking-tighter">MOCKUP FÁCIL</h1>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                  <span className="hidden sm:inline text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Acesso: <span className="text-white">{user.name}</span></span>
                  <button onClick={handleLogout} className="text-red-500 font-black uppercase text-[8px] md:text-[10px] tracking-widest border border-red-500/20 px-2 md:px-3 py-1 rounded hover:bg-red-500/10 transition-colors">Sair</button>
              </div>
          </div>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto flex-grow w-full">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-4 bg-gray-900/40 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-red-900/10 h-fit space-y-6">
            <section>
              <h2 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">01. DESIGN PRINCIPAL</h2>
              <ImageUploader onImageUpload={(b, m, f) => { setUploadedImage(b); setImageMimeType(m); setOriginalFileName(f); }} onCleanImage={handleCleanImage} onRemoveImage={() => setUploadedImage(null)} isCleaning={isCleaning} uploadedImage={uploadedImage} />
            </section>
            <section>
              <h2 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">02. SELEÇÃO DE PRODUTOS & REDES SOCIAIS</h2>
              <CategorySelector categories={MOCKUP_CATEGORIES} selectedCategories={selectedCategories} onSelectionChange={setSelectedCategories} maxSelection={MAX_BATCH_SIZE} />
            </section>
            <section>
              <h2 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">03. CORES DOS PRODUTOS</h2>
              <ColorSelector colors={COLOR_OPTIONS} selectedColor={selectedColor} onSelectColor={setSelectedColor} selectedMaterial={selectedMaterial} onSelectMaterial={setSelectedMaterial} />
            </section>
            <section>
              <h2 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">04. AMBIENTE & AGÊNCIA</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                  {BACKGROUND_TYPES.map(bg => (
                      <button key={bg.id} onClick={() => setBackgroundType(bg.id)} className={`p-2 rounded-xl border-2 text-[8px] md:text-[9px] font-black uppercase tracking-tighter transition-all ${backgroundType === bg.id ? 'border-red-600 bg-red-600/10 text-white' : 'border-gray-800 bg-black/40 text-gray-600 hover:border-gray-700'}`}>{bg.label}</button>
                  ))}
              </div>
              
              {backgroundType === 'custom' && (
                <div className="animate-fade-in space-y-4">
                   <SceneUploader onSceneUpload={(b, m) => { setSceneImage(b); setSceneMimeType(m); }} onClearScene={() => setSceneImage(null)} sceneImage={sceneImage} sceneMimeType={sceneMimeType} />
                </div>
              )}

              {backgroundType !== 'solid' && (
                 <div className="space-y-4 pt-4 animate-fade-in">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Estilo Criativo Agência</label>
                    <StyleSelector styles={STYLE_OPTIONS} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
                 </div>
              )}
            </section>
            <section>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest">05. ESCALA (VARIAÇÕES)</h2>
                    <span className="text-[10px] font-black text-white">{variationsCount}x</span>
                </div>
                <input type="range" min="1" max="10" value={variationsCount} onChange={(e) => setVariationsCount(parseInt(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"/>
            </section>
            <AdSpace type="vertical" className="mt-4 hidden md:flex" />
            <button onClick={handleGenerate} disabled={isGenerating || !uploadedImage || selectedCategories.length === 0} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl transition-all disabled:opacity-30 uppercase tracking-widest text-base md:text-lg">
                {isGenerating ? `GERANDO (${progress}%)` : "INICIAR PRODUÇÃO ILIMITADA"}
            </button>
            {error && <p className="text-red-500 text-[9px] md:text-[10px] font-black text-center uppercase tracking-widest mt-4 bg-red-900/10 p-4 rounded-xl border border-red-900/20">{error}</p>}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <AdSpace type="horizontal" className="mb-4 w-full" />
            <div className="bg-gray-900/20 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-800 min-h-[400px] md:min-h-[600px] relative shadow-2xl">
              <div className="flex border-b border-gray-800 mb-6 md:mb-8 gap-6 md:gap-10 items-center justify-between">
                <div className="flex gap-6 md:gap-8">
                    <button onClick={() => setActiveTab('current')} className={`pb-4 font-black uppercase text-[9px] md:text-[10px] tracking-widest relative transition-all ${activeTab === 'current' ? 'text-red-500' : 'text-gray-600'}`}>PRODUÇÃO ATUAL {activeTab === 'current' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full" />}</button>
                    <button onClick={() => setActiveTab('history')} className={`pb-4 font-black uppercase text-[9px] md:text-[10px] tracking-widest relative transition-all ${activeTab === 'history' ? 'text-red-500' : 'text-gray-600'}`}>TODOS GERADOS {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full" />}</button>
                </div>
                <div className="flex gap-2">
                    {(activeTab === 'current' || activeTab === 'history') && (generatedImages.length > 0 || history.length > 0) && (
                        <button 
                            onClick={handleDownloadAllZip} 
                            disabled={isZipping}
                            className="mb-4 text-green-500 font-black uppercase text-[8px] md:text-[9px] tracking-widest flex items-center gap-2 border border-green-500/20 px-3 py-1.5 rounded-full hover:bg-green-500/10 transition-all"
                        >
                            <DownloadIcon className="h-4 w-4" /> 
                            {isZipping ? 'ZIPANDO...' : 'BAIXAR TODOS (.ZIP)'}
                        </button>
                    )}
                    {activeTab === 'history' && history.length > 0 && <button onClick={clearHistory} className="mb-4 text-red-600 font-black uppercase text-[8px] md:text-[9px] tracking-widest flex items-center gap-2 px-3 py-1.5"><TrashIcon className="h-4 w-4" /> LIMPAR TUDO</button>}
                </div>
              </div>
              {activeTab === 'current' ? (
                isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] text-center px-4">
                    <div className="w-12 h-12 border-4 border-t-red-600 border-gray-800 rounded-full animate-spin mb-6"></div>
                    <p className="text-red-500 font-black uppercase tracking-widest text-xs">Produzindo mockups em massa para redes sociais e agências...</p>
                    <p className="text-[10px] text-gray-500 mt-2">{progress}% concluído</p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
                    {generatedImages.map((img, i) => (
                      <div key={i} className="rounded-xl md:rounded-2xl overflow-hidden border border-white/5 bg-black shadow-2xl transition-transform hover:scale-[1.01]">
                        <MockupPreview imageData={img.image} isLoading={false} onDelete={() => {}} onOpen={() => setLightboxState({index: i, source: 'current'})} originalFileName={originalFileName} onDownload={() => {}} />
                        <div className="p-3 bg-black/40 border-t border-white/5 flex justify-between items-center"><span className="text-[8px] font-black text-gray-500 uppercase tracking-widest truncate">{img.category}</span>{img.type === '3d' && <CubeIcon className="h-3 w-3 text-red-600 opacity-50" />}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center text-gray-800 border-4 border-dashed border-red-900/5 rounded-[1.5rem] md:rounded-[3rem] p-6 text-center">
                    <PhotoIcon className="h-12 w-12 opacity-5 mb-4"/><p className="font-black uppercase tracking-widest text-[9px] md:text-[10px]">Aguardando design para iniciar produção ilimitada para marcas, agências e negócios.</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-fade-in pb-10">
                  {history.map((item, i) => (
                    <div key={item.id} className="rounded-xl md:rounded-2xl overflow-hidden border border-white/5 bg-black group relative shadow-lg">
                        <MockupPreview imageData={item.image} isLoading={false} onDelete={() => {}} onOpen={() => setLightboxState({index: i, source: 'history'})} originalFileName={item.originalFileName} onDownload={() => {}} />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[6px] font-black text-gray-400 uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {history.length === 0 && <div className="col-span-full text-center text-gray-800 py-24 font-black uppercase text-[9px] tracking-widest border-4 border-dashed border-gray-900/50 rounded-[1.5rem]">HISTÓRICO VAZIO</div>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <VoiceControl onUpdate={(data) => { if (data.categories) setSelectedCategories(data.categories.map(c => ({ name: c, mode: 'standard' }))); if (data.style) setSelectedStyle(data.style); if (data.color) setSelectedColor(data.color); }} hasUploadedImage={!!uploadedImage} />
      <SocialProof />
      <Lightbox isOpen={!!lightboxState} image={lightboxState?.source === 'current' ? generatedImages[lightboxState.index]?.image : history[lightboxState?.index || 0]?.image} onClose={() => setLightboxState(null)} currentIndex={lightboxState?.index || 0} totalImages={lightboxState?.source === 'current' ? generatedImages.length : history.length} onNext={() => setLightboxState(prev => prev ? {...prev, index: (prev.index + 1) % (prev.source === 'current' ? generatedImages.length : history.length)} : null)} onPrev={() => setLightboxState(prev => prev ? {...prev, index: (prev.index - 1 + (prev.source === 'current' ? generatedImages.length : history.length)) % (prev.source === 'current' ? generatedImages.length : history.length)} : null)} hasNext={true} hasPrev={true} />
      <footer className="p-6 md:p-8 text-center bg-black border-t border-red-900/10"><p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-800">© 2025 MOCKUP FÁCIL PRO PLATAFORMA DESENVOLVIDA PELA PASMAB COMERCIAL</p></footer>
    </div>
  );
};
