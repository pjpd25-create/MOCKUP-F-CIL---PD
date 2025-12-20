
import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon, XMarkIcon, PlayIcon, PauseIcon, RedoIcon } from './icons';
import { processVoiceCommand } from '../services/geminiService';
import { MOCKUP_CATEGORIES, STYLE_OPTIONS, COLOR_OPTIONS } from '../constants';

interface VoiceControlProps {
  onUpdate: (data: { categories?: string[], style?: string, color?: string, placement?: string, _autoGenerate?: boolean }) => void;
  onInteractionChange?: (isActive: boolean) => void;
  hasUploadedImage: boolean;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onUpdate, onInteractionChange, hasUploadedImage }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('');

  useEffect(() => {
    if (onInteractionChange) {
      const isActive = isRecording || !!audioBlob || isProcessing;
      onInteractionChange(isActive);
    }
  }, [isRecording, audioBlob, isProcessing, onInteractionChange]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!hasUploadedImage) {
        alert("Carregue seu design antes de usar o comando de voz.");
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
      let supportedType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          supportedType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType });
      mediaRecorderRef.current = mediaRecorder;
      mimeTypeRef.current = supportedType;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        setAudioBlob(blob);
        if (timerRef.current) clearInterval(timerRef.current);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setAudioBlob(null);
      setTimerSeconds(0);
      timerRef.current = window.setInterval(() => setTimerSeconds(prev => prev + 1), 1000);

    } catch (err) {
      console.error("Erro microfone:", err);
      alert("Acesso ao microfone negado ou não disponível.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePlayback = () => {
      if (isPlaying) {
          audioRef.current?.pause();
          setIsPlaying(false);
      } else if (audioBlob) {
          if (!audioRef.current) {
              audioRef.current = new Audio(URL.createObjectURL(audioBlob));
              audioRef.current.onended = () => setIsPlaying(false);
          }
          audioRef.current.play();
          setIsPlaying(true);
      }
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        try {
            const result = await processVoiceCommand(base64Audio, audioBlob.type, MOCKUP_CATEGORIES, STYLE_OPTIONS, COLOR_OPTIONS);
            const updateData: any = {};
            if (result.categories) updateData.categories = result.categories.filter(c => MOCKUP_CATEGORIES.includes(c));
            if (result.style) updateData.style = result.style;
            if (result.color) updateData.color = result.color;
            if (result.placement) updateData.placement = result.placement;
            
            onUpdate({ ...updateData, _autoGenerate: true });
        } catch (e) {
            alert("Não entendi. Tente ser mais específico.");
        } finally {
            setIsProcessing(false);
            setAudioBlob(null);
            setTimerSeconds(0);
        }
    };
  };

  const handleDiscard = () => {
    setAudioBlob(null);
    setTimerSeconds(0);
    setIsPlaying(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Painel de Revisão e Timer */}
      {(isRecording || audioBlob) && !isProcessing && (
        <div className="flex flex-col items-end gap-2 animate-fade-in-up">
            {/* Display do Timer */}
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'bg-gray-600'}`}></div>
                <span className="text-white font-mono font-bold text-sm tracking-widest">{formatTime(timerSeconds)}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{isRecording ? 'Gravando' : 'Revisar'}</span>
            </div>

            {/* Controles de Reprodução Pós-Gravação */}
            {audioBlob && (
                <div className="flex gap-2">
                    <button onClick={togglePlayback} className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg border border-gray-700 transition-all hover:scale-110">
                        {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                    </button>
                    <button onClick={handleDiscard} className="bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white p-4 rounded-full shadow-lg border border-red-900/50 transition-all hover:scale-110" title="Descartar e Refazer">
                        <RedoIcon className="h-6 w-6" />
                    </button>
                </div>
            )}
        </div>
      )}

      {/* Botão Principal Dinâmico */}
      <div className="relative group">
          <button
            onClick={isProcessing ? undefined : (audioBlob ? handleSend : (isRecording ? stopRecording : startRecording))}
            disabled={isProcessing}
            className={`p-5 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center relative ${
                isProcessing ? 'bg-gray-700 cursor-wait' : 
                (audioBlob ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500')
            }`}
          >
            {isProcessing ? <div className="w-8 h-8 border-4 border-t-white border-white/20 rounded-full animate-spin"></div> :
             (audioBlob ? <PaperAirplaneIcon className="h-8 w-8 text-white" /> :
              (isRecording ? <StopIcon className="h-8 w-8 text-white" /> : <MicrophoneIcon className="h-8 w-8 text-white" />))}
            
            {/* Tooltip Lateral */}
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all border border-gray-800 shadow-xl">
                {isProcessing ? 'Processando IA...' : (audioBlob ? 'Enviar Comando' : (isRecording ? 'Parar e Revisar' : 'Comando de Voz'))}
            </span>
          </button>
      </div>
    </div>
  );
};
