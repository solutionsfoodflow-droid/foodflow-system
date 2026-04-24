// Centralized mock DB for FoodFlow MVP
export type Role = 'operacional' | 'supervisor' | 'coordenador' | 'gerente';
export type UserType = 'admin' | 'cliente';

export interface User {
  id: string;
  login: string;
  senha?: string;
  nome: string;
  perfil: UserType;
  clienteId?: string; // only if type is 'cliente'
}

export interface Client {
  id: string;
  nome: string;
  slug: string;
  status: 'ativo' | 'inativo';
  logoUrl?: string; // Optional client logo for co-branding
  primaryColor?: string; // Optional support color
}

export interface CultureItem {
  id: string;
  clienteId: string;
  titulo: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
}

export interface CultureResponse {
  id: string;
  clienteId: string;
  respondenteNome: string;
  cargo: string;
  nivel: Role;
  setor: string;
  supervisor: string;
  data: string; // ISO String
  respostas: Array<{
    itemId: string;
    nota: number; // 1-5
    justificativa: string;
  }>;
}

// Temperament setup
export interface TemperamentQuestion {
  id: string;
  texto: string;
  tipo: 'afirmacao';
  perfilAssociado: 'executor' | 'comunicador' | 'planejador' | 'analista'; // Simple mock categories
}

export interface TemperamentResponse {
  id: string;
  clienteId: string;
  respondenteNome: string;
  cargo: string;
  nivel: Role;
  setor: string;
  data: string; // ISO String
  respostas: Record<string, number>; // questionId -> 1-5 score
  resultadoCalculado: string;
}

const INITIAL_USERS: User[] = [
  { id: 'u1', login: 'admin', senha: '123', nome: 'Administrador FoodFlow', perfil: 'admin' },
  { id: 'u2', login: 'cliente1', senha: '123', nome: 'Gestor Colombina', perfil: 'cliente', clienteId: 'c1' },
  { id: 'u3', login: 'cliente2', senha: '123', nome: 'Gestor Alplastic', perfil: 'cliente', clienteId: 'c2' },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', nome: 'Cervejaria Colombina', slug: 'colombina', status: 'ativo' },
  { id: 'c2', nome: 'Alplastic', slug: 'alplastic', status: 'ativo' }
];

const INITIAL_CULTURE_ITEMS: CultureItem[] = [
  {
    id: 'ci1', clienteId: 'c1', ordem: 1, ativo: true,
    titulo: 'Foco no Cliente',
    descricao: 'Cumprir prazos e especificações técnicas de qualidade para atender o cliente no prazo e qualidade que ele deseja.'
  },
  {
    id: 'ci2', clienteId: 'c1', ordem: 2, ativo: true,
    titulo: 'Segurança Operacional',
    descricao: 'Seguir rigorosamente normas de segurança do trabalho e segurança alimentar no manuseio de insumos.'
  },
  {
    id: 'ci3', clienteId: 'c2', ordem: 1, ativo: true,
    titulo: 'Inovação e Qualidade',
    descricao: 'Buscar o aprimoramento contínuo dos processos plásticos com menor desperdício.'
  }
];

const INITIAL_TEMP_QUESTIONS: TemperamentQuestion[] = [
  { id: 'tq1', texto: 'Ajo rápido e foco em fechar a tarefa imediatamente.', tipo: 'afirmacao', perfilAssociado: 'executor' },
  { id: 'tq2', texto: 'Gosto de envolver as pessoas e manter o clima animado.', tipo: 'afirmacao', perfilAssociado: 'comunicador' },
  { id: 'tq3', texto: 'Preciso de passos claros e prezo pela organização a longo prazo.', tipo: 'afirmacao', perfilAssociado: 'planejador' },
  { id: 'tq4', texto: 'Sou motivado pela exatidão, analisando os dados antes de agir.', tipo: 'afirmacao', perfilAssociado: 'analista' }
];

const DB_KEY = '@FoodFlow:DB';

