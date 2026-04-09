export const VALEUR_THEME = {
  colors: {
    black: '#050505',
    green: '#00FF00', // Neon green from brutalist recipe or dark green from identity
    darkGreen: '#002B24',
    champagne: '#D9B382',
    beige: '#F5E6D3',
    gray: '#8E9299',
  }
};

export const ICP_CRITERIA = {
  segments: [
    'Telecom',
    'Marketing Digital',
    'Energia Solar',
    'SaaS',
    'Serviços B2B'
  ],
  redFlags: [
    'Governo',
    'MKT Multinível / Pirâmide',
    'Imobiliária Minha Casa Minha Vida (sem escala)',
    'DropShipping',
    'Rifas e Sorteios',
    'Conteúdo Sexual / Sexshop',
    'Vendedor de Site',
    'Consultoria Concorrente',
    'Ponto de Venda (Varejo físico)',
    'Produto não validado',
    'Menos de 5 colaboradores',
    'Usinas Solares (projetos complexos únicos)',
    'Indústria Química/Navio/Petróleo',
    'Comércio Exterior',
    'E-commerce B2C'
  ],
  employeeRange: {
    min: 10,
    max: 50,
    ideal: '10-50'
  },
  roles: [
    'CEO',
    'Fundador',
    'Diretor Executivo',
    'Diretor Geral',
    'Diretor Corporativo',
    'Diretor Comercial'
  ],
  revenue: {
    min: 1200000, // 1.2M
    solarMin: 3000000 // 3M for Solar
  },
  structure: {
    minSDRs: 2,
    minClosers: 1
  },
  scoring: {
    base: 50,
    seniorRole: 30,
    targetSegment: 20,
    recentActivity: 10
  }
};

export const METHODOLOGY = {
  pillars: [
    { name: 'Pessoas', description: 'Treinamento, cultura e capacitação do time comercial.' },
    { name: 'Processos', description: 'Eficiência, previsibilidade e roteiros de trabalho.' },
    { name: 'Canais de Venda', description: 'Diversificação (Social Seller, Copy Seller, Hunter).' }
  ],
  frameworks: [
    { name: 'NEPQ', description: 'Neuro-Emotional Persuasion Questions - Vendas consultivas baseadas em perguntas emocionais.' },
    { name: 'AIDA', description: 'Atenção, Interesse, Desejo, Ação - Técnica para condução do lead.' },
    { name: 'ICE Score', description: 'Qualificação por Intensidade, Confiança e Facilidade.' },
    { name: 'DISC', description: 'Perfis comportamentais: Dominante, Influente, Estável, Conforme.' }
  ]
};
