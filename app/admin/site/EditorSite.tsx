"use client";

/* ============================================================
   MOTOBOX ADMIN — Entrada e painel
   Cinco documentos do conteúdo editável, em separadores:
   - "site.entrada": a frase da página inicial e o vídeo de fundo
     de todo o site (com a velocidade e o quanto escurece);
   - "site.abertura": a abertura com as luzes de partida, que
     aparece uma vez por visita;
   - "site.contagem": o mosaico "Em foco" do painel Explorar (um
     evento com contagem decrescente, uma rota, um anúncio…; ver
     ./foco.tsx);
   - "site.painel": os textos e as fotografias fixos dos mosaicos
     do painel Explorar;
   - "site.geral": os textos que aparecem em todo o site (rodapé,
     botão de acção, 404, sem acesso, newsletter, aviso de
     cookies e página de manutenção), em partes (ver ./geral.tsx).
   Ficam todos abertos ao mesmo tempo, para nada se perder ao
   trocar de separador antes de gravar.
   ============================================================ */

import { useState } from "react";
import { Crosshair, Globe, House, LayoutGrid, TrafficCone } from "lucide-react";
import { CabecalhoPagina, Campo, Painel, Seleccao } from "@/components/admin/kit";
import { EditorDoc } from "@/components/admin/editor/EditorDoc";
import { Formulario } from "@/components/admin/editor/Formulario";
import type { CampoEsquema } from "@/components/admin/editor/esquema";
import { AbasEmLinhas } from "../paginas/_editor/partes";
import { EditorPartes } from "./EditorPartes";
import { PARTES_GERAL } from "./geral";
import { EditorFoco } from "./foco";

/** "contagem" é o "Em foco" (o endereço ?aba=contagem ficou, para as ligações antigas). */
export type AbaSite = "entrada" | "abertura" | "contagem" | "painel" | "geral";

const ABAS: { chave: AbaSite; nome: string }[] = [
  { chave: "entrada", nome: "Entrada" },
  { chave: "abertura", nome: "Abertura" },
  { chave: "contagem", nome: "Em foco" },
  { chave: "painel", nome: "Painel Explorar" },
  { chave: "geral", nome: "Geral" },
];

/** Velocidades do vídeo de fundo, na lista de escolha. */
const VELOCIDADES = [0.5, 0.6, 0.75, 0.85, 1];
const nomeVelocidade = (v: number) =>
  v === 0.5 ? "0,5× (metade: muito calmo)" : v === 1 ? "1× (como está no ficheiro)" : `${String(v).replace(".", ",")}×`;

/* ---------------- Entrada ---------------- */

const ESQUEMA_ENTRADA: CampoEsquema[] = [
  {
    tipo: "secao", titulo: "Texto da entrada",
    descricao: "O que se lê no meio da página inicial, por cima do vídeo.",
    campos: [
      { tipo: "texto", chave: "sobretitulo", etiqueta: "Linha pequena por cima do título", largura: "meia" },
      { tipo: "texto", chave: "titulo", etiqueta: "Título", obrigatorio: true },
      { tipo: "area", chave: "texto", etiqueta: "Texto", linhas: 3 },
    ],
  },
  {
    tipo: "secao", titulo: "Artigo mais recente",
    descricao: "Por baixo do texto, uma ligação para o último artigo publicado (o título é o do artigo).",
    campos: [
      { tipo: "booleano", chave: "mostrarArtigo", etiqueta: "Mostrar a ligação para o artigo mais recente" },
      {
        tipo: "texto", chave: "rotuloArtigo", etiqueta: "Etiqueta vermelha", largura: "meia",
        placeholder: "Novo artigo", mostrarSe: (v) => Boolean(v.mostrarArtigo),
      },
    ],
  },
  {
    tipo: "secao", titulo: "Vídeo de fundo",
    descricao: "Passa por trás de todas as páginas do site: nítido na entrada, desfocado nas outras. Não tem som.",
    campos: [
      {
        tipo: "video", chave: "video", etiqueta: "Vídeo",
        ajuda: "MP4 ou WebM, até 50 MB. Prefira um vídeo curto (10 a 30 segundos) que repita bem, com 1920 px de largura. Em branco, fica o vídeo de origem.",
      },
      {
        tipo: "imagem", chave: "poster", etiqueta: "Imagem de espera",
        ajuda: "Aparece enquanto o vídeo carrega e a quem tem o movimento reduzido no telemóvel. Use a primeira imagem do vídeo, para a troca não se notar.",
      },
      {
        tipo: "personalizado", chave: "velocidade", etiqueta: "Velocidade do vídeo", largura: "meia",
        render: (v, mudar) => {
          const actual = typeof v === "number" ? v : Number(v) || 1;
          const lista = VELOCIDADES.includes(actual) ? VELOCIDADES : [...VELOCIDADES, actual].sort((a, b) => a - b);
          return (
            <Campo
              etiqueta="Velocidade do vídeo"
              ajuda="Mais devagar fica mais calmo por trás do texto. O vídeo de origem já vem a metade da velocidade, por isso 1× chega."
            >
              <Seleccao
                valor={String(actual)}
                onChange={(x) => mudar(Number(x))}
                opcoes={lista.map((n) => ({ valor: String(n), nome: nomeVelocidade(n) }))}
              />
            </Campo>
          );
        },
      },
      {
        tipo: "numero", chave: "escurecer", etiqueta: "Escurecer o vídeo na entrada (%)", largura: "meia",
        min: 0, max: 80, passo: 5,
        ajuda: "0 deixa o vídeo como está; 45 é o de origem. Mais alto, o texto branco lê-se melhor por cima de imagens claras.",
      },
    ],
  },
];