interface DBStructure {
  clients: Client[];
  cultureItems: CultureItem[];
  cultureResponses: CultureResponse[];
  temperamentQuestions: TemperamentQuestion[];
  temperamentResponses: TemperamentResponse[];
}

export const getDB = (): DBStructure => {
  const data = localStorage.getItem(DB_KEY);
  if (data) return JSON.parse(data);
  
  // Seed the DB
  const initialDb: DBStructure = {
    clients: INITIAL_CLIENTS,
    cultureItems: INITIAL_CULTURE_ITEMS,
    cultureResponses: [],
    temperamentQuestions: INITIAL_TEMP_QUESTIONS,
    temperamentResponses: [],
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

const saveDB = (db: DBStructure) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const api = {
  login: (login: string, senha?: string): User | null => {
    // For MVP, simple login check against INITIAL_USERS
    // We intentionally allow "admin"/"admin" etc as requested
    // Wait, the requested credentials were:
    // admin: admin/admin
    // cliente1: cliente1/cliente1
    // cliente2: cliente2/cliente2

    const validPasswords = {
      'admin': 'admin',
      'cliente1': 'cliente1',
      'cliente2': 'cliente2'
    };

    const user = INITIAL_USERS.find(u => u.login === login);
    if (!user) return null;
    
    // @ts-ignore
    if (senha === validPasswords[login] || senha === validPasswords[login]) {
        return user;
    }
    return null;
  },

  getClients: () => getDB().clients,
  getClientBySlug: (slug: string) => getDB().clients.find(c => c.slug === slug),
  getClientById: (id: string) => getDB().clients.find(c => c.id === id),
  
  // Admin methods
  updateClient: (id: string, updates: Partial<Client>) => {
    const db = getDB();
    db.clients = db.clients.map(c => c.id === id ? { ...c, ...updates } : c);
    saveDB(db);
  },

  getCultureItems: (clienteId: string) => getDB().cultureItems.filter(ci => ci.clienteId === clienteId && ci.ativo),
  
  getAllCultureItems: (clienteId?: string) => {
    const db = getDB();
    if (clienteId) return db.cultureItems.filter(ci => ci.clienteId === clienteId);
    return db.cultureItems;
  },

  addCultureItem: (item: Omit<CultureItem, 'id'>) => {
    const db = getDB();
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    db.cultureItems.push(newItem);
    saveDB(db);
    return newItem;
  },

  updateCultureItem: (id: string, updates: Partial<CultureItem>) => {
    const db = getDB();
    db.cultureItems = db.cultureItems.map(ci => ci.id === id ? { ...ci, ...updates } : ci);
    saveDB(db);
  },

  deleteCultureItem: (id: string) => {
    const db = getDB();
    db.cultureItems = db.cultureItems.filter(ci => ci.id !== id);
    saveDB(db);
  },
  
  saveCultureResponse: (resp: Omit<CultureResponse, 'id' | 'data'>) => {
    const db = getDB();
    db.cultureResponses.push({
      ...resp,
      id: Math.random().toString(36).substr(2, 9),
      data: new Date().toISOString()
    });
    saveDB(db);
  },

  getCultureResponses: (clienteId?: string) => {
    const db = getDB();
    if (clienteId) return db.cultureResponses.filter(r => r.clienteId === clienteId);
    return db.cultureResponses;
  },

  getTemperamentQuestions: () => getDB().temperamentQuestions,

  saveTemperamentResponse: (resp: Omit<TemperamentResponse, 'id' | 'data'>) => {
    const db = getDB();
    db.temperamentResponses.push({
      ...resp,
      id: Math.random().toString(36).substr(2, 9),
      data: new Date().toISOString()
    });
    saveDB(db);
  },

  getTemperamentResponses: (clienteId?: string) => {
    const db = getDB();
    if (clienteId) return db.temperamentResponses.filter(r => r.clienteId === clienteId);
    return db.temperamentResponses;
  }
};
