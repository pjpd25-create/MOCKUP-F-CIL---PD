
// Estrutura de Opções
interface MockupOption {
  type: 'apparel' | 'headwear' | 'drinkware' | 'stationery' | 'digital' | 'bags' | 'signage' | 'packaging' | 'vehicle' | 'merch' | 'books';
}

export const MAX_BATCH_SIZE = 20;

export const BACKGROUND_TYPES = [
    { id: 'studio', label: 'Estúdio Isolado', description: 'Fundo limpo e profissional' },
    { id: 'lifestyle', label: 'Lifestyle / Realista', description: 'Ambiente de uso real' },
    { id: 'solid', label: 'Cor Sólida', description: 'Fundo na cor base do produto' },
    { id: 'custom', label: 'Cena Personalizada', description: 'Use sua própria imagem de fundo' }
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
  "Camiseta Gola Polo": { type: 'apparel' },
  "Camisa Social (Uniforme)": { type: 'apparel' },
  "Camiseta Gola V": { type: 'apparel' },
  "Camiseta Oversized": { type: 'apparel' },
  "Avental Profissional": { type: 'apparel' },
  "Colete Operacional": { type: 'apparel' },
  "Jaqueta Corporativa": { type: 'apparel' },
  "Moletom com Capuz (Hoodie)": { type: 'apparel' },
  "Moletom Careca (Sweatshirt)": { type: 'apparel' },
  "Uniforme de Futebol": { type: 'apparel' },
  "Camiseta Infantil": { type: 'apparel' },
  "Body de Bebê": { type: 'apparel' },

  // --- ACESSÓRIOS DE CABEÇA ---
  "Boné Clássico": { type: 'headwear' },
  "Boné Trucker": { type: 'headwear' },
  "Viseira": { type: 'headwear' },
  "Chapéu Bucket": { type: 'headwear' },
  "Gorro (Beanie)": { type: 'headwear' },
  "Capacete de Segurança": { type: 'headwear' },

  // --- PAPELARIA E ESCRITÓRIO ---
  "Cartão de Visita": { type: 'stationery' },
  "Papel Timbrado A4": { type: 'stationery' },
  "Pasta Corporativa": { type: 'stationery' },
  "Envelope Ofício": { type: 'stationery' },
  "Envelope Saco (A4)": { type: 'stationery' },
  "Crachá com Cordão": { type: 'stationery' },
  "Caderno Moleskine": { type: 'stationery' },
  "Bloco de Notas": { type: 'stationery' },
  "Agenda": { type: 'stationery' },
  "Calendário de Mesa": { type: 'stationery' },
  "Carimbo Corporativo": { type: 'stationery' },

  // --- LIVROS E EBOOKS ---
  "E-book (Digital)": { type: 'digital' },
  "Livro Físico (Capa Dura)": { type: 'books' },
  "Livro Físico (Brochura)": { type: 'books' },
  "Revista / Magazine": { type: 'books' },

  // --- BRINDES E MERCHANDISING ---
  "Caneta Personalizada": { type: 'merch' },
  "Chaveiro": { type: 'merch' },
  "Mouse Pad": { type: 'merch' },
  "Pen Drive": { type: 'merch' },
  "Botton / Pin": { type: 'merch' },
  "Guarda-chuva": { type: 'merch' },
  "Carteira de Couro": { type: 'merch' },
  "Ecobag (Algodão)": { type: 'bags' },
  "Mochila Corporativa": { type: 'bags' },
  "Bolsa de Viagem": { type: 'bags' },

  // --- BEBIDAS (DRINKWARE) ---
  "Caneca de Cerâmica": { type: 'drinkware' },
  "Garrafa Térmica": { type: 'drinkware' },
  "Copo de Café Descartável": { type: 'drinkware' },
  "Copo Térmico (Tumbler)": { type: 'drinkware' },
  "Taça de Vinho": { type: 'drinkware' },
  "Lata de Bebida": { type: 'packaging' },

  // --- FROTA E VEÍCULOS ---
  "Carro de Passeio": { type: 'vehicle' },
  "Van de Entrega": { type: 'vehicle' },
  "Caminhão Baú": { type: 'vehicle' },
  "Moto de Entrega": { type: 'vehicle' },

  // --- DIGITAL ---
  "Smartphone": { type: 'digital' },
  "Laptop / MacBook": { type: 'digital' },
  "Tablet": { type: 'digital' },
  "Post de Rede Social": { type: 'digital' },
  "Assinatura de E-mail": { type: 'digital' },

  // --- SINALIZAÇÃO E AMBIENTE ---
  "Fachada de Loja": { type: 'signage' },
  "Placa de Recepção": { type: 'signage' },
  "Banner Roll-up": { type: 'signage' },
  "Bandeira Wind Banner": { type: 'signage' },
  "Outdoor": { type: 'signage' },
  "Totem Informativo": { type: 'signage' },
  "Tapete Personalizado": { type: 'signage' },

  // --- EMBALAGENS ---
  "Sacola de Papel": { type: 'packaging' },
  "Caixa de Envio": { type: 'packaging' },
  "Embalagem Stand-up Pouch": { type: 'packaging' },
  "Etiqueta (Tag)": { type: 'packaging' },
  "Papel de Seda": { type: 'packaging' },
};