/* ---------------- Abertura ---------------- */

const ESQUEMA_ABERTURA: CampoEsquema[] = [
  {
    tipo: "booleano", chave: "activa", etiqueta: "Mostrar a abertura com as luzes de partida",
    descricao: "Uma vez por visita: cinco pares de luzes vermelhas acendem-se uma a uma, apagam-se todas de uma vez e o site aparece. Quem quiser salta-a logo. Nunca aparece no painel de gestão nem aos motores de pesquisa.",
  },
  {
    tipo: "seleccao", chave: "onde", etiqueta: "Onde aparece", largura: "meia",
    opcoes: [
      { valor: "todas", nome: "Na primeira página que a pessoa abre" },
      { valor: "entrada", nome: "Só quando entra pela página inicial" },
    ],
    mostrarSe: (v) => Boolean(v.activa),
  },
  {
    tipo: "secao", titulo: "Textos",
    descricao: "Por baixo das luzes. Quando as luzes se apagam, a pergunta dá lugar à frase de partida.",
    mostrarSe: (v) => Boolean(v.activa),
    campos: [
      { tipo: "texto", chave: "sobretitulo", etiqueta: "Linha pequena por cima das luzes", largura: "meia", placeholder: "Grelha de partida" },
      { tipo: "texto", chave: "titulo", etiqueta: "Pergunta", largura: "meia", placeholder: "Pronto?", obrigatorio: true },
      { tipo: "area", chave: "texto", etiqueta: "Texto por baixo da pergunta", linhas: 2 },
      { tipo: "texto", chave: "partida", etiqueta: "Frase quando as luzes se apagam", placeholder: "Luzes apagadas. Bora!" },
      { tipo: "texto", chave: "botao", etiqueta: "Botão vermelho (arranca já)", largura: "meia", placeholder: "Arrancar" },
      { tipo: "texto", chave: "saltar", etiqueta: "Botão para saltar", largura: "meia", placeholder: "Saltar" },
      { tipo: "texto", chave: "dica", etiqueta: "Dica por baixo dos botões (só no computador)", placeholder: "A tecla Esc também salta a abertura." },
    ],
  },
  {
    tipo: "nota",
    texto: "Para a ver outra vez depois de gravar, abra o site numa janela privada (ou feche o separador e volte a abri-lo).",
  },
];

/* ---------------- Painel Explorar ---------------- */

const AJUDA_CHAVETAS = "As palavras entre chavetas são trocadas pelos valores do momento.";

