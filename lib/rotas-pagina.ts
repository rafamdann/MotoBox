/* ============================================================
   MOTOBOX — Rotas: os textos fixos das páginas

   Tudo o que /rotas e cada /rotas/<rota> mostram e não é de uma
   rota em particular: a abertura, os títulos das secções, as notas,
   os textos do guia em PDF de cada rota e o que é comum a todas as
   rotas (emergência, documentos, rede, preço do combustível, o que
   levar, quando ir, a lista para planear, as regras da estrada e
   as tabelas de clima).

   Vive no documento "paginas.rotas" do conteúdo editável. O de
   partida é o que estava escrito nas páginas (ver
   paginaRotasPadrao() em lib/rotas.ts). Sem dados: pode ser
   importado no painel de gestão.
   ============================================================ */

import type { Facto, FonteRota } from "@/lib/rotas-tipos";
import { MARGEM_MOTA } from "@/lib/rotas-mapas";

/** Clima de uma cidade de referência, mês a mês (Janeiro primeiro). */
export interface ClimaCidade {
  /** Código que as rotas usam para escolher esta cidade (ex.: "lubango"). */
  chave: string;
  cidade: string;
  /** Ponto para o cálculo do nascer e do pôr do sol. */
  lat: number;
  lng: number;
  fonte: FonteRota;
  /** De onde vêm os números e de que período. */
  nota: string;
  meses: { max: number; min: number; chuva: number }[];
}

/** Textos fixos da página de cada rota. */
export interface TextosRota {
  seo: { titulo: string; descricao: string };
  botaoMapa: string;
  botaoGpx: string;
  menu: {
    mapa: string; itinerario: string; horario: string; pratico: string;
    clima: string; levar: string; fotografias: string; fontes: string;
  };
  numeros: { distancia: string; rodar: string; dia: string; dias: string; exigencia: string; piso: string; epoca: string };
  ficha: {
    titulo: string; regiao: string; partida: string; piso: string; exigencia: string; oPiso: string;
    melhorEpoca: string; quantosDias: string; clubes: string; oQueVer: string;
  };
  mapa: {
    titulo: string; texto: string; nota: string;
    total: string; rodar: string; carro: string; subida: string; maxima: string; minima: string;
    metodo: string;
  };
  estrada: { titulo: string; texto: string; ligacao: string };
  itinerario: { titulo: string; dia: string; peloCaminho: string; coordenadas: string };
  horario: { titulo: string; texto: string; luz: string; nota: string };
  pratico: {
    titulo: string; combustivel: string; semCombustivel: string; emergencia: string; comer: string; dormir: string;
    saude: string; perigos: string; rede: string; documentos: string; licencas: string; motas: string;
  };
  clima: {
    titulo: string; texto: string; nota: string;
    maxima: string; minima: string; chuva: string; nascer: string; por: string;
    pontos: string;
  };
  levar: { titulo: string; agua: string; grupo: string; rota: string; sempre: string };
  fotografias: { titulo: string; texto: string };
  dicas: { titulo: string; distancias: string; distanciasNota: string };
  correccao: { titulo: string; texto: string; botao: string };
  fontes: { titulo: string; nota: string };
  outras: { titulo: string; todas: string };
}

/**
 * Textos fixos do guia em PDF de cada rota (lib/rotas-pdf): o botão da
 * página e tudo o que o documento escreve e não é de uma rota em
 * particular. Marcadores: {n}, {cidade}, {quando}, {site}, {data}, {total}.
 */
export interface TextosGuia {
  /** O botão na página da rota. */
  botao: string;
  /** No topo da capa e no cabeçalho de cada página. */
  titulo: string;
  rodape: string;
  pagina: string;
  capa: {
    rota: string;
    distancia: string; rodar: string; dia: string; dias: string; exigencia: string; piso: string; epoca: string;
    partida: string; oPiso: string; porque: string; melhorEpoca: string; quantosDias: string;
    qrPagina: string; qrPaginaTexto: string; qrMapa: string; qrMapaTexto: string;
    mapa: string; gpx: string; gpxTexto: string; emergencia: string; offline: string;
  };
  estrada: { titulo: string; texto: string; boa: string; irregular: string; ma: string };
  mapa: { titulo: string; nota: string; norte: string; escala: string };
  itinerario: {
    titulo: string; dia: string; abrirDia: string; peloCaminho: string; estrada: string; aviso: string;
    total: string; rodar: string; carro: string; subida: string; maxima: string; minima: string; metodo: string;
  };
  pisos: { asfalto: string; buracos: string; terra: string; areia: string };
  paragens: { titulo: string; texto: string; paragem: string; coordenadas: string; altitude: string; pontos: string; lugar: string; nota: string };
  horario: { titulo: string; texto: string; luz: string; luzNota: string };
  pratico: {
    titulo: string; combustivel: string; semCombustivel: string; emergencia: string; contactos: string; contactosTexto: string;
    comer: string; dormir: string; saude: string; perigos: string; rede: string; documentos: string; licencas: string; motas: string;
  };
  levar: { titulo: string; texto: string; rota: string; sempre: string; agua: string; grupo: string };
  clima: { titulo: string; nota: string; maxima: string; minima: string; chuva: string; nascer: string; por: string; meses: string[] };
  regras: { titulo: string };
  dicas: { titulo: string };
  fontes: { titulo: string; texto: string; nota: string };
}

