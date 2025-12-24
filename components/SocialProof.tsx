
import React, { useState, useEffect } from 'react';
import { CubeIcon } from './icons';

const FIRST_NAMES = ['Ricardo', 'Mariana', 'João', 'Felipe', 'Beatriz', 'Gustavo', 'Camila', 'Tiago', 'Larissa', 'André'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];

const generateNamePool = () => {
    const pool: string[] = [];
    for (const first of FIRST_NAMES) {
        for (const last of LAST_NAMES) {
            pool.push(`${first} ${last}`);
        }
    }
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
};

const namePool = generateNamePool();

export const SocialProof: React.FC<{ inline?: boolean; variant?: 'tiny' | 'normal' }> = ({ inline = false, variant = 'normal' }) => {
    const [visible, setVisible] = useState(false);
    const [currentName, setCurrentName] = useState('');
    const [mockupCount, setMockupCount] = useState(1);
    const [nameIndex, setNameIndex] = useState(Math.floor(Math.random() * namePool.length));

    useEffect(() => {
        const showToast = () => {
            const nextIndex = (nameIndex + 1) % namePool.length;
            setNameIndex(nextIndex);
            setCurrentName(namePool[nextIndex]);
            setMockupCount(Math.floor(Math.random() * 14) + 2);
            setVisible(true);
            setTimeout(() => setVisible(false), 8000);
        };
        const initialTimer = setTimeout(showToast, inline ? 500 : 2000);
        const interval = setInterval(showToast, 15000);
        return () => { clearTimeout(initialTimer); clearInterval(interval); };
    }, [nameIndex, inline]);

    if (inline) {
        return (
            <div className="h-8 w-full flex items-center justify-center overflow-hidden">
                <div className={`flex items-center gap-3 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
                    <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.2em] text-center">
                        <span className="text-white">{currentName}</span> PRODUZIU {mockupCount} BRANDINGS
                    </p>
                </div>
            </div>
        );
    }

    if (!visible) return null;

    return (
        <div className="fixed bottom-10 left-10 z-[60] animate-fade-in-up pointer-events-none">
            <div className="bg-brand-navy/95 backdrop-blur-2xl border border-orange-500/30 p-5 pr-8 rounded-[2rem] shadow-[0_30px_70px_rgba(249,115,22,0.2)] flex items-center gap-5">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <CubeIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex flex-col">
                    <p className="text-[12px] font-black text-white uppercase tracking-widest mb-1">
                        {currentName}
                    </p>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">
                        CONCLUIU {mockupCount} PROJETOS COM IA
                    </p>
                </div>
                <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-brand-navy animate-pulse" />
                </div>
            </div>
        </div>
    );
};
