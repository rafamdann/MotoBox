/* ============================================================
   Conteúdo editável — Site: a entrada (com o vídeo de fundo),
   a abertura com as luzes de partida, o painel Explorar e o
   mosaico "Em foco". O texto de partida é o que o site mostrava
   antes de passar a ser editável no painel de gestão.
   ============================================================ */

import { UBUNTU } from "@/lib/ubuntu";
import type { DefDoc, DefGrupo } from "../registo-tipos";

/* ---------------- Utilitários partilhados (também usados em ./paginas.ts) ---------------- */

const eObjecto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Junta o que está gravado com o conteúdo de partida, a todos os níveis
 * dos objectos (as listas gravadas substituem as de partida). Assim, um
 * campo novo no código nunca chega vazio a um documento gravado antes.
 */
export function fundir<T>(padrao: T, gravado: unknown): T {
  if (gravado === undefined || gravado === null) return padrao;
  if (eObjecto(padrao) && eObjecto(gravado)) {
    const saida: Record<string, unknown> = { ...padrao };
    for (const [k, v] of Object.entries(gravado)) saida[k] = k in padrao ? fundir(padrao[k], v) : v;
    return saida as T;
  }
  // Um tipo diferente do de partida (ex.: texto onde havia uma lista) não se aceita.
  if (Array.isArray(padrao) !== Array.isArray(gravado)) return padrao;
  return gravado as T;
}

/** Troca {chave} pelos valores (ex.: "{clubes} clubes" → "11 clubes"). */
export function preencher(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (todo, k: string) => (k in valores ? String(valores[k]) : todo));
}

/** Um número gravado (ou escrito como texto) dentro de limites; senão, o de partida. */
export function numeroEntre(v: unknown, min: number, max: number, padrao: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v.replace(",", ".")) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : padrao;
}

/* ---------------- Entrada ---------------- */

/** Entrada do site (/): a frase da casa por cima do vídeo. */
export interface ConteudoEntrada {
  sobretitulo: string;
  titulo: string;
  texto: string;
  /** Vídeo de fundo de todo o site (endereço ou caminho em /public). */
  video: string;
  /** Imagem mostrada enquanto o vídeo carrega (e com movimento reduzido). */
  poster: string;
  /** Velocidade do vídeo de fundo: 1 = a do ficheiro; 0,5 = a metade (mais calmo). */
  velocidade: number;
  /** Quanto se escurece o vídeo na página de entrada, em % (0 a 80), para o texto branco se ler. */
  escurecer: number;
  /** Mostra a ligação para o artigo mais recente por baixo do texto. */
  mostrarArtigo: boolean;
  /** Etiqueta vermelha dessa ligação. */
  rotuloArtigo: string;
}

export const ENTRADA_PADRAO: ConteudoEntrada = {
  sobretitulo: "MotoBox Angola",
  titulo: "A paixão anda sobre duas rodas",
  texto:
    "Histórias, clubes, passeios e segurança para quem anda de mota em Angola. Da scooter de todos os dias à moto de viagem, a comunidade motard num só lugar.",
  // Vídeo da MotoBox no Instagram (prova de motocross nas dunas,
  // instagram.com/p/DdwTCnFOtxr): quatro planos largos e longos, a metade da
  // velocidade, esbatidos uns nos outros e em ciclo, sem cortes rápidos nem
  // clarões, sem som, sem caras de perto e sem a marca do fotógrafo; um pouco
  // escurecido. O anterior (cortes rápidos) está em
  // media/videos/instagram-DeOelO6uUlE-fundo.mp4 e o de demonstração em /videos/fundo.mp4.
  video: "https://sluahnkxfnibximsqcht.supabase.co/storage/v1/object/public/media/videos/instagram-DdwTCnFOtxr-fundo-calmo.mp4",
  poster: "https://sluahnkxfnibximsqcht.supabase.co/storage/v1/object/public/media/videos/instagram-DdwTCnFOtxr-fundo-calmo.jpg",
  velocidade: 1,
  escurecer: 45,
  mostrarArtigo: true,
  rotuloArtigo: "Novo artigo",
};

/* ---------------- Abertura (luzes de partida) ---------------- */

/**
 * Abertura do site: uma vez por sessão do navegador, cinco pares de luzes
 * vermelhas acendem-se uma a uma, como na partida de uma corrida, e apagam-se
 * todas de uma vez; depois a cortina sobe e aparece o site.
 */