export interface ConteudoPaginaRotas {
  seo: { titulo: string; descricao: string };
  abertura: { foto: string; sobretitulo: string; titulo: string; texto: string };
  lista: { titulo: string; nota: string };
  quandoIr: { titulo: string; texto: string; seco: string; chuva: string };
  planear: { titulo: string; texto: string; emergencia: string };
  regras: { titulo: string; texto: string };
  emGrupo: { titulo: string; texto: string; botao: string; ligacao: string };
  notaFinal: string;
  /** Textos fixos da página de cada rota. */
  detalhe: TextosRota;
  /** Textos fixos do guia em PDF de cada rota. */
  guia: TextosGuia;

  /* Comum a todas as rotas */
  EMERGENCIA: { numeros: { numero: string; servico: string }[]; notas: string[]; fontes: FonteRota[] };
  DOCUMENTOS: Facto[];
  REDE_GERAL: Facto;
  PRECO_COMBUSTIVEL: Facto;
  LEVAR_BASE: string[];
  CLIMA_POR_REGIAO: { regiao: string; seco: string; chuva: string; nota: string; fonte: FonteRota }[];
  CHECKLIST_VIAGEM: { grupo: string; itens: string[]; fontes: FonteRota[] }[];
  REGRAS_ESTRADA: { texto: string; fonte: FonteRota }[];
  /** Tabelas de clima das cidades de referência das rotas. */
  CLIMA: ClimaCidade[];
}

/** As partes de ConteudoPaginaRotas que são só texto (o resto vem de lib/rotas.ts). */
export type TextosPaginaRotas = Omit<
  ConteudoPaginaRotas,
  "EMERGENCIA" | "DOCUMENTOS" | "REDE_GERAL" | "PRECO_COMBUSTIVEL" | "LEVAR_BASE" | "CLIMA_POR_REGIAO" | "CHECKLIST_VIAGEM" | "REGRAS_ESTRADA" | "CLIMA"
>;

const pct = (x: number) => Math.round((1 - x) * 100);

/** Texto do método, montado a partir das margens para nunca as contradizer. */
const COMO_CALCULAMOS =
  `Como calculamos: a distância e o tempo de carro de cada troço vêm do OSRM, o motor de rotas sobre o OpenStreetMap. ` +
  `De mota chega-se antes: o tempo de mota tira-lhe ${pct(MARGEM_MOTA.asfalto)} % em asfalto, ${pct(MARGEM_MOTA.buracos)} % em asfalto com buracos, ` +
  `${pct(MARGEM_MOTA.terra)} % em terra e ${pct(MARGEM_MOTA.areia)} % em areia, porque a mota fura o trânsito, ultrapassa com facilidade e contorna os buracos, ` +
  `e não conta as paragens. As altitudes são do modelo de terreno SRTM (30 m), lidas no OpenTopoData ao longo do traçado: ` +
  `a subida acumulada é uma estimativa.`;

