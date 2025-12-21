
// Estrutura de Opções
interface MockupOption {
  type: 'apparel' | 'headwear' | 'drinkware' | 'stationery' | 'digital' | 'bags' | 'signage' | 'packaging' | 'vehicle' | 'merch' | 'books' | 'furniture' | 'social_media' | 'branding_kit' | 'corporate';
}

// Limite elevado para suportar produção massiva/ilimitada na percepção do usuário
export const MAX_BATCH_SIZE = 1000;

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
  // --- IDENTIDADE VISUAL E MARCAS (BRANDING) ---
  "Manual de Identidade Visual": { type: 'branding_kit' },
  "Apresentação de Logo (Grid)": { type: 'branding_kit' },
  "Papelaria Corporativa Completa": { type: 'branding_kit' },
  "Cartão de Visita Premium": { type: 'stationery' },
  "Pasta para Documentos de Agência": { type: 'corporate' },
  "Crachá e Cordão Executivo": { type: 'corporate' },
  "Papel Timbrado A4": { type: 'stationery' },
  "Kit Boas-Vindas Empresa": { type: 'branding_kit' },

  // --- REDES SOCIAIS E CONTEÚDO ---
  "Post Instagram (Feed 1:1)": { type: 'social_media' },
  "Carrossel de Conteúdo": { type: 'social_media' },
  "Story Instagram": { type: 'social_media' },
  "Capa de LinkedIn Corporativa": { type: 'social_media' },
  "Banner de Canal YouTube": { type: 'social_media' },
  "Template para Reels/TikTok": { type: 'social_media' },
  "Anúncio Facebook Ads": { type: 'social_media' },
  "Capa de Podcast": { type: 'social_media' },

  // --- VESTUÁRIO (Apparel) ---
  "Camiseta Polo": { type: 'apparel' },
  "Camiseta Manga Longa": { type: 'apparel' },
  "Regata": { type: 'apparel' },
  "Camiseta Básica (T-Shirt)": { type: 'apparel' },
  "Moletom Hoodie": { type: 'apparel' },
  "Uniforme Social Executivo": { type: 'apparel' },
  "Avental de Marca": { type: 'apparel' },

  // --- ACESSÓRIOS E MERCH ---
  "Boné Clássico": { type: 'headwear' },
  "Boné Trucker": { type: 'headwear' },
  "Caneta Metálica": { type: 'merch' },
  "Chaveiro": { type: 'merch' },
  "Mochila para Notebook": { type: 'bags' },
  "Ecobag de Algodão": { type: 'bags' },

  // --- BEBIDAS (DRINKWARE) ---
  "Caneca de Cerâmica": { type: 'drinkware' },
  "Garrafa Térmica (Tumbler)": { type: 'drinkware' },
  "Copo de Café Descartável": { type: 'drinkware' },

  // --- SINALIZAÇÃO E AMBIENTE ---
  "Fachada de Loja/Agência": { type: 'signage' },
  "Banner Roll-up": { type: 'signage' },
  "Outdoor Digital": { type: 'signage' },
  "Totem de Recepção": { type: 'signage' },
  "Adesivo de Veículo Corporativo": { type: 'vehicle' },

  // --- EMBALAGENS ---
  "Sacola de Papel Luxo": { type: 'packaging' },
  "Caixa de Envio E-commerce": { type: 'packaging' },
};

export const MOCKUP_CATEGORIES = Object.keys(MOCKUP_OPTIONS);

export const STYLE_OPTIONS: string[] = [
    "Fotorrealista (Alta Definição)",
    "Estúdio Minimalista Clean",
    "Escritório de Agência Moderno",
    "Estilo Lifestyle Urbano",
    "Cena Corporativa Executiva",
    "Social Media Vibe (Dinâmico)",
    "Luxo / Premium",
    "Renderização 3D Futurista",
    "Mão Segurando o Produto",
];

export const COLOR_OPTIONS: string[] = [
  "Branco Puro", 
  "Preto Piano", 
  "Cinza Espacial", 
  "Azul Real", 
  "Vermelho Vibrante", 
  "Verde Tiffany", 
  "Dourado Premium", 
  "Prata Metálico",
  "Rosa Millennial",
  "Roxo Agency",
  "Bege Minimalista"
];

const SIZES_BY_TYPE: { [key: string]: string[] } = {
  apparel: ["P", "M", "G", "GG"],
  headwear: ["Único"],
  drinkware: ["Padrão", "Grande"],
  stationery: ["A4", "A5", "Padrão"],
  books: ["Capa Dura", "Digital"],
  digital: ["Mobile", "Desktop"],
  bags: ["Média", "Grande"],
  signage: ["Padrão", "Grande Formato"],
  packaging: ["Padrão"],
  furniture: ["Executivo"],
  merch: ["Padrão"],
  social_media: ["1:1", "9:16", "16:9"],
  branding_kit: ["Completo"],
  corporate: ["Padrão"]
};

const PLACEMENTS_BY_TYPE: { [key: string]: string[] } = {
  apparel: ["Frente", "Costas", "Peito Esquerdo", "Manga"],
  headwear: ["Frente", "Lateral"],
  drinkware: ["Frente", "Envolvente"],
  stationery: ["Centralizado"],
  books: ["Capa"],
  digital: ["Tela"],
  bags: ["Frente"],
  signage: ["Centralizado"],
  packaging: ["Topo", "Frente"],
  furniture: ["Encosto"],
  merch: ["Centralizado"],
  social_media: ["Fundo Total", "Centralizado Overlay"],
  branding_kit: ["Visão Geral"],
  corporate: ["Centralizado"]
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
