
import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, RedoIcon, TrashIcon, ExpandIcon, ShareIcon } from './icons';

// Adiciona jsPDF ao escopo da window para o TypeScript
declare global {
    interface Window {
        jspdf: any;
    }
}

interface MockupPreviewProps {
  imageData: string | null;
  isLoading: boolean;
  onRemake?: () => void;
  onDelete: () => void;
  originalFileName: string | null;
  onDownload: () => void;
  onOpen: () => void; // Callback para abrir o Lightbox pai
}

type DownloadFormat = 'png' | 'jpg' | 'pdf';
type DownloadStep = 'none' | 'format' | 'action';

export const MockupPreview: React.FC<MockupPreviewProps> = ({ 
    imageData, 
    isLoading, 
    onRemake, 
    onDelete, 
    originalFileName, 
    onDownload,
    onOpen
}) => {
  const [downloadStep, setDownloadStep] = useState<DownloadStep>('none');
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const getCleanFileName = () => {
      const name = originalFileName || 'design';
      return name.split('.').slice(0, -1).join('.');
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDownloadStep('none');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFormatSelect = (format: DownloadFormat) => {
      setSelectedFormat(format);
      setDownloadStep('action');
  }

  // Função robusta para converter Data URI em Blob usando fetch
  const dataUriToBlob = async (dataUri: string): Promise<Blob> => {
      const res = await fetch(dataUri);
      return await res.blob();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageData || isSharing) return;

    setIsSharing(true);
    try {
        const cleanBase64 = imageData.replace(/[\n\r]/g, '');
        const blob = await dataUriToBlob(`data:image/png;base64,${cleanBase64}`);
        const file = new File([blob], `${getCleanFileName()}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Meu Mockup Profissional',
                text: 'Confira este mockup incrível que gerei com o Mockup Fácil!',
            });
        } else {
            // Fallback: Tenta copiar a imagem para a área de transferência
            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                alert("Imagem copiada para a área de transferência! Você pode colá-la onde desejar compartilhar.");
            } else {
                alert("Compartilhamento nativo não suportado neste navegador. Use o botão de download.");
            }
        }
    } catch (err: any) {
        // Ignora erros de aborto (quando o usuário cancela o compartilhamento)
        if (err.name !== 'AbortError') {
            console.error("Erro ao compartilhar:", err);
            alert("Ocorreu um erro ao tentar compartilhar a imagem.");
        }
    } finally {
        setIsSharing(false);
    }
  };

  const handleActionSelect = async (action: 'download' | 'open') => {
    if (!imageData || !selectedFormat) return;
    
    onDownload();

    const cleanBase64 = imageData.replace(/[\n\r]/g, '');
    const imageSrc = `data:image/png;base64,${cleanBase64}`;
    
    let finalDataUrl = imageSrc;
    let fileName = `${getCleanFileName()}-mockup.${selectedFormat}`;

    const convertToJpg = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                } else {
                    reject(new Error("Falha ao criar contexto do Canvas"));
                }
            };
            img.onerror = (e) => reject(e);
        });
    };

    const convertToPdf = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const { jsPDF } = window.jspdf;
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [img.width, img.height]
                });
                pdf.addImage(img.src, 'PNG', 0, 0, img.width, img.height);
                resolve(pdf.output('datauristring'));
            };
            img.onerror = (e) => reject(e);
        });
    };
    
    try {
        if (selectedFormat === 'jpg') finalDataUrl = await convertToJpg();
        if (selectedFormat === 'pdf') finalDataUrl = await convertToPdf();

        const blob = await dataUriToBlob(finalDataUrl);
        const blobUrl = window.URL.createObjectURL(blob);

        if (action === 'open') {
            window.open(blobUrl, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000); 
        } else {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        }

    } catch (error) {
        console.error("Erro ao processar imagem:", error);
        alert("Erro ao processar o arquivo. Tente novamente.");
    }

    setDownloadStep('none');
    setSelectedFormat(null);
  };

  const handleImageClick = () => {
    if (imageData && !isLoading) {
      onOpen();
    }
  };

  return (
    <>
      <div className="relative group">
        <div 
            className={`aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative ${imageData && !isLoading ? 'cursor-zoom-in' : ''}`}
            onClick={handleImageClick}
        >
          {imageData ? (
            <>
                <img src={`data:image/png;base64,${imageData}`} alt="Mockup Gerado" className="w-full h-full object-cover" />
                {!isLoading && (
                    <div className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none backdrop-blur-sm">
                        <ExpandIcon className="h-5 w-5" />
                    </div>
                )}
            </>
          ) : (
          <div className="text-center text-gray-500 p-4">
              <p>Falha na geração.</p>
              <p className="text-sm">Tente refazer.</p>
          </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-red-500 border-gray-600 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {imageData && !isLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 w-max max-w-[95%] justify-center flex-wrap">
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    setDownloadStep(prev => prev === 'none' ? 'format' : 'none');
                }}
                className="bg-gray-900/90 backdrop-blur-sm text-gray-100 font-bold py-2 px-3 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center text-[11px] uppercase tracking-tighter"
              >
                <DownloadIcon className="h-4 w-4 mr-1.5" />
                Baixar
              </button>
              
              {downloadStep === 'format' && (
                <div className="absolute bottom-full mb-2 w-40 -left-10 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-2 z-10">
                  <p className="text-[10px] font-black text-gray-500 mb-2 px-2 uppercase tracking-widest">Formato:</p>
                  <button onClick={() => handleFormatSelect('png')} className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-red-600 rounded-lg transition-colors mb-1 font-bold">PNG</button>
                  <button onClick={() => handleFormatSelect('jpg')} className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-red-600 rounded-lg transition-colors mb-1 font-bold">JPG</button>
                  <button onClick={() => handleFormatSelect('pdf')} className="block w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-red-600 rounded-lg transition-colors font-bold">PDF</button>
                </div>
              )}

              {downloadStep === 'action' && (
                <div className="absolute bottom-full mb-2 w-56 -left-16 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-3 z-10">
                  <p className="text-[10px] font-black text-gray-500 mb-3 text-center border-b border-gray-700 pb-2 uppercase tracking-widest">Visualização</p>
                  <button 
                      onClick={() => handleActionSelect('download')} 
                      className="w-full text-center px-3 py-2 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors mb-2 font-black uppercase tracking-widest"
                  >
                      Salvar Arquivo
                  </button>
                  <button 
                      onClick={() => handleActionSelect('open')} 
                      className="w-full text-center px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors font-black uppercase tracking-widest"
                  >
                      Abrir Nova Aba
                  </button>
                </div>
              )}
            </div>
            
            <button
                onClick={handleShare}
                disabled={isSharing}
                className={`bg-gray-900/90 backdrop-blur-sm text-gray-100 font-bold py-2 px-3 rounded-full shadow-lg transition-all flex items-center text-[11px] uppercase tracking-tighter ${isSharing ? 'opacity-50 cursor-wait' : 'hover:bg-red-600'}`}
                title="Compartilhar Mockup"
            >
                <ShareIcon className="h-4 w-4 mr-1.5" />
                {isSharing ? 'Abrindo...' : 'Partilhar'}
            </button>

            {onRemake && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemake(); }}
                className="bg-gray-900/90 backdrop-blur-sm text-gray-100 font-bold py-2 px-3 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center text-[11px] uppercase tracking-tighter"
              >
                <RedoIcon className="h-4 w-4 mr-1.5" />
                Refazer
              </button>
            )}
            
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="bg-red-900/90 backdrop-blur-sm text-red-100 font-bold py-2 px-3 rounded-full shadow-lg hover:bg-red-700 transition-all flex items-center text-[11px] uppercase tracking-tighter"
            >
              <TrashIcon className="h-4 w-4 mr-1.5" />
              Limpar
            </button>
          </div>
        )}

        {!imageData && !isLoading && onRemake && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={onRemake}
                  className="bg-red-600/90 backdrop-blur-sm text-white font-black py-2 px-6 rounded-full shadow-xl hover:bg-red-500 transition-all flex items-center uppercase text-xs tracking-widest"
                >
                  <RedoIcon className="h-4 w-4 mr-2" />
                  Repetir
                </button>
            </div>
        )}
      </div>
    </>
  );
};