/** Textos fixos do guia em PDF (ver TextosGuia). */
export const TEXTOS_GUIA: TextosGuia = {
  botao: "Descarregar o guia (PDF)",
  titulo: "Guia de viagem",
  rodape: "MotoBox Angola · {site} · Gerado em {data}. Confirme as condições antes de sair.",
  pagina: "Página {n} de {total}",
  capa: {
    rota: "Rota {n}",
    distancia: "de distância",
    rodar: "a rodar, sem paragens",
    dia: "dia",
    dias: "dias",
    exigencia: "exigência",
    piso: "piso",
    epoca: "melhor época",
    partida: "Partida",
    oPiso: "O piso",
    porque: "Porquê esta exigência",
    melhorEpoca: "Melhor época",
    quantosDias: "Quantos dias",
    qrPagina: "Página da rota",
    qrPaginaTexto: "Aponte a câmara do telemóvel para abrir a versão sempre actualizada, com o mapa e as fotografias.",
    qrMapa: "Navegação",
    qrMapaTexto: "Abre o percurso no Google Maps, paragem a paragem.",
    mapa: "Abrir no Google Maps",
    gpx: "Descarregar o GPX",
    gpxTexto: "Paragens, pontos de interesse e traçado, para o OsmAnd, o Organic Maps ou um GPS de mota.",
    emergencia: "Emergência",
    offline: "Imprima este guia ou guarde-o no telemóvel: lê-se sem rede.",
  },
  estrada: {
    titulo: "Estado da estrada",
    texto: "O que contam os motards que passaram por lá ({quando}). As estradas mudam depressa: confirme antes de sair.",
    boa: "Boa",
    irregular: "Irregular",
    ma: "Má",
  },
  mapa: {
    titulo: "O percurso",
    nota: "Esquema do traçado, com as paragens numeradas como no itinerário. Não substitui o GPS nem um mapa.",
    norte: "N",
    escala: "Escala",
  },
  itinerario: {
    titulo: "Itinerário, troço a troço",
    dia: "Dia",
    abrirDia: "Abrir o dia {n} no Google Maps",
    peloCaminho: "Pelo caminho",
    estrada: "Estrada",
    aviso: "Atenção",
    total: "no total",
    rodar: "a rodar de mota",
    carro: "de carro (OSRM)",
    subida: "de subida acumulada",
    maxima: "de altitude máxima",
    minima: "de altitude mínima",
    metodo: COMO_CALCULAMOS,
  },
  pisos: { asfalto: "Asfalto", buracos: "Asfalto com buracos", terra: "Terra", areia: "Areia" },
  paragens: {
    titulo: "Paragens e coordenadas",
    texto: "Em graus decimais (WGS84): escreva-as assim no GPS ou na pesquisa do Google Maps.",
    paragem: "Paragem",
    coordenadas: "Coordenadas",
    altitude: "Altitude",
    pontos: "Pontos de interesse",
    lugar: "Lugar",
    nota: "Nota",
  },
  horario: {
    titulo: "Horário sugerido",
    texto:
      "Fora das cidades não se conduz de noite: há buracos sem aviso, gado e peões na estrada, e camiões e motas sem luzes. O horário conta com as paragens e deixa margem para chegar com luz.",
    luz: "Luz do dia em {cidade}",
    luzNota: "Dia 15 de cada mês, hora de Angola. A tabela completa está em Clima e luz.",
  },
  pratico: {
    titulo: "Informação prática",
    combustivel: "Combustível",
    semCombustivel: "Maior troço sem combustível",
    emergencia: "Emergência",
    contactos: "Os seus contactos",
    contactosTexto: "Hotel, alguém do grupo, mecânico, seguro:",
    comer: "Onde comer",
    dormir: "Onde dormir",
    saude: "Hospital mais próximo",
    perigos: "Perigos na estrada",
    rede: "Rede móvel",
    documentos: "Documentos",
    licencas: "Licenças e entradas",
    motas: "A mota certa",
  },
  levar: {
    titulo: "O que levar",
    texto: "Marque cada ponto à medida que arruma a mota.",
    rota: "Para esta rota",
    sempre: "Em qualquer viagem",
    agua: "Água e comida",
    grupo: "Sozinho ou em grupo",
  },
  clima: {
    titulo: "Clima e luz · {cidade}",
    nota:
      "O nascer e o pôr do sol foram calculados para o dia 15 de cada mês, em hora de Angola (UTC+1). A vermelho, os meses com 50 mm de chuva ou mais.",
    maxima: "Máxima (°C)",
    minima: "Mínima (°C)",
    chuva: "Chuva (mm)",
    nascer: "Nascer do sol",
    por: "Pôr do sol",
    meses: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  },
  regras: { titulo: "Regras da estrada" },
  dicas: { titulo: "Dicas para quem vai de mota" },
  fontes: {
    titulo: "Fontes",
    texto: "Os números entre parênteses rectos no guia remetem para esta lista. Cada título abre a fonte.",
    nota:
      "Informação verificada em Outubro de 2026. Estradas, preços e combustível mudam: confirme localmente antes de partir. Mapas e traçado: © contribuidores do OpenStreetMap (ODbL), calculado com o OSRM.",
  },
};

