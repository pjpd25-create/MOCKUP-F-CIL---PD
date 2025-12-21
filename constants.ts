
// Estrutura de Opções
interface MockupOption {
  type: 'apparel' | 'headwear' | 'drinkware' | 'stationery' | 'digital' | 'bags' | 'signage' | 'packaging' | 'vehicle' | 'merch' | 'books' | 'furniture';
}

export const MAX_BATCH_SIZE = 20;

export const BACKGROUND_TYPES = [
    { id: 'studio', label: 'Estúdio Isolado', description: 'Fundo limpo e profissional' },
    { id: 'lifestyle', label: 'Lifestyle / Realista', description: 'Ambiente de uso real' },
    { id: 'solid', label: 'Cor Sólida', description: 'Fundo na cor base do produto' },
    { id: 'custom', label: 'Cena Personalizada', description: 'Insira sua imagem real (Mockup segurando/pegando)' }
];

export const MATERIAL_OPTIONS = [
    { id: 'matte', label: 'Fosco (Matte)', description: 'Superfície sem brilho, toque suave' },
    { id: 'glossy', label: 'Brilhante', description: 'Reflexos nítidos e acabamento polido' },
    { id: 'metallic', label: 'Metálico', description: 'Brilho industrial e reflexos metálicos' },
    { id: 'fabric', label: 'Tecido / Fibra', description: 'Trama de fios e textura têxtil visível' },
    { id: 'leather', label: 'Couro / Couro Sintético', description: 'Padrão de grão e rugosidade natural' },
    { id: 'paper', label: 'Papel Premium', description: 'Textura de celulose ou offset' }
];

const MOCKUP_OPTIONS: { [key: string]: MockupOption } = {
  // --- VESTUÁRIO (Apparel) ---
  "Camiseta Polo": { type: 'apparel' },
  "Camiseta Manga Longa": { type: 'apparel' },
  "Regata": { type: 'apparel' },
  "Camiseta Básica (T-Shirt)": { type: 'apparel' },
  "Moletom com Capuz (Hoodie)": { type: 'apparel' },
  "Avental Profissional": { type: 'apparel' },

  // --- ACESSÓRIOS E MERCH ---
  "Boné Clássico": { type: 'headwear' },
  "Boné Trucker": { type: 'headwear' },
  "Caneta Personalizada": { type: 'merch' },
  "Chaveiro": { type: 'merch' },
  "Carteira de Couro": { type: 'merch' },
  "Canudo Ecológico": { type: 'merch' },

  // --- PAPELARIA E ESCRITÓRIO ---
  "Cartão de Visita": { type: 'stationery' },
  "Papel Timbrado A4": { type: 'stationery' },
  "Pasta Corporativa": { type: 'stationery' },
  "Diploma Premium": { type: 'stationery' },
  "Certificado": { type: 'stationery' },
  "Envelope Ofício": { type: 'stationery' },
  "Crachá com Cordão": { type: 'stationery' },

  // --- LIVROS E EBOOKS ---
  "E-book (Digital)": { type: 'digital' },
  "Livro Físico (Capa Dura)": { type: 'books' },
  "Livro Físico (Brochura)": { type: 'books' },
  "Revista / Magazine": { type: 'books' },

  // --- BOLSAS E MALAS ---
  "Bolsa Feminina": { type: 'bags' },
  "Mala de Viagem": { type: 'bags' },
  "Mochila Corporativa": { type: 'bags' },
  "Ecobag (Algodão)": { type: 'bags' },

  // --- BEBIDAS (DRINKWARE) ---
  "Caneca de Cerâmica": { type: 'drinkware' },
  "Garrafa Térmica": { type: 'drinkware' },
  "Copo de Café Descartável": { type: 'drinkware' },

  // --- MÓVEIS (FURNITURE) ---
  "Cadeira de Escritório": { type: 'furniture' },
  "Mesa de Reunião": { type: 'furniture' },

  // --- SINALIZAÇÃO E AMBIENTE ---
  "Fachada de Loja": { type: 'signage' },
  "Banner Roll-up": { type: 'signage' },
  "Outdoor": { type: 'signage' },

  // --- EMBALAGENS ---
  "Sacola de Papel": { type: 'packaging' },
  "Caixa de Envio": { type: 'packaging' },
};

export const MOCKUP_CATEGORIES = Object.keys(MOCKUP_OPTIONS);

export const STYLE_OPTIONS: string[] = [
    "Fotorrealista (Alta Definição)",
    "Estúdio (Fundo Infinito)",
    "Lifestyle Corporativo (Escritório)",
    "Estilo Mão Segurando Produto",
    "Estilo Pessoa Pegando o Objeto",
    "Minimalista Clean",
    "Luxo / Premium",
    "Renderização 3D Digital",
];

export const COLOR_OPTIONS: string[] = [
  "Branco", "Preto", "Cinza", "Azul Marinho", "Vermelho", "Verde Musgo", "Dourado", "Prata Metálico"
];

const SIZES_BY_TYPE: { [key: string]: string[] } = {
  apparel: ["P", "M", "G", "GG", "Infantil"],
  headwear: ["Tamanho Único"],
  drinkware: ["Padrão", "Grande"],
  stationery: ["A4", "A5", "Padrão"],
  books: ["Capa Dura", "Digital"],
  digital: ["Mobile", "Desktop"],
  bags: ["Pequena", "Média", "Grande"],
  signage: ["Padrão", "Grande Formato"],
  packaging: ["Pequeno", "Médio", "Grande"],
  furniture: ["Padrão", "Executivo"],
  merch: ["Padrão"],
};

const PLACEMENTS_BY_TYPE: { [key: string]: string[] } = {
  apparel: ["Frente Central", "Peito Esquerdo", "Peito Direito", "Costas Central", "Nuca", "Manga Esquerda", "Manga Direita"],
  headwear: ["Frente Central", "Lateral Esquerda", "Lateral Direita", "Traseira", "Aba Superior"],
  drinkware: ["Frente Central", "Envolvente 360", "Traseira"],
  stationery: ["Centralizado", "Canto Superior Esquerdo", "Canto Superior Direito", "Inferior Direita"],
  books: ["Capa Frontal", "Lombada", "Verso"],
  digital: ["Tela Principal"],
  bags: ["Frente Central", "Costas", "Lateral"],
  signage: ["Centralizado"],
  packaging: ["Topo da Tampa", "Frente Principal", "Lateral"],
  furniture: ["Encosto", "Tampo"],
  merch: ["Centralizado"],
};

export const getSizeOptionsForCategory = (category: string): string[] => {
    const option = MOCKUP_OPTIONS[category];
    return option ? SIZES_BY_TYPE[option.type] || SIZES_BY_TYPE['apparel'] : SIZES_BY_TYPE['apparel'];
};

export const getPlacementOptionsForCategory = (category: string): string[] => {
    const option = MOCKUP_OPTIONS[category];
    return option ? PLACEMENTS_BY_TYPE[option.type] || PLACEMENTS_BY_TYPE['apparel'] : PLACEMENTS_BY_TYPE['apparel'];
};

export const getCategoryType = (category: string): string => {
    return MOCKUP_OPTIONS[category]?.type || 'apparel';
};