const ESQUEMA_PAINEL: CampoEsquema[] = [
  {
    tipo: "nota",
    texto: "Os artigos em destaque, o número de clubes, o líder do campeonato e o próximo evento escolhem-se sozinhos a partir do que está publicado. Aqui ficam os textos e as fotografias à volta.",
  },
  {
    tipo: "objecto", chave: "destaque", etiqueta: "Artigos em destaque (o painel grande)",
    ajuda: "Mostra os artigos marcados como destaque em Artigos, um de cada vez, a passar sozinhos (sem nenhum marcado, o mais recente).",
    campos: [
      {
        tipo: "numero", chave: "intervalo", etiqueta: "Segundos de cada artigo", largura: "meia", min: 0, max: 60, passo: 1,
        ajuda: "Com vários em destaque, o painel passa ao seguinte ao fim deste tempo. 0: só muda quando se carrega nos pontos.",
      },
      { tipo: "texto", chave: "rotulo", etiqueta: "Antes da categoria", largura: "meia", ajuda: "Lê-se \"Artigo em destaque · Clubes\"; a categoria junta-se sozinha." },
      { tipo: "texto", chave: "semArtigos", etiqueta: "Título quando ainda não há artigos", largura: "meia" },
      { tipo: "texto", chave: "maisArtigos", etiqueta: "Título da caixa \"Mais artigos\"", largura: "meia", ajuda: "Só nos ecrãs largos." },
      { tipo: "texto", chave: "todosArtigos", etiqueta: "Ligação para todos os artigos", largura: "meia" },
    ],
  },
  {
    tipo: "objecto", chave: "clubes", etiqueta: "Mosaico Clubes",
    campos: [
      { tipo: "texto", chave: "titulo", etiqueta: "Título", largura: "meia" },
      { tipo: "imagem", chave: "foto", etiqueta: "Fotografia", formato: "aspect-[4/3]" },
      { tipo: "texto", chave: "texto", etiqueta: "Texto", ajuda: `${AJUDA_CHAVETAS} {clubes}: quantos clubes há; {provincias}: em quantas províncias.` },
      { tipo: "texto", chave: "textoSemProvincias", etiqueta: "Texto quando nenhum clube tem província", ajuda: "{clubes}: quantos clubes há." },
    ],
  },
  {
    tipo: "objecto", chave: "desporto", etiqueta: "Mosaico Desporto",
    campos: [
      { tipo: "texto", chave: "titulo", etiqueta: "Título", largura: "meia" },
      { tipo: "imagem", chave: "foto", etiqueta: "Fotografia", formato: "aspect-[4/3]" },
      { tipo: "texto", chave: "textoLider", etiqueta: "Quem lidera o campeonato", ajuda: `${AJUDA_CHAVETAS} {piloto}: o nome do líder; {pontos}: os pontos.` },
      { tipo: "texto", chave: "textoProva", etiqueta: "A próxima prova", ajuda: "{prova}: o nome da prova; {data}: o dia e o mês. Junta-se ao texto anterior." },
      { tipo: "texto", chave: "textoVazio", etiqueta: "Texto quando ainda não há classificação" },
    ],
  },
  {
    tipo: "objecto", chave: "eventos", etiqueta: "Mosaico Eventos",
    campos: [
      { tipo: "texto", chave: "titulo", etiqueta: "Título", largura: "meia" },
      {
        tipo: "booleano", chave: "fotoDoEvento", etiqueta: "Usar a fotografia do próximo evento",
        descricao: "Desligado, o mosaico mostra sempre a fotografia de baixo.",
      },
      { tipo: "imagem", chave: "foto", etiqueta: "Fotografia", formato: "aspect-[4/3]", ajuda: "Usada quando não há evento marcado (ou sempre, se desligar a opção de cima)." },
      { tipo: "texto", chave: "textoProximo", etiqueta: "O próximo evento", ajuda: `${AJUDA_CHAVETAS} {evento}: o nome; {data}: o dia e o mês.` },
      { tipo: "texto", chave: "textoVazio", etiqueta: "Texto quando não há evento marcado" },
    ],
  },
  {
    tipo: "objecto", chave: "fichas", etiqueta: "Mosaicos pequenos",
    ajuda: "Os nomes dos cinco mosaicos escuros do canto. Cada um leva sempre à mesma secção.",
    campos: [
      { tipo: "texto", chave: "rotas", etiqueta: "Rotas", largura: "meia" },
      { tipo: "texto", chave: "seguranca", etiqueta: "Segurança", largura: "meia" },
      { tipo: "texto", chave: "sobre", etiqueta: "Sobre a MotoBox", largura: "meia" },
      { tipo: "texto", chave: "marketplace", etiqueta: "Marketplace", largura: "meia" },
      { tipo: "texto", chave: "forum", etiqueta: "Fórum", largura: "meia" },
    ],
  },
  {
    tipo: "objecto", chave: "telemovel", etiqueta: "No telemóvel",
    ajuda: "No telemóvel o painel cabe num só ecrã e divide-se em quatro páginas, que se passam de lado ou se escolhem nos separadores de cima.",
    campos: [
      { tipo: "texto", chave: "destaques", etiqueta: "Página 1: artigos e Em foco", largura: "meia" },
      { tipo: "texto", chave: "comunidade", etiqueta: "Página 2: clubes, eventos, fórum e marketplace", largura: "meia" },
      { tipo: "texto", chave: "desporto", etiqueta: "Página 3: desporto, rotas e segurança", largura: "meia" },
      { tipo: "texto", chave: "mais", etiqueta: "Página 4: a MotoBox, contacto e redes", largura: "meia" },
      { tipo: "texto", chave: "contacto", etiqueta: "Mosaico do contacto", largura: "meia" },
      { tipo: "texto", chave: "instagram", etiqueta: "Mosaico do Instagram", largura: "meia" },
      { tipo: "imagem", chave: "fotoSobre", etiqueta: "Fotografia do mosaico \"A MotoBox\" (página Mais)", formato: "aspect-[4/3]" },
      { tipo: "texto", chave: "textoSobre", etiqueta: "Linha do mosaico \"A MotoBox\"", ajuda: "O título é o dos mosaicos pequenos (Sobre a MotoBox)." },
    ],
  },
  {
    tipo: "objecto", chave: "seo", etiqueta: "Nas pesquisas e no separador do navegador",
    campos: [
      { tipo: "texto", chave: "titulo", etiqueta: "Título" },
      { tipo: "area", chave: "descricao", etiqueta: "Descrição", linhas: 2 },
    ],
  },
];