export const MOCKUP_CATEGORIES = Object.keys(MOCKUP_OPTIONS);

export const STYLE_OPTIONS: string[] = [
    "Fotorrealista (Alta Definição)",
    "Estúdio (Fundo Infinito)",
    "Lifestyle Corporativo (Escritório)",
    "Lifestyle Urbano (Rua)",
    "Minimalista Clean",
    "Flat Lay (Vista de cima)",
    "Iluminação Dramática",
    "Luz Natural (Externo)",
    "Luxo / Premium",
    "Renderização 3D Digital",
    "Mockup Vetorial (Flat)",
];

export const COLOR_OPTIONS: string[] = [
  "Branco",
  "Preto",
  "Cinza Mescla",
  "Azul Marinho",
  "Azul Royal",
  "Vermelho",
  "Verde Musgo",
  "Verde Bandeira",
  "Amarelo Ouro",
  "Laranja",
  "Roxo",
  "Vinho / Bordô",
  "Beige / Areia",
  "Kraft (Papel Pardo)",
  "Transparente / Vidro",
  "Prata Metálico",
  "Dourado",
];

const SIZES_BY_TYPE: { [key: string]: string[] } = {
  apparel: ["P", "M", "G", "GG", "XG", "Infantil", "Unissex"],
  headwear: ["Tamanho Único", "Ajustável"],
  drinkware: ["Padrão (325ml)", "Grande (500ml)", "Garrafa (750ml)"],
  stationery: ["Padrão", "A4", "A5", "Cartão (9x5cm)"],
  books: ["Capa Dura", "Capa Comum", "Bolso"],
  digital: ["Tela Cheia", "Modo Retrato", "Modo Paisagem"],
  bags: ["Pequena", "Média", "Grande"],
  signage: ["Padrão", "Grande Formato", "Painel Vertical"],
  packaging: ["Pequeno", "Médio", "Grande", "Caixa de Sapato"],
  vehicle: ["Compacto", "Sedan", "Utilitário", "Caminhão"],
  merch: ["Padrão", "Pequeno", "Miniatura"],
};

const PLACEMENTS_BY_TYPE: { [key: string]: string[] } = {
  apparel: [
    "Frente Central",
    "Peito Esquerdo (Bolso)",
    "Peito Direito",
    "Costas Central",
    "Nuca (Costas Superior)",
    "Manga Esquerda",
    "Manga Direita",
    "Estampa Total",
  ],
  headwear: [
    "Frente Central (Testa)",
    "Lateral Esquerda",
    "Lateral Direita",
    "Aba (Topo)",
    "Traseira (Acima do Fecho)",
  ],
  drinkware: [
    "Frente Central",
    "Verso Central",
    "Logo Vertical (Lateral)",
    "Envolvente (Wrap 360°)",
  ],
  stationery: [
    "Centralizado",
    "Canto Sup. Esquerdo",
    "Canto Sup. Direito",
    "Canto Inf. Direito",
    "Marca d'água Central",
  ],
  books: [
    "Capa Frontal",
    "Lombada",
    "Capa Traseira",
    "Orelha Interna",
  ],
  digital: [
    "Centralizado (Papel de Parede)",
    "Ícone de App",
    "Cabeçalho (Header)",
    "Grade de Feed",
  ],
  bags: [
    "Frente Central",
    "Frente Bolso",
    "Canto Inferior Discreto",
  ],
  signage: [
    "Centralizado (Destaque)",
    "Topo (Cabeçalho)",
    "Rodapé (Informações)",
    "Preenchimento Total",
  ],
  packaging: [
    "Topo da Tampa",
    "Frente Central",
    "Lateral (Informação)",
    "Padrão Repetido",
  ],
  vehicle: [
    "Porta do Motorista",
    "Porta do Passageiro",
    "Lateral Total",
    "Capô (Frente)",
    "Traseira (Porta-malas)",
  ],
  merch: [
    "Centralizado",
    "Discreto (Canto)",
    "Verso",
  ],
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
