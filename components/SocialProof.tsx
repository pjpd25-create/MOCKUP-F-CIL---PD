
import React, { useState, useEffect } from 'react';
import { CubeIcon } from './icons';

const FIRST_NAMES = [
    'Ricardo', 'Mariana', 'João', 'Felipe', 'Beatriz', 
    'Gustavo', 'Camila', 'Tiago', 'Larissa', 'André',
    'Eduardo', 'Fernanda', 'Lucas', 'Sofia', 'Rodrigo',
    'Marcos', 'Juliana', 'Patrícia', 'Roberto', 'Daniela',
    'Victor', 'Amanda', 'Bruna', 'Gabriel', 'Rafaela'
];

const LAST_NAMES = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 
    'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 
    'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 
    'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 
    'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira'
];

// Gerador de combinações únicas embaralhadas
const generateNamePool = () => {
    const pool: string[] = [];
    for (const first of FIRST_NAMES) {
        for (const last of LAST_NAMES) {
            pool.push(`${first} ${last}`);
        }
    }
    // Fisher-Yates shuffle
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
            setMockupCount(Math.floor(Math.random() * 14) + 2); // De 2 a 15 mockups
            setVisible(true);

            // Dura 10 segundos na tela como solicitado
            setTimeout(() => {
                setVisible(false);
            }, 10000);
        };

        // Delay inicial
        const initialTimer = setTimeout(showToast, inline ? 500 : 2000);
        
        // Ciclo total de 13 segundos (10s visível + 3s intervalo)
        const interval = setInterval(showToast, 13000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [nameIndex, inline]);

    if (inline) {
        // Altura fixa para evitar layout shift ("tremer a tela")
        const containerHeight = variant === 'tiny' ? 'h-6' : 'h-10';
        
        return (
            <div className={`${containerHeight} w-full flex items-center justify-center overflow-hidden transition-all duration-500`}>
                <div className={`flex items-center justify-center gap-2 transition-all duration-700 ease-out ${visible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-2'}`}>
                    <div className={`${variant === 'tiny' ? 'w-1 h-1' : 'w-1.5 h-1.5'} bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]`} />
                    <p className={`${variant === 'tiny' ? 'text-[7px]' : 'text-[10px] md:text-[11px]'} font-black text-gray-500 uppercase tracking-widest text-center`}>
                        O <span className="text-white">{currentName}</span> fez {mockupCount} mockups com sucesso!
                    </p>
                </div>
            </div>
        );
    }

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[60] animate-fade-in-up pointer-events-none">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-red-600/30 p-4 pr-6 rounded-2xl shadow-[0_20px_60px_rgba(220,38,38,0.2)] flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                    <CubeIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">
                        O {currentName}
                    </p>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter leading-none">
                        fez {mockupCount} mockups com sucesso!
                    </p>
                </div>
                <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(15px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
