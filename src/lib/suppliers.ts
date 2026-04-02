export interface SupplierInfo {
  name: string;
  domain: string;
  urls: string[];
  priority: 'high' | 'medium' | 'low';
  categories: string[];
}

export const SUPPLIERS: SupplierInfo[] = [
  // ===== ALTA PRIORIDAD (los más usados) =====
  {
    name: 'Lucciola',
    domain: 'lucciola.com.ar',
    urls: ['https://www.lucciola.com.ar/index.php'],
    priority: 'high',
    categories: ['Apliques', 'Empotrables', 'Colgantes', 'Plafones', 'Exterior', 'Paneles LED', 'Proyectores'],
  },
  {
    name: 'IDEA Iluminación',
    domain: 'ideailuminacion.com.ar',
    urls: ['https://www.ideailuminacion.com.ar/productos/'],
    priority: 'high',
    categories: ['Apliques', 'Empotrables', 'Colgantes', 'Plafones'],
  },
  {
    name: 'Vonder K',
    domain: 'vonderk.com',
    urls: ['https://www.vonderk.com/'],
    priority: 'high',
    categories: ['Iluminación arquitectónica', 'LED'],
  },
  {
    name: 'Leuk',
    domain: 'leukiluminacion.com',
    urls: ['https://leukiluminacion.com/'],
    priority: 'high',
    categories: ['Apliques', 'Colgantes', 'De mesa', 'De pie'],
  },
  {
    name: 'Macroled',
    domain: 'macroled.com.ar',
    urls: ['https://www.macroled.com.ar/lineas'],
    priority: 'high',
    categories: ['Lámparas LED', 'Paneles', 'Reflectores', 'Tiras LED', 'Interruptores', 'Smart'],
  },
  {
    name: 'World LEDs Go',
    domain: 'wlgled.com',
    urls: ['https://wlgled.com/'],
    priority: 'high',
    categories: ['LED', 'Tiras LED', 'Perfilería', 'Riel', 'Exterior'],
  },
  {
    name: 'Mínimo',
    domain: 'minimo.com.ar',
    urls: ['https://minimo.com.ar/catalogo/'],
    priority: 'high',
    categories: ['Colgantes', 'De mesa', 'De pie', 'Apliques'],
  },
  // ===== PRIORIDAD MEDIA =====
  {
    name: 'Artelum',
    domain: 'artelum.com.ar',
    urls: ['https://www.artelum.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación profesional'],
  },
  {
    name: 'Bael',
    domain: 'bael.com.ar',
    urls: ['https://www.bael.com.ar/productos/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Candil',
    domain: 'candil.com.ar',
    urls: ['https://www.candil.com.ar/home.aspx'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Punto Iluminación',
    domain: 'puntoiluminacion.com.ar',
    urls: ['https://puntoiluminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'GMGE',
    domain: 'gmge.com.ar',
    urls: ['https://www.gmge.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Oblumo',
    domain: 'oblumo.com',
    urls: ['https://www.oblumo.com/coleccion'],
    priority: 'medium',
    categories: ['Colgantes', 'Apliques', 'De mesa'],
  },
  {
    name: 'Ronda',
    domain: 'iluminacionronda.com.ar',
    urls: ['https://www.iluminacionronda.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Ara Iluminación',
    domain: 'arailuminacion.com.ar',
    urls: ['https://arailuminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Markas',
    domain: 'markasiluminacion.com',
    urls: ['https://markasiluminacion.com/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'IMDI',
    domain: 'imdi.com.ar',
    urls: ['https://www.imdi.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Plug Iluminación',
    domain: 'plugiluminacion.com.ar',
    urls: ['https://plugiluminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'GSG Design',
    domain: 'gsgdesign.com.ar',
    urls: ['https://www.gsgdesign.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Premier',
    domain: 'premieriluminacion.com.ar',
    urls: ['https://www.premieriluminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Girasoles',
    domain: 'girasolesiluminacion.com.ar',
    urls: ['https://girasolesiluminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Kinglight',
    domain: 'kinglight.com.ar',
    urls: ['https://kinglight.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Mendizábal',
    domain: 'mendizabal.com.ar',
    urls: ['https://mendizabal.com.ar/apliques/familia-duke/'],
    priority: 'medium',
    categories: ['Apliques'],
  },
  {
    name: '180 Grados',
    domain: '180grados.com.ar',
    urls: ['https://180grados.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Balu',
    domain: 'baluiluminacion.com.ar',
    urls: ['https://baluiluminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Birot',
    domain: 'birot.com',
    urls: ['https://birot.com/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Nikeli',
    domain: 'nikeliluminacion.com.ar',
    urls: ['https://www.nikeliluminacion.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'FW Iluminación',
    domain: 'fwiluminacionsrl.com.ar',
    urls: ['https://www.fwiluminacionsrl.com.ar/'],
    priority: 'medium',
    categories: ['Iluminación'],
  },
  {
    name: 'Spotsline',
    domain: 'spotsline.com.ar',
    urls: ['https://www.spotsline.com.ar/'],
    priority: 'medium',
    categories: ['Spots', 'Riel'],
  },
];

export function getSupplierByDomain(hostname: string): SupplierInfo | undefined {
  const clean = hostname.replace('www.', '');
  return SUPPLIERS.find(s => s.domain === clean);
}

export function getHighPrioritySuppliers(): SupplierInfo[] {
  return SUPPLIERS.filter(s => s.priority === 'high');
}

export function getAllSupplierNames(): string[] {
  return SUPPLIERS.map(s => s.name);
}