export interface ConteudoAbertura {
  /** Desligada, o site abre directamente. */
  activa: boolean;
  /** "todas": na primeira página que a pessoa abre na visita; "entrada": só quando entra pela página inicial. */
  onde: "todas" | "entrada";
  /** Linha pequena por cima da pergunta. */
  sobretitulo: string;
  /** A pergunta grande. */
  titulo: string;
  texto: string;
  /** Botão vermelho: apaga as luzes e arranca já. */
  botao: string;
  /** Botão discreto para saltar a abertura. */
  saltar: string;
  /** O que se lê quando as luzes se apagam. */
  partida: string;
  /** Dica no computador, por baixo dos botões. */
  dica: string;
}

export const ABERTURA_PADRAO: ConteudoAbertura = {
  activa: true,
  onde: "todas",
  sobretitulo: "Grelha de partida",
  titulo: "Pronto?",
  texto: "Cinco luzes vermelhas. Quando se apagarem todas, arrancamos.",
  botao: "Arrancar",
  saltar: "Saltar",
  partida: "Luzes apagadas. Bora!",
  dica: "A tecla Esc também salta a abertura.",
};

/* ---------------- Em foco (painel Explorar) ---------------- */

/** O que pode estar em foco no mosaico do painel Explorar. */
export const TIPOS_FOCO = [
  "evento", "prova", "artigo", "rota", "anuncio", "clube", "modalidade", "seguranca", "personalizado",
] as const;

export type TipoFoco = (typeof TIPOS_FOCO)[number];

export const NOMES_FOCO: Record<TipoFoco, string> = {
  evento: "Evento",
  prova: "Prova",
  artigo: "Artigo",
  rota: "Rota",
  anuncio: "Anúncio do marketplace",
  clube: "Clube",
  modalidade: "Modalidade",
  seguranca: "Secção de segurança",
  personalizado: "Personalizado",
};

/** Tipos com data, onde a contagem decrescente faz sentido. */
export const FOCO_COM_DATA: readonly TipoFoco[] = ["evento", "prova", "personalizado"];

/**
 * Mosaico "Em foco" do painel Explorar. O documento continua a chamar-se
 * "site.contagem" porque nasceu como a contagem decrescente do Ubuntu 2027
 * (assim, o que já estava gravado continua a valer).
 *
 * Escolhe-se um tipo e um item; o mosaico vai buscar a fotografia, o título,
 * uma linha e a ligação ao próprio item. Os textos e a fotografia aqui
 * escritos, quando preenchidos, mandam sobre os do item.
 */
export interface ConteudoEmFoco {
  tipo: TipoFoco;
  /** Slug do evento, da prova, do artigo, da rota, do clube ou da modalidade; id do anúncio; id da secção de segurança. */
  item: string;
  /** Mostra a contagem decrescente até à data (eventos, provas e personalizado com data). */
  activa: boolean;
  /** Linha de cima (em branco: a do tipo, em `automaticos`). */
  sobretitulo: string;
  /** Em branco: o título do item. */
  titulo: string;
  /** A linha por baixo do título (em branco: a do item). */
  subtitulo: string;
  /** Em branco: a fotografia do item. */
  foto: string;
  /** Texto da ligação, em baixo (em branco: o do tipo). */
  textoLigacao: string;
  /** Para onde leva o mosaico (em branco: a página do item). */
  ligacao: string;
  /** Data e hora da contagem, ISO com fuso (em branco: o início do evento). */
  data: string;
  /** Linha de cima e texto da ligação de cada tipo, quando não se escreve outro. */
  automaticos: Record<TipoFoco, { sobretitulo: string; ligacao: string }>;
  /** Nomes das unidades da contagem. */
  unidades: { dias: string; horas: string; minutos: string; segundos: string };
}

export const EM_FOCO_PADRAO: ConteudoEmFoco = {
  // O Ubuntu 2027, tal como o painel o mostrava antes de se poder escolher.
  tipo: "evento",
  item: UBUNTU.slug,
  activa: true,
  sobretitulo: UBUNTU.nome,
  titulo: "Africa Ubuntu Breakfast Run",
  subtitulo: `31 de Janeiro · ${UBUNTU.percurso}`,
  foto: "passeios",
  textoLigacao: "Ver o evento",
  ligacao: "",
  data: UBUNTU.partida,
  automaticos: {
    evento: { sobretitulo: "Evento em foco", ligacao: "Ver o evento" },
    prova: { sobretitulo: "Prova em foco", ligacao: "Ver a prova" },
    artigo: { sobretitulo: "Para ler", ligacao: "Ler o artigo" },
    rota: { sobretitulo: "Rota em foco", ligacao: "Ver a rota" },
    anuncio: { sobretitulo: "No marketplace", ligacao: "Ver o anúncio" },
    clube: { sobretitulo: "Clube em foco", ligacao: "Ver o clube" },
    modalidade: { sobretitulo: "Desporto", ligacao: "Ver a modalidade" },
    seguranca: { sobretitulo: "Segurança", ligacao: "Ler o guia" },
    personalizado: { sobretitulo: "Em foco", ligacao: "Saber mais" },
  },
  unidades: { dias: "dias", horas: "horas", minutos: "min", segundos: "seg" },
};

