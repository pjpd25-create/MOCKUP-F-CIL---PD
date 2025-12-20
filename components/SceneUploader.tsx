
import React, { useRef, useCallback, useState } from 'react';
import { UploadIcon, TrashIcon } from './icons';

interface SceneUploaderProps {
  onSceneUpload: (base64: string, mimeType: string) => void;
  onClearScene: () => void;
  sceneImage: string | null;
  sceneMimeType: string | null;
}

export const SceneUploader: React.FC<SceneUploaderProps> = ({ onSceneUpload, onClearScene, sceneImage, sceneMimeType }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 1280; // slightly larger for scenes

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height / width) * MAX_DIMENSION);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width / height) * MAX_DIMENSION);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const resultType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
                    resolve(canvas.toDataURL(resultType, 0.85));
                } else {
                    resolve(e.target?.result as string);
                }
            };
            img.onerror = (err) => reject(err);
            img.src = e.target?.result as string;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (validTypes.includes(file.type)) {
      try {
        setIsProcessing(true);
        const resizedDataUrl = await resizeImage(file);
        const base64String = resizedDataUrl.split(',')[1];
        const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        onSceneUpload(base64String, mimeType);
      } catch (err) {
        console.error("Error processing scene:", err);
        alert("Erro ao processar a imagem da cena.");
      } finally {
        setIsProcessing(false);
      }
    } else {
        alert("Por favor, envie um arquivo de imagem válido (PNG, JPG ou WEBP).");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    if (!sceneImage) {
      fileInputRef.current?.click();
    }
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (sceneImage) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
  }, [onSceneUpload, sceneImage]);

  const previewSrc = sceneImage && sceneMimeType ? `data:${sceneMimeType};base64,${sceneImage}` : null;

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <div
        className={`w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center ${!sceneImage ? 'cursor-pointer hover:border-red-500 hover:bg-gray-700' : ''} transition-colors duration-300 relative`}
        onClick={handleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {isProcessing ? (
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-t-red-600 border-gray-600 rounded-full animate-spin mb-2"></div>
             <p className="text-sm text-gray-400">Otimizando cena...</p>
           </div>
        ) : previewSrc ? (
          <img src={previewSrc} alt="Preview da Cena" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="h-12 w-12 mx-auto" />
            <p className="mt-2 font-semibold">Enviar cena de fundo</p>
            <p className="text-sm">PNG, JPG ou WEBP</p>
          </div>
        )}
      </div>
       {sceneImage && !isProcessing && (
             <button
              onClick={onClearScene}
              className="w-full mt-3 bg-red-900/50 text-red-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-red-900/80 transition-colors duration-300 border border-red-900"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Limpar Cena
            </button>
        )}
    </div>
  );
};