export const TEXTOS_PAGINA_ROTAS: TextosPaginaRotas = {
  seo: {
    titulo: "Rotas",
    descricao:
      "Para onde ir de mota em Angola: Serra da Leba, Tundavala, Kalandula, Miradouro da Lua, Cabo Ledo, deserto do Namibe e costa de Benguela. Mapa e GPX, troço a troço, combustível, onde dormir, horário e cuidados, com fontes.",
  },
  abertura: {
    foto: "banner-rotas",
    sobretitulo: "Moto-turismo",
    titulo: "Para onde ir de mota",
    texto:
      "Da serra ao deserto, {n} rotas prontas a fazer: mapa e GPX, troço a troço com distâncias e tempos, horário, combustível, onde comer e dormir, documentos e perigos. Tudo com as fontes à vista.",
  },
  lista: {
    titulo: "{n} rotas por Angola",
    nota:
      "Fotografias reais dos locais, com licença livre, do Wikimedia Commons: o autor e a licença estão em cada rota. Distâncias do OSRM sobre o OpenStreetMap; o tempo a rodar é o de mota, mais curto do que de carro, e não conta paragens.",
  },
  quandoIr: {
    titulo: "Quando ir",
    texto:
      "A estação seca, o cacimbo, vai mais ou menos de Maio a Setembro e é a época mais segura para as estradas de montanha e para as picadas. Traz muitas vezes nevoeiro de manhã, e Julho e Agosto são os meses mais frescos. As quedas de água, essas, têm mais caudal quando chove.",
    seco: "Seco",
    chuva: "Chuva",
  },
  planear: {
    titulo: "Planear uma viagem de mota",
    texto:
      "O essencial para uma viagem longa em Angola, com base no Código de Estrada e nos avisos de viagem oficiais. Cada grupo diz de onde vem a informação.",
    emergencia: "Números de emergência",
  },
  regras: { titulo: "Regras da estrada", texto: "O que o Código de Estrada diz a quem viaja de mota." },
  emGrupo: {
    titulo: "Melhor em grupo",
    texto:
      "Fora das cidades, viajar com mais motas é mais seguro. Os clubes de moto-turismo organizam passeios e raides a muitos destes destinos.",
    botao: "Encontrar um clube",
    ligacao: "/clubes?tipo=moto-turismo",
  },
  notaFinal:
    "Informação verificada em Outubro de 2026: estradas, preços e combustível mudam, por isso confirme sempre localmente antes de partir.",
  detalhe: {
    seo: {
      titulo: "{nome}: rota de mota",
      descricao: "{resumo} {km} km, cerca de {tempo} a rodar. Mapa, GPX, combustível, onde dormir e cuidados.",
    },
    botaoMapa: "Abrir no Google Maps",
    botaoGpx: "Descarregar GPX",
    menu: {
      mapa: "Mapa",
      itinerario: "Itinerário",
      horario: "Horário",
      pratico: "Informação prática",
      clima: "Clima e luz",
      levar: "O que levar",
      fotografias: "Fotografias",
      fontes: "Fontes",
    },
    numeros: {
      distancia: "de distância",
      rodar: "a rodar de mota, sem paragens",
      dia: "dia",
      dias: "dias",
      exigencia: "exigência",
      piso: "piso",
      epoca: "melhor época",
    },
    ficha: {
      titulo: "Ficha da rota",
      regiao: "Região",
      partida: "Partida",
      piso: "Piso",
      exigencia: "Exigência",
      oPiso: "O piso",
      melhorEpoca: "Melhor época",
      quantosDias: "Quantos dias",
      clubes: "Clubes na região",
      oQueVer: "O que ver",
    },
    mapa: {
      titulo: "O caminho, pronto a seguir",
      texto:
        "O trajecto passa por todas as paragens desta rota. No telemóvel, o botão abre a navegação passo a passo do Google Maps.",
      nota:
        "O GPX traz as paragens, os pontos de interesse e o traçado completo, e abre em aplicações como o OsmAnd, o Organic Maps ou um GPS de mota. No browser do telemóvel sem a aplicação do Google Maps, o Google só aceita três paragens intermédias: nas viagens de vários dias, use os botões de cada dia. No mapa, o Google dá a cada paragem o nome do sítio mais próximo que conhece; os nomes certos estão no itinerário. O tempo que o Google mostra é o dele; os desta página são calculados como se explica abaixo.",
      total: "no total",
      rodar: "a rodar de mota",
      carro: "de carro (OSRM)",
      subida: "de subida acumulada",
      maxima: "de altitude máxima",
      minima: "de altitude mínima",
      metodo: COMO_CALCULAMOS,
    },
    estrada: {
      titulo: "Estado da estrada",
      texto:
        "O que contam os motards que passaram por lá ({quando}). As estradas mudam depressa: uma é arranjada, outra abre buracos.",
      ligacao: "Passou lá há pouco? Conte-nos como está",
    },
    itinerario: {
      titulo: "Troço a troço",
      dia: "Dia",
      peloCaminho: "Pelo caminho",
      coordenadas: "Coordenadas das paragens",
    },
    horario: {
      titulo: "Chegar antes de escurecer",
      texto:
        "Fora das cidades não se conduz de noite: há buracos sem aviso, gado e peões na estrada, e camiões e motas sem luzes. O horário conta com as paragens e deixa margem para chegar com luz.",
      luz: "Luz do dia",
      nota: "Dia 15 de cada mês, hora de Angola. Tabela completa em",
    },
    pratico: {
      titulo: "Tudo o que precisa de saber",
      combustivel: "Combustível",
      semCombustivel: "Maior troço sem combustível",
      emergencia: "Emergência",
      comer: "Onde comer",
      dormir: "Onde dormir",
      saude: "Hospital mais próximo",
      perigos: "Perigos na estrada",
      rede: "Rede móvel",
      documentos: "Documentos",
      licencas: "Licenças e entradas",
      motas: "A mota certa",
    },
    clima: {
      titulo: "Clima e luz",
      texto: "Temperaturas e chuva de cada mês, e a hora a que o sol nasce e se põe.",
      nota:
        "O nascer e o pôr do sol foram calculados para o dia 15 de cada mês, em hora de Angola (UTC+1). A vermelho, os meses com 50 mm de chuva ou mais.",
      maxima: "Máxima (°C)",
      minima: "Mínima (°C)",
      chuva: "Chuva (mm)",
      nascer: "Nascer do sol",
      por: "Pôr do sol",
      pontos: "Pontos de interesse",
    },
    levar: {
      titulo: "A lista antes de sair",
      agua: "Água e comida",
      grupo: "Sozinho ou em grupo",
      rota: "Para esta rota",
      sempre: "Em qualquer viagem",
    },
    fotografias: {
      titulo: "Como é, ao vivo",
      texto: "Fotografias reais dos lugares desta rota, com licença livre, do Wikimedia Commons.",
    },
    dicas: {
      titulo: "Dicas para quem vai de mota",
      distancias: "Distâncias publicadas",
      distanciasNota: "O que as fontes dizem, para comparar com o cálculo do OSRM. Quando discordam, damos o intervalo.",
    },
    correccao: {
      titulo: "Viu alguma coisa diferente na estrada?",
      texto: "Um posto fechado, um troço novo, um hotel que mudou: diga-nos e actualizamos a rota.",
      botao: "Enviar uma correcção",
    },
    fontes: {
      titulo: "Fontes",
      nota:
        "Informação verificada em Outubro de 2026. Estradas, preços e combustível mudam: confirme localmente antes de partir. Mapas e traçado: © contribuidores do OpenStreetMap (ODbL), calculado com o OSRM. Fotografias do Wikimedia Commons, com o autor e a licença por baixo de cada uma.",
    },
    outras: { titulo: "Outras rotas", todas: "Todas as rotas" },
  },
  guia: TEXTOS_GUIA,
};

/** Troca {n}, {nome}… pelos valores. Um marcador sem valor fica como está. */
export function preencher(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (m, k: string) => (k in valores ? String(valores[k]) : m));
}

const eObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * O gravado por cima do de partida, campo a campo, em todos os níveis de
 * objectos (as listas substituem-se inteiras). Assim, um texto novo que
 * apareça no código nunca falta numa página já editada.
 */
export function fundir<T>(padrao: T, gravado: unknown): T {
  if (gravado === undefined || gravado === null) return padrao;
  if (eObj(padrao) && eObj(gravado)) {
    const r: Record<string, unknown> = { ...padrao };
    for (const [k, v] of Object.entries(gravado)) r[k] = k in padrao ? fundir((padrao as Record<string, unknown>)[k], v) : v;
    return r as T;
  }
  if (Array.isArray(padrao) && !Array.isArray(gravado)) return padrao;
  if (typeof padrao === "string" && typeof gravado !== "string") return padrao;
  return gravado as T;
}