const DOCS: Record<Exclude<AbaSite, "geral">, { chave: string; pagina: string; esquema?: CampoEsquema[]; titulo: string; descricao: string }> = {
  entrada: {
    chave: "site.entrada", pagina: "/", esquema: ESQUEMA_ENTRADA,
    titulo: "Entrada", descricao: "A página inicial do site e o vídeo de fundo que todas as páginas partilham.",
  },
  abertura: {
    chave: "site.abertura", pagina: "/", esquema: ESQUEMA_ABERTURA,
    titulo: "Abertura", descricao: "As luzes de partida que recebem quem abre o site, uma vez por visita.",
  },
  contagem: {
    chave: "site.contagem", pagina: "/explorar",
    titulo: "Em foco", descricao: "O mosaico à direita, no Explorar: um evento ou uma prova com contagem decrescente, um artigo, uma rota, um anúncio, um clube, uma modalidade, uma secção da segurança ou algo escrito à mão.",
  },
  painel: {
    chave: "site.painel", pagina: "/explorar", esquema: ESQUEMA_PAINEL,
    titulo: "Painel Explorar", descricao: "Os mosaicos do painel Explorar: títulos, fotografias e textos fixos.",
  },
};

const ICONES: Record<AbaSite, React.ReactNode> = {
  entrada: <House />, abertura: <TrafficCone />, contagem: <Crosshair />, painel: <LayoutGrid />, geral: <Globe />,
};

export function EditorSite({ abaInicial }: { abaInicial: AbaSite }) {
  const [aba, setAba] = useState<AbaSite>(abaInicial);
  // Uma ligação para outro separador (?aba=…) com a página já aberta.
  const [pedida, setPedida] = useState(abaInicial);
  if (pedida !== abaInicial) {
    setPedida(abaInicial);
    setAba(abaInicial);
  }

  const mudarAba = (k: AbaSite) => {
    setAba(k);
    // O endereço acompanha o separador (para partilhar ou voltar a ele).
    try { window.history.replaceState(null, "", `?aba=${k}`); } catch { /* indisponível */ }
  };

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Site"
        titulo="Entrada e painel"
        icone={ICONES[aba]}
        descricao={aba === "geral"
          ? "Os textos que aparecem em todo o site: o rodapé, o botão vermelho de baixo, a página 404, a página \"Sem acesso\", as páginas da newsletter, o aviso de cookies e a página de manutenção."
          : "A primeira coisa que se vê do site: a abertura com as luzes de partida, a página inicial com o vídeo de fundo e o painel Explorar."}
      />

      <div className="mb-5">
        <AbasEmLinhas abas={ABAS} activa={aba} onChange={mudarAba} rotulo="Partes do site" />
      </div>

      {(Object.keys(DOCS) as Exclude<AbaSite, "geral">[]).map((k) => {
        const d = DOCS[k];
        return (
          <div key={k} hidden={k !== aba}>
            <EditorDoc chave={d.chave} pagina={d.pagina}>
              {(dados, mudar) => (
                <Painel titulo={d.titulo} descricao={d.descricao} icone={ICONES[k]}>
                  {d.esquema ? (
                    <Formulario esquema={d.esquema} valor={dados} onChange={mudar} />
                  ) : (
                    <EditorFoco dados={dados} mudar={mudar} />
                  )}
                </Painel>
              )}
            </EditorDoc>
          </div>
        );
      })}

      <div hidden={aba !== "geral"}>
        <EditorPartes chave="site.geral" pagina="/calendario" partes={PARTES_GERAL} icone={ICONES.geral} rotulo="Textos gerais" />
      </div>
    </>
  );
}