/* ---------------- Painel Explorar ---------------- */

/**
 * Painel Explorar: fotografias e textos fixos dos mosaicos.
 * Os números e os destaques continuam a vir dos dados (artigos, clubes,
 * provas, eventos); nos textos, o que está entre chavetas preenche-se
 * sozinho (ex.: {clubes}, {piloto}, {data}).
 */
export interface ConteudoPainel {
  seo: { titulo: string; descricao: string };
  destaque: {
    /** "Artigo em destaque · Clubes": a categoria junta-se sozinha. */
    rotulo: string;
    maisArtigos: string;
    todosArtigos: string;
    /** Título do painel grande quando ainda não há artigos. */
    semArtigos: string;
    /**
     * Com vários artigos marcados como destaque, o painel grande passa de um
     * para o outro a cada tantos segundos (0: só muda quando se escolhe).
     */
    intervalo: number;
  };
  clubes: { titulo: string; foto: string; texto: string; textoSemProvincias: string };
  desporto: { titulo: string; foto: string; textoLider: string; textoProva: string; textoVazio: string };
  eventos: { titulo: string; foto: string; fotoDoEvento: boolean; textoProximo: string; textoVazio: string };
  fichas: { rotas: string; seguranca: string; sobre: string; marketplace: string; forum: string };
  /**
   * No telemóvel, o painel cabe num só ecrã e divide-se em páginas que se
   * passam de lado: os nomes dos separadores de cima e dos mosaicos que só
   * aparecem aí.
   */
  telemovel: {
    destaques: string;
    comunidade: string;
    desporto: string;
    mais: string;
    contacto: string;
    instagram: string;
    /** Mosaico "A MotoBox" da página Mais: fotografia e uma linha por baixo do título. */
    fotoSobre: string;
    textoSobre: string;
  };
}

export const PAINEL_PADRAO: ConteudoPainel = {
  seo: {
    titulo: "Explorar",
    descricao:
      "O painel da MotoBox: artigos, clubes de todo o país, eventos, rotas, segurança, marketplace e fórum, à distância de um toque.",
  },
  destaque: {
    rotulo: "Artigo em destaque",
    maisArtigos: "Mais artigos",
    todosArtigos: "Todos os artigos",
    semArtigos: "Artigos",
    intervalo: 7,
  },
  clubes: {
    titulo: "Clubes",
    foto: "painel-clubes",
    texto: "{clubes} clubes em {provincias} províncias, de todos os tipos de mota",
    textoSemProvincias: "{clubes} clubes, de todos os tipos de mota",
  },
  desporto: {
    titulo: "Desporto",
    foto: "competicao",
    textoLider: "Campeonato Nacional: {piloto} lidera com {pontos} pontos",
    textoProva: "Próxima prova: {prova}, {data}",
    textoVazio: "Campeonato Nacional, pilotos e resultados",
  },
  eventos: {
    titulo: "Eventos",
    foto: "painel-eventos",
    fotoDoEvento: true,
    textoProximo: "Próximo: {evento}, {data}",
    textoVazio: "Passeios, encontros e raides",
  },
  fichas: {
    rotas: "Rotas",
    seguranca: "Segurança",
    sobre: "A MotoBox",
    marketplace: "Marketplace",
    forum: "Fórum",
  },
  telemovel: {
    destaques: "Destaques",
    comunidade: "Comunidade",
    desporto: "Desporto",
    mais: "Mais",
    contacto: "Contacto",
    instagram: "Instagram",
    fotoSobre: "banner-sobre",
    textoSobre: "Quem somos e como fazer parte da comunidade motard",
  },
};

export const DOCS: DefDoc[] = [
  { chave: "site.entrada", titulo: "Entrada", pagina: "/", padrao: () => ENTRADA_PADRAO },
  { chave: "site.abertura", titulo: "Abertura (luzes de partida)", pagina: "/", padrao: () => ABERTURA_PADRAO },
  { chave: "site.contagem", titulo: "Em foco (painel Explorar)", pagina: "/explorar", padrao: () => EM_FOCO_PADRAO },
  { chave: "site.painel", titulo: "Painel Explorar", pagina: "/explorar", padrao: () => PAINEL_PADRAO },
];

export const GRUPOS: DefGrupo[] = [];
