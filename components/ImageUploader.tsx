
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon, SparklesIcon, TrashIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string, fileName: string) => void;
  onCleanImage: () => void;
  onRemoveImage: () => void;
  isCleaning: boolean;
  uploadedImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onCleanImage, onRemoveImage, isCleaning, uploadedImage }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (uploadedImage) {
      setPreview(`data:image/png;base64,${uploadedImage}`);
    } else {
      setPreview(null);
    }
  }, [uploadedImage]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 1024;

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
                    // Use png to preserve transparency unless it was jpeg originally
                    const resultType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
                    resolve(canvas.toDataURL(resultType, 0.9));
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
        // Ensure we use the correct mime type based on output
        const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        onImageUpload(base64String, mimeType, file.name);
      } catch (err) {
        console.error("Error optimizing image:", err);
        alert("Erro ao processar a imagem. Tente novamente.");
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
    if (!uploadedImage) {
      fileInputRef.current?.click();
    }
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (uploadedImage) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
  }, [uploadedImage]);

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
        className={`w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center ${!uploadedImage ? 'cursor-pointer hover:border-red-500 hover:bg-gray-700' : ''} transition-colors duration-300 relative`}
        onClick={handleClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {isProcessing ? (
           <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-t-red-600 border-gray-600 rounded-full animate-spin mb-2"></div>
             <p className="text-sm text-gray-400">Otimizando imagem...</p>
           </div>
        ) : preview ? (
          <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="h-12 w-12 mx-auto" />
            <p className="mt-2 font-semibold">Clique para enviar ou arraste e solte</p>
            <p className="text-sm">PNG, JPG ou WEBP</p>
          </div>
        )}
      </div>
      {uploadedImage && !isProcessing && (
        <div className="flex flex-col gap-2 mt-3">
            <button
            onClick={onCleanImage}
            disabled={isCleaning}
            className="w-full bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50"
            title="Usar IA para remover o fundo da imagem"
            >
            <SparklesIcon className="h-5 w-5 mr-2" />
            {isCleaning ? 'Removendo Fundo...' : 'Remover Fundo (IA)'}
            </button>

            <button
            onClick={onRemoveImage}
            className="w-full bg-red-900/50 text-red-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-red-900/80 transition-colors duration-300 border border-red-900"
            >
            <TrashIcon className="h-5 w-5 mr-2" />
            Remover Imagem
            </button>
        </div>
      )}
    </div>
  );
};
