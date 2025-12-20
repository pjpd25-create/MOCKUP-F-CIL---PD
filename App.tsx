
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
import { SparklesIcon, HistoryIcon, TrashIcon, DownloadIcon, MicrophoneIcon, PhotoIcon, CubeIcon } from './components/icons';
import { Login, UserData } from './components/Login';
import { supabase } from './services/supabaseClient';
import { VoiceControl } from './components/VoiceControl';
import { AdSpace } from './components/AdSpace';

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
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [lightboxState, setLightboxState] = useState<{ index: number, source: 'current' | 'history' } | null>(null);

  // Cálculo do total de renders pendentes
  const totalRenders = useMemo(() => {
    return selectedCategories.reduce((acc, cat) => {
        let modes = 0;
        if (cat.mode === 'standard' || cat.mode === 'both') modes++;
        if (cat.mode === '3d' || cat.mode === 'both') modes++;
        return acc + (modes * variationsCount);
    }, 0);
  }, [selectedCategories, variationsCount]);

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
        } catch (error) {
            console.error("Erro sessão:", error);
        } finally {
            if (mounted) setIsLoadingSession(false);
        }
    };
    initializeSession();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
            if (session?.user) {
                setUser({
                    name: session.user.user_metadata.full_name || 'Usuário',
                    email: session.user.email || '',
                    id: session.user.id
                });
            } else {
                setUser(null);
                setHistory([]);
            }
        }
    });
    return () => { mounted = false; authListener.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (user?.id) fetchHistory(user.id);
  }, [user?.id]);

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
  };

  const saveToHistoryDb = async (imageData: string, category: string, fileName: string | null) => {
      if (!user?.id) return null;
      const { data } = await supabase.from('mockups').insert([{ user_id: user.id, image_data: imageData, category, original_filename: fileName }]).select();
      return data?.[0] || null;
  };

  const handleCleanImage = async () => {
    if (!uploadedImage || !imageMimeType) return;
    setIsCleaning(true);
    setError(null);
    try {
      const res = await cleanImage(uploadedImage, imageMimeType);
      if (res) {
        setUploadedImage(res);
        setImageMimeType('image/png');
      } else {
        setError("Não foi possível limpar esta imagem.");
      }
    } catch (e) { 
      console.error(e);
      setError("Erro ao processar limpeza de imagem. Tente novamente."); 
    }
    finally { setIsCleaning(false); }
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || !imageMimeType) { setError('Envie um design primeiro.'); return; }
    if (selectedCategories.length === 0) { setError('Selecione ao menos um produto.'); return; }
    
    let totalImagesToGenerate = 0;
    const jobs: { cat: string, type: 'standard' | '3d' }[] = [];
    
    selectedCategories.forEach(cat => {
        const types: ('standard' | '3d')[] = [];
        if (cat.mode === 'standard' || cat.mode === 'both') types.push('standard');
        if (cat.mode === '3d' || cat.mode === 'both') types.push('3d');
        
        types.forEach(type => {
            for(let v = 0; v < variationsCount; v++) {
                jobs.push({ cat: cat.name, type });
                totalImagesToGenerate++;
            }
        });
    });

    if (totalImagesToGenerate > MAX_BATCH_SIZE) { 
        setError(`Limite de ${MAX_BATCH_SIZE} mockups excedido (Total: ${totalImagesToGenerate}). Reduza as variações ou produtos.`); 
        return; 
    }
    
    setError(null);
    setShowCongrats(false);
    setIsGenerating(true);
    setProgress(0);
    setActiveTab('current'); 
    setGeneratedImages([]);

    const results: { category: string, image: string | null, type?: 'standard' | '3d' }[] = [];

    try {
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const isSingle = selectedCategories.length === 1;
            const varInst = variationsCount > 1 ? `Variação visual única ${ (i % variationsCount) + 1 }.` : undefined;

            const result = await generateMockup(
                uploadedImage, imageMimeType, job.cat, selectedStyle, 
                isSingle ? placement : "Posicionamento frontal otimizado", 
                selectedColor, 
                isSingle ? selectedSize : "Tamanho padrão",
                backgroundType === 'custom' ? sceneImage : null, sceneMimeType, varInst, job.type,
                backgroundType,
                selectedMaterial
            );
            
            if (result) {
                const label = `${job.cat} (${job.type === '3d' ? '3D' : 'Foto'})`;
                results.push({ category: label, image: result, type: job.type });
                const dbRes = await saveToHistoryDb(result, label, originalFileName);
                setHistory(prev => [{ id: dbRes?.id || Date.now().toString(), image: result, category: label, date: new Date(), originalFileName }, ...prev]);
            }
            setProgress(Math.round(((i + 1) / jobs.length) * 100));
            if (i < jobs.length - 1) await new Promise(r => setTimeout(r, 800));
        }
        setGeneratedImages(results);
        if (results.length > 0) setShowCongrats(true);
    } catch (err) { 
      console.error(err);
      setError("Erro na geração. Tente novamente em instantes."); 
    }
    finally { setIsGenerating(false); }
  }, [uploadedImage, imageMimeType, selectedCategories, variationsCount, selectedStyle, placement, selectedColor, selectedSize, sceneImage, sceneMimeType, originalFileName, user, backgroundType, selectedMaterial]);

  const handleDownloadAllZip = async () => {
    if (generatedImages.length === 0) return;
    
    setIsDownloadingZip(true);
    const JSZip = window.JSZip;
    if (!JSZip) {
        alert("Erro ao carregar compressor. Tente atualizar a página.");
        setIsDownloadingZip(false);
        return;
    }

    try {
        const zip = new JSZip();
        const folderName = `Mockups-${originalFileName?.split('.')[0] || 'Design'}-${new Date().getTime()}`;
        const folder = zip.folder(folderName);

        generatedImages.forEach((img, idx) => {
            if (img.image) {
                const fileName = `${img.category.replace(/[^a-z0-9]/gi, '_')}_${idx + 1}.png`;
                folder.file(fileName, img.image, { base64: true });
            }
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Erro ZIP:", e);
        alert("Erro ao criar arquivo ZIP.");
    } finally {
        setIsDownloadingZip(false);
    }
  };

  const handleVoiceUpdate = (data: any) => {
      if (data.categories) {
          const newCats: SelectedCategory[] = data.categories.map((c: string) => ({
              name: c,
              mode: 'both'
          }));
          setSelectedCategories(newCats);
      }
      if (data.style) setSelectedStyle(data.style);
      if (data.color) setSelectedColor(data.color);
      if (data.placement) setPlacement(data.placement);
      
      if (data._autoGenerate && uploadedImage && data.categories) {
          setTimeout(handleGenerate, 500);
      }
  };

  const handleLogout = () => supabase.auth.signOut();

  if (isLoadingSession) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-t-red-600 border-gray-800 rounded-full animate-spin"></div></div>;
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-red-500 selection:text-white flex flex-col">
       <header className="bg-gray-900 border-b border-red-900/30 p-4 sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="w-1/4">
                 <div className="flex items-center gap-2 group cursor-default">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] group-hover:rotate-12 transition-all">
                        <CubeIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="hidden sm:inline font-black text-xs uppercase tracking-widest text-gray-400">Plataforma Pro</span>
                 </div>
              </div>
              <h1 className="w-1/2 text-center text-xl sm:text-3xl font-black text-red-600 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">MOCKUP FÁCIL</h1>
              <div className="w-1/4 text-right flex items-center justify-end gap-3 text-sm">
                  <span className="hidden sm:inline text-gray-400 text-[10px] font-bold uppercase">Olá, <span className="text-white">{user.name}</span></span>
                  <button onClick={handleLogout} className="text-red-500 font-black uppercase text-[10px] tracking-widest border border-red-500/20 px-3 py-1 rounded hover:bg-red-500/10 transition-all">Sair</button>
              </div>
          </div>
      </header>

      <div className="p-4 sm:p-8 max-w-7xl mx-auto flex-grow w-full">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-gray-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-red-900/20 h-fit space-y-8 shadow-[0_0_50px_rgba(220,38,38,0.05)]">
            <section>
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4"/> 01. DESIGN PRINCIPAL
              </h2>
              <ImageUploader onImageUpload={(b, m, f) => { setUploadedImage(b); setImageMimeType(m); setOriginalFileName(f); }} 
                             onCleanImage={handleCleanImage} onRemoveImage={() => setUploadedImage(null)} 
                             isCleaning={isCleaning} uploadedImage={uploadedImage} />
            </section>

            <section>
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">02. SELEÇÃO DE PRODUTOS</h2>
              <CategorySelector categories={MOCKUP_CATEGORIES} selectedCategories={selectedCategories} 
                                onSelectionChange={setSelectedCategories} maxSelection={MAX_BATCH_SIZE} />
            </section>

            <section>
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">03. AMBIENTE E FUNDO</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                  {BACKGROUND_TYPES.map(bg => (
                      <button 
                        key={bg.id}
                        onClick={() => setBackgroundType(bg.id)}
                        className={`p-3 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 ${backgroundType === bg.id ? 'border-red-600 bg-red-600/10 text-white shadow-lg' : 'border-gray-800 bg-black/40 text-gray-600 hover:border-gray-700'}`}
                      >
                        {bg.label}
                        <span className="text-[7px] opacity-40 lowercase tracking-normal font-medium">{bg.description}</span>
                      </button>
                  ))}
              </div>
              
              {backgroundType === 'custom' && (
                  <div className="mb-4 animate-fade-in">
                      <SceneUploader 
                        onSceneUpload={(b, m) => { setSceneImage(b); setSceneMimeType(m); }} 
                        onClearScene={() => { setSceneImage(null); setSceneMimeType(null); }} 
                        sceneImage={sceneImage} 
                        sceneMimeType={sceneMimeType} 
                      />
                  </div>
              )}

              <div className="space-y-4">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Estilo de Renderização</label>
                  <StyleSelector styles={STYLE_OPTIONS} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">04. CUSTOMIZAÇÃO 3D</h2>
              <div className="space-y-6">
                <PlacementSelector placements={getPlacementOptionsForCategory(selectedCategories[0]?.name || 'Camiseta Básica (T-Shirt)')} 
                                   selectedPlacement={placement} onSelectPlacement={setPlacement} 
                                   disabled={selectedCategories.length > 1} currentCategory={selectedCategories[0]?.name} />
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase mb-3 block tracking-widest">Cor & Material Base</label>
                  <ColorSelector 
                    colors={COLOR_OPTIONS} 
                    selectedColor={selectedColor} 
                    onSelectColor={setSelectedColor}
                    selectedMaterial={selectedMaterial}
                    onSelectMaterial={setSelectedMaterial}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">05. ESCALA DE VARIAÇÕES</h2>
                <span className="text-xs font-black text-white bg-red-600/20 px-2 py-0.5 rounded border border-red-600/20">{variationsCount}x</span>
              </div>
              <div className="space-y-6">
                <div className="relative pt-2">
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1"
                        value={variationsCount}
                        onChange={(e) => setVariationsCount(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <div className="flex justify-between mt-2">
                        <span className="text-[8px] font-black text-gray-700 uppercase">Unitário</span>
                        <span className="text-[8px] font-black text-gray-700 uppercase">Produção em Lote</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 10].map(n => (
                    <button key={n} onClick={() => setVariationsCount(n)} 
                            className={`py-2 rounded-xl border font-black text-[10px] transition-all duration-300 ${variationsCount === n ? 'border-red-600 bg-red-600/20 text-white' : 'border-gray-800 text-gray-600 hover:border-gray-700 hover:bg-white/5'}`}>{n}v</button>
                    ))}
                </div>
              </div>
            </section>

            {/* Monetização Lateral */}
            <AdSpace type="vertical" className="my-6" />

            {/* Batch Summary Box */}
            {selectedCategories.length > 0 && (
                <div className="bg-black/60 p-4 rounded-2xl border border-red-900/20 animate-fade-in">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Resumo do Lote</p>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-300 uppercase">{selectedCategories.length} Produtos Selecionados</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{variationsCount} Variações por item</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-red-600">{totalRenders}</p>
                            <p className="text-[8px] font-black text-gray-600 uppercase">Total Renders</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4">
                <button onClick={handleGenerate} disabled={isGenerating || !uploadedImage || selectedCategories.length === 0}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-6 rounded-3xl shadow-[0_20px_40px_rgba(220,38,38,0.3)] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.3em] text-lg flex flex-col items-center justify-center">
                    {isGenerating ? (
                        <span>PROCESSANDO ({progress}%)...</span>
                    ) : (
                        <>
                            <span>EXECUTAR GERAÇÃO</span>
                            {totalRenders > 0 && <span className="text-[10px] opacity-60 tracking-[0.5em] mt-1">TOTAL: {totalRenders} IMAGENS</span>}
                        </>
                    )}
                </button>
                {error && <p className="text-red-500 mt-4 text-center text-[10px] font-black uppercase tracking-widest animate-pulse bg-red-500/10 p-3 rounded-xl border border-red-500/30">{error}</p>}
                
                {totalRenders > MAX_BATCH_SIZE && (
                    <p className="text-yellow-500 mt-3 text-center text-[8px] font-black uppercase tracking-widest italic leading-tight">
                        Atenção: O volume selecionado ({totalRenders}) excede o limite recomendado por execução ({MAX_BATCH_SIZE}).
                    </p>
                )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {/* Monetização Topo Resultados */}
            <AdSpace type="horizontal" className="mb-6" />

            <div className="bg-gray-900/30 backdrop-blur-md p-8 rounded-[3rem] border border-gray-800 min-h-[800px] shadow-2xl relative overflow-hidden">
              <div className="flex border-b border-gray-800 mb-8 gap-12 items-center justify-between">
                <div className="flex gap-12">
                    <button onClick={() => setActiveTab('current')} className={`pb-5 px-1 font-black uppercase text-[10px] tracking-[0.2em] transition-all relative ${activeTab === 'current' ? 'text-red-500' : 'text-gray-600 hover:text-gray-400'}`}>
                        RENDER ATUAL
                        {activeTab === 'current' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`pb-5 px-1 font-black uppercase text-[10px] tracking-[0.2em] transition-all relative ${activeTab === 'history' ? 'text-red-500' : 'text-gray-600 hover:text-gray-400'}`}>
                        HISTÓRICO DE PRODUÇÃO
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                    </button>
                </div>
                
                {activeTab === 'current' && generatedImages.length > 0 && (
                    <button 
                        onClick={handleDownloadAllZip}
                        disabled={isDownloadingZip}
                        className={`bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-full shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-all flex items-center gap-3 -translate-y-2 border border-red-500/20 active:scale-95 disabled:opacity-50`}
                    >
                        {isDownloadingZip ? (
                            <>
                                <div className="w-3 h-3 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                                Compactando...
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="h-4 w-4" /> 
                                Baixar Pacote Completo (ZIP)
                            </>
                        )}
                    </button>
                )}
              </div>

              {activeTab === 'current' ? (
                isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-[600px] space-y-12 text-center">
                    <div className="relative">
                        <div className="w-32 h-32 border-[6px] border-gray-800 border-t-red-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white drop-shadow-[0_0_10px_rgba(220,38,38,1)]">{progress}%</div>
                    </div>
                    <div className="space-y-4 max-w-md">
                        <p className="text-red-500 font-black text-3xl tracking-tighter uppercase italic">Renderização Ativa</p>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">Aguarde enquanto nossa rede neural projeta seu design com iluminação volumétrica e sombras fotorrealistas.</p>
                    </div>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fade-in pb-12">
                    {generatedImages.map((img, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-[2rem] shadow-2xl border border-white/5 bg-black">
                        <MockupPreview imageData={img.image} isLoading={false} onDelete={() => {}} 
                                       onOpen={() => setLightboxState({index: i, source: 'current'})} 
                                       originalFileName={originalFileName} onDownload={() => {}} />
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{img.category}</span>
                        </div>
                        {img.type && (
                            <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-xl border border-white/10 ${img.type === '3d' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white text-black'}`}>
                                {img.type === '3d' ? 'Render 3D Pro' : 'Captura Real'}
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center text-gray-800 border-4 border-dashed border-red-900/10 rounded-[4rem] group hover:border-red-600/20 transition-all">
                    <div className="p-8 bg-red-600/5 rounded-full mb-8 group-hover:scale-110 transition-transform">
                        <PhotoIcon className="h-24 w-24 opacity-10 group-hover:opacity-30 transition-opacity text-red-600"/>
                    </div>
                    <p className="font-black text-2xl uppercase tracking-tighter mb-3 text-gray-700">Studio Disponível</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-800">Selecione seus produtos e inicie a geração</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fade-in pb-12">
                  {history.map((item, i) => (
                    <div key={item.id} className="relative group rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-black transition-transform hover:scale-[1.02]">
                        <MockupPreview imageData={item.image} isLoading={false} onDelete={() => {}} 
                                       onOpen={() => setLightboxState({index: i, source: 'history'})} 
                                       originalFileName={item.originalFileName} onDownload={() => {}} />
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/20 shadow-2xl">
                            {new Date(item.date).toLocaleDateString()}
                        </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="col-span-2 text-center text-gray-800 py-48 font-black uppercase tracking-[0.4em] text-xs">
                        NENHUM REGISTRO LOCALIZADO
                    </div>
                  )}
                </div>
              )}
            </div>
            {showCongrats && <div className="p-6 bg-red-600 text-white rounded-3xl text-center font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(220,38,38,0.5)] animate-bounce text-xs">Geração Concluída: Verifique os resultados</div>}
          </div>
        </main>
      </div>

      <VoiceControl onUpdate={handleVoiceUpdate} hasUploadedImage={!!uploadedImage} />
      
      <Lightbox 
        isOpen={!!lightboxState} 
        image={lightboxState?.source === 'current' ? generatedImages[lightboxState.index]?.image : history[lightboxState?.index || 0]?.image} 
        onClose={() => setLightboxState(null)} 
        currentIndex={lightboxState?.index || 0} 
        totalImages={lightboxState?.source === 'current' ? generatedImages.length : history.length} 
        onNext={() => setLightboxState(prev => prev ? {...prev, index: (prev.index + 1) % (prev.source === 'current' ? generatedImages.length : history.length)} : null)}
        onPrev={() => setLightboxState(prev => prev ? {...prev, index: (prev.index - 1 + (prev.source === 'current' ? generatedImages.length : history.length)) % (prev.source === 'current' ? generatedImages.length : history.length)} : null)}
        hasNext={true}
        hasPrev={true}
      />

      <footer className="p-8 text-center bg-black border-t border-red-900/10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">&copy; 2025 Mockup Fácil Pro AI - Edição Dark & Red</p>
      </footer>
    </div>
  );
};
