import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays, Mail, MessagesSquare, Newspaper, Route, ShieldCheck, Store, Trophy, Users, BookOpen,
} from "lucide-react";
import { lerClubes, lerEventos, lerNoticias, lerPilotos } from "@/lib/supabase/publico";
import { classificacaoPilotos } from "@/lib/data";
import { doCampeonatoDe, eComunidade, eProva, hrefEvento } from "@/lib/desporto";
import { lerPaginaDesporto } from "@/app/desporto/dados";
import { lerRedes } from "@/lib/redes";
import { diaMes, eventosFuturos } from "@/lib/motobox";
import { lerDoc } from "@/lib/conteudo";
import {
  EM_FOCO_PADRAO, PAINEL_PADRAO, TIPOS_FOCO, fundir, numeroEntre, preencher, type ConteudoEmFoco, type ConteudoPainel,
} from "@/lib/conteudo/grupos/site";
import { Chip, FotoFundo, Logotipo, Moldura, Seta, ordem } from "@/components/painel/kit";
import { Tempo } from "@/components/painel/Tempo";
import { DestaqueRotativo } from "@/components/painel/DestaqueRotativo";
import { EmFoco } from "@/components/painel/EmFoco";
import { EmFocoCompacto } from "@/components/painel/EmFocoCompacto";
import { FichaConta, PainelTelemovel } from "@/components/painel/PainelTelemovel";
import { Icon } from "@/components/ui";
import { fotoDe } from "@/app/eventos/foto";
import { resolverFoco } from "./foco";

// O Next exige um literal aqui, não aceita constante importada.
export const revalidate = 60;

/** Textos e fotografias fixos do painel e o que está "Em foco" (Gestão › Entrada e painel). */
async function lerTextos(): Promise<{ p: ConteudoPainel; c: ConteudoEmFoco }> {
  const [p, c] = await Promise.all([
    lerDoc<ConteudoPainel>("site.painel"),
    lerDoc<ConteudoEmFoco>("site.contagem"),
  ]);
  const foco = fundir(EM_FOCO_PADRAO, c);
  // Um tipo desconhecido (gravado à mão) volta ao de partida.
  if (!TIPOS_FOCO.includes(foco.tipo)) foco.tipo = EM_FOCO_PADRAO.tipo;
  return { p: fundir(PAINEL_PADRAO, p), c: foco };
}

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await lerTextos();
  return { title: p.seo.titulo, description: p.seo.descricao };
}

/* ============================================================
   MOTOBOX — Painel
   Uma grelha de 16 colunas que enche o ecrã: os artigos em
   destaque no painel grande (passam de um para o outro quando há
   vários), os clubes, o desporto e os eventos por baixo; à
   direita as redes, o tempo, o mosaico "Em foco" (um evento com
   contagem decrescente, uma rota, um anúncio…) e as secções de
   serviço. Os textos e as fotografias fixos vêm do conteúdo
   editável ("site.painel" e "site.contagem"); os números e os
   destaques, dos dados. No computador o painel nunca rola: a grelha
   aperta-se à altura do ecrã e, num ecrã baixo (variantes "baixo" e
   "mbaixo" em globals.css), os textos secundários encolhem ou saem.
   No telemóvel (abaixo de lg), o painel também cabe num só ecrã:
   os mosaicos dividem-se em quatro páginas que se passam de lado
   (Destaques, Comunidade, Desporto e Mais; ver PainelTelemovel),
   com o tempo e os separadores em cima. As duas versões usam os
   mesmos dados e levam aos mesmos sítios.
   ============================================================ */

export default async function Painel() {
  const [artigos, clubes, eventos, redes, pilotos, { p, c }] = await Promise.all([
    lerNoticias(), lerClubes(), lerEventos(), lerRedes(), lerPilotos(), lerTextos(),
  ]);

  // Todos os artigos marcados como destaque passam no painel grande; sem nenhum, o mais recente.
  const marcados = artigos.filter((a) => a.destaque);
  const destaques = marcados.length ? marcados : artigos.slice(0, 1);
  const emDestaque = new Set(destaques.map((a) => a.slug));
  // "Mais artigos": os mais recentes que não estão a passar; os em destaque só no fim, para completar.
  const outros = [...artigos.filter((a) => !emDestaque.has(a.slug)).slice(0, 3), ...destaques]
    .map((a) => ({ slug: a.slug, titulo: a.titulo, categoria: a.categoria }));
  // Eventos da comunidade no painel de Eventos; as provas vão para o Desporto.
  const proximo = eventosFuturos(eventos.filter((e) => eComunidade(e.disciplina)))[0];
  const proximaProva = eventosFuturos(eventos.filter((e) => eProva(e.disciplina)))[0];
  // O líder conta só as categorias do campeonato definidas em Modalidades › Página Desporto.
  const { campeonato } = await lerPaginaDesporto();
  const lider = classificacaoPilotos(pilotos.filter(doCampeonatoDe(campeonato.categorias)))[0];
  const instagram = redes.find((r) => r.rede === "instagram");
  const soClubes = clubes.filter((cl) => cl.tipo !== "Movimento");
  const provincias = new Set(soClubes.map((cl) => cl.provincia).filter(Boolean)).size;
  const data = (iso: string) => `${diaMes(iso).dia} ${diaMes(iso).mes}`;
  const foco = await resolverFoco(c, { eventos, artigos, clubes });

  // O que as duas versões do painel (computador e telemóvel) partilham.
  const artigosDestaque = destaques.map((a) => ({
    slug: a.slug, titulo: a.titulo, resumo: a.resumo, categoria: a.categoria, foto: fotoDe(a.slug, a.imagem),
  }));
  const intervalo = numeroEntre(p.destaque.intervalo, 0, 60, PAINEL_PADRAO.destaque.intervalo);
  const textoClubes = preencher(provincias ? p.clubes.texto : p.clubes.textoSemProvincias, { clubes: soClubes.length, provincias });
  // O piloto e a prova levam à sua própria página; o resto da ficha, ao Desporto.
  const textoDesporto = (
    <>
      {lider
        ? comLigacoes(p.desporto.textoLider, { piloto: lider.nome, pontos: lider.estatisticas.pontos }, { piloto: `/pilotos/${lider.slug}` })
        : p.desporto.textoVazio}
      {proximaProva && (
        <>
          {". "}
          {comLigacoes(
            p.desporto.textoProva,
            { prova: proximaProva.titulo, data: data(proximaProva.dataInicio) },
            { prova: hrefEvento(proximaProva) },
          )}
        </>
      )}
    </>
  );
  const hrefEventos = proximo ? `/eventos/${proximo.slug}` : "/eventos";
  const fotoEventos =
    proximo && p.eventos.fotoDoEvento
      ? [proximo.slug, proximo.imagem, p.eventos.foto, "painel-eventos"]
      : [p.eventos.foto, "painel-eventos"];
  const textoEventos = proximo
    ? preencher(p.eventos.textoProximo, { evento: proximo.titulo, data: data(proximo.dataInicio) })
    : p.eventos.textoVazio;
  const t = p.telemovel;

  return (
    <Moldura>
      {/* Marca a página para globals.css tirar a rolagem no computador. */}
      <span data-painel-fixo hidden />
      <Logotipo />
      <h1 className="sr-only">Painel da MotoBox Angola</h1>

      {/* ---------- Telemóvel: um ecrã, quatro páginas de lado ----------
          Altura: o ecrã menos a margem de cima e a zona do botão de acção (pb-24 no Cenario). */}
      <div className="flex h-[calc(100svh-var(--gutter)-6rem)] min-h-[28rem] flex-col gap-[var(--intervalo)] lg:hidden">
        <div className="revelar h-[var(--tile)] shrink-0 pl-[var(--recorte)]" style={ordem(1)}>
          <Tempo />
        </div>
        <PainelTelemovel
          paginas={[
            {
              id: "destaques",
              nome: t.destaques,
              conteudo: (
                <div className="flex h-full flex-col gap-[var(--intervalo)]">
                  {/* Título do artigo um pouco mais pequeno do que no computador, para caber inteiro num telemóvel estreito. */}
                  <section aria-label="Artigos" className="painel revelar group min-h-0 flex-1 [&_h2]:text-[1.625rem]" style={ordem(3)}>
                    {destaques.length ? (
                      <DestaqueRotativo artigos={artigosDestaque} outros={outros} textos={p.destaque} intervalo={intervalo} />
                    ) : (
                      <PainelVazio href="/artigos" titulo={p.destaque.semArtigos} icone={<Newspaper />} />
                    )}
                  </section>
                  <EmFocoCompacto foco={foco} unidades={c.unidades} className="shrink-0" i={4} />
                </div>
              ),
            },
            {
              id: "comunidade",
              nome: t.comunidade,
              conteudo: (
                <div className="grid h-full grid-cols-2 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_7rem] gap-[var(--intervalo)]">
                  <PainelFoto
                    href="/clubes" foto={[p.clubes.foto, "painel-clubes"]} icone={<Users />}
                    titulo={p.clubes.titulo} texto={textoClubes} className="col-span-2" compacto i={3}
                  />
                  <PainelFoto
                    href={hrefEventos} foto={fotoEventos} icone={<CalendarDays />}
                    titulo={p.eventos.titulo} texto={textoEventos} className="col-span-2" compacto i={4}
                  />
                  <Ficha href="/forum" icone={<MessagesSquare />} titulo={p.fichas.forum} enche i={5} />
                  <Ficha href="/marketplace" icone={<Store />} titulo={p.fichas.marketplace} enche i={6} />
                </div>
              ),
            },
            {
              id: "desporto",
              nome: t.desporto,
              conteudo: (
                <div className="grid h-full grid-cols-2 grid-rows-[minmax(0,1fr)_7rem] gap-[var(--intervalo)]">
                  <PainelFoto
                    href="/desporto" foto={[p.desporto.foto, "competicao", "kilamba"]} icone={<Trophy />}
                    titulo={p.desporto.titulo} texto={textoDesporto} className="col-span-2" compacto i={3}
                  />
                  <Ficha href="/rotas" icone={<Route />} titulo={p.fichas.rotas} enche i={4} />
                  <Ficha href="/seguranca" icone={<ShieldCheck />} titulo={p.fichas.seguranca} enche i={5} />
                </div>
              ),
            },
            {
              id: "mais",
              nome: t.mais,
              conteudo: (
                <div className="grid h-full grid-cols-2 grid-rows-[minmax(0,1fr)_7rem_3.5rem] gap-[var(--intervalo)]">
                  <PainelFoto
                    href="/sobre" foto={[t.fotoSobre, "banner-sobre", "geral"]} icone={<BookOpen />}
                    titulo={p.fichas.sobre} texto={t.textoSobre} className="col-span-2" compacto i={3}
                  />
                  <Ficha
                    href="/contacto" icone={<Mail />} titulo={t.contacto} enche i={4}
                    className={instagram ? "" : "col-span-2"}
                  />
                  {instagram && (
                    <Ficha href={instagram.url} externo icone={<Icon name="instagram" />} titulo={t.instagram} enche i={5} />
                  )}
                  <FichaConta className="col-span-2" i={6} />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ---------- Computador: a grelha de 16 colunas ---------- */}
      <div className="hidden grid-cols-[var(--tile)_var(--tile)_minmax(0,1fr)] gap-[var(--intervalo)] lg:grid lg:h-full lg:grid-cols-[var(--tile)_repeat(15,minmax(0,1fr))] lg:grid-rows-[var(--tile)_minmax(0,1fr)_minmax(0,0.8fr)]">
        {/* ---------- Artigos em destaque (passam de um para o outro) ---------- */}
        <section
          aria-label="Artigos"
          className="painel recorte revelar group col-span-full h-[72svh] min-h-[30rem] lg:col-[1/12] lg:row-[1/3] lg:h-auto lg:min-h-0"
          style={ordem(0)}
        >
          {destaques.length ? (
            <DestaqueRotativo artigos={artigosDestaque} outros={outros} textos={p.destaque} intervalo={intervalo} />
          ) : (
            <PainelVazio href="/artigos" titulo={p.destaque.semArtigos} icone={<Newspaper />} />
          )}
        </section>

        {/* ---------- Clubes ---------- */}
        <PainelFoto
          href="/clubes"
          foto={[p.clubes.foto, "painel-clubes"]}
          icone={<Users />}
          titulo={p.clubes.titulo}
          texto={textoClubes}
          className="order-2 col-span-full h-64 lg:order-none lg:col-[1/5] lg:row-[3/4] lg:h-auto"
          i={1}
        />

        {/* ---------- Desporto ---------- */}
        <PainelFoto
          href="/desporto"
          foto={[p.desporto.foto, "competicao", "kilamba"]}
          icone={<Trophy />}
          titulo={p.desporto.titulo}
          texto={textoDesporto}
          className="order-3 col-span-full h-64 lg:order-none lg:col-[5/9] lg:row-[3/4] lg:h-auto"
          i={2}
        />

        {/* ---------- Eventos ---------- */}
        <PainelFoto
          href={hrefEventos}
          foto={fotoEventos}
          icone={<CalendarDays />}
          titulo={p.eventos.titulo}
          texto={textoEventos}
          className="order-4 col-span-full h-64 lg:order-none lg:col-[9/12] lg:row-[3/4] lg:h-auto"
          i={3}
        />

        {/* ---------- Redes e tempo ---------- */}
        {instagram && (
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seguir a MotoBox no Instagram"
            className="painel revelar order-7 flex h-[var(--tile)] items-center justify-center transition-colors hover:bg-black/70 lg:order-none lg:col-[12/13] lg:row-[1/2] lg:h-auto"
            style={ordem(4)}
          >
            <Icon name="instagram" className="size-6" />
          </a>
        )}
        <Link
          href="/contacto"
          aria-label="Falar com a MotoBox"
          className="painel revelar order-8 flex h-[var(--tile)] items-center justify-center transition-colors hover:bg-black/70 lg:order-none lg:col-[13/14] lg:row-[1/2] lg:h-auto"
          style={ordem(5)}
        >
          <Mail className="size-6" strokeWidth={1.6} aria-hidden />
        </Link>
        <div
          className={`revelar order-9 h-[var(--tile)] lg:order-none lg:col-[14/17] lg:row-[1/2] lg:h-auto ${instagram ? "" : "col-span-2"}`}
          style={ordem(6)}
        >
          <Tempo />
        </div>

        {/* ---------- Em foco: um evento com contagem, uma rota, um anúncio… ---------- */}
        <EmFoco
          foco={foco}
          unidades={c.unidades}
          className="order-6 col-span-full min-h-[22rem] lg:order-none lg:col-[12/17] lg:row-[2/3] lg:min-h-0"
          i={7}
        />

        {/* ---------- Secções de serviço: três em cima, duas em baixo ---------- */}
        <div className="order-5 col-span-full grid grid-cols-6 gap-[var(--intervalo)] lg:order-none lg:col-[12/17] lg:row-[3/4] lg:grid-rows-2">
          <Ficha href="/rotas" icone={<Route />} titulo={p.fichas.rotas} className="col-span-2" estreita i={8} />
          <Ficha href="/seguranca" icone={<ShieldCheck />} titulo={p.fichas.seguranca} className="col-span-2" estreita i={9} />
          <Ficha href="/sobre" icone={<BookOpen />} titulo={p.fichas.sobre} className="col-span-2" estreita i={10} />
          <Ficha href="/marketplace" icone={<Store />} titulo={p.fichas.marketplace} className="col-span-3" i={11} />
          <Ficha href="/forum" icone={<MessagesSquare />} titulo={p.fichas.forum} className="col-span-3" i={12} />
        </div>
      </div>
    </Moldura>
  );
}

/**
 * Um texto do conteúdo editável com {chaves} preenchidas, em que as chaves
 * com ligação passam a ligações (o nome do piloto, o título da prova…).
 */
function comLigacoes(modelo: string, valores: Record<string, string | number>, ligacoes: Record<string, string>): ReactNode {
  return modelo.split(/(\{\w+\})/).map((parte, n) => {
    const k = /^\{(\w+)\}$/.exec(parte)?.[1];
    if (!k || !(k in valores)) return parte;
    const valor = String(valores[k]);
    return ligacoes[k] ? (
      <Link
        key={n}
        href={ligacoes[k]}
        className="pointer-events-auto relative z-10 font-medium text-white underline decoration-white/50 underline-offset-[3px] transition-colors hover:decoration-mb-red-light"
      >
        {valor}
      </Link>
    ) : (
      valor
    );
  });
}

/**
 * Painel com fotografia, quadrado de ícone e título em cima à esquerda. A
 * ficha inteira leva à secção (ou ao item); as ligações dentro do texto
 * levam cada uma ao seu sítio, por cima da ligação da ficha.
 */
function PainelFoto({
  href,
  foto,
  icone,
  titulo,
  texto,
  className,
  compacto = false,
  i,
}: {
  href: string;
  foto: string | (string | undefined)[];
  icone: ReactNode;
  titulo: string;
  texto?: ReactNode;
  className: string;
  /** No painel do telemóvel: margens mais curtas e sem a seta, para caber numa página. */
  compacto?: boolean;
  i: number;
}) {
  return (
    <div className={`painel revelar group flex flex-col ${compacto ? "p-5" : "p-6 baixo:p-5 mbaixo:p-4"} ${className}`} style={ordem(i)}>
      <FotoFundo nome={foto} veu="cima" tamanhos="(max-width: 1024px) 100vw, 35vw" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/80 to-transparent" aria-hidden />
      {/* A ligação da ficha cobre-a toda; o conteúdo deixa passar os cliques, menos as ligações do texto. */}
      <Link
        href={href}
        className="absolute inset-0 rounded-[inherit] focus-visible:-outline-offset-4"
        aria-label={typeof texto === "string" ? `${titulo}: ${texto}` : titulo}
      />
      <div className="pointer-events-none flex items-start justify-between gap-4">
        <h2 className="titulo-4 max-w-[12ch]">{titulo}</h2>
        <Chip>{icone}</Chip>
      </div>
      {!compacto && <Seta className="pointer-events-none mt-4 size-5 baixo:mt-2 mbaixo:hidden" />}
      {texto && (
        <p className="pointer-events-none mt-auto line-clamp-3 max-w-[34ch] pt-2 text-sm leading-snug text-white/85 baixo:line-clamp-2">
          {texto}
        </p>
      )}
    </div>
  );
}

/**
 * Ficha escura pequena: quadrado de ícone em cima, título e seta numa só
 * linha em baixo, para caber inteira mesmo nas linhas mais baixas da grelha.
 */
function Ficha({ href, icone, titulo, className = "", estreita = false, enche = false, externo = false, i }: {
  href: string; icone: ReactNode; titulo: string; className?: string;
  /** Uma de três lado a lado: abaixo dos ecrãs largos (2xl) fica só com o título. */
  estreita?: boolean;
  /** No painel do telemóvel: enche a sua célula da página, em vez da altura fixa. */
  enche?: boolean;
  /** Endereço fora do site (abre noutro separador). */
  externo?: boolean;
  i: number;
}) {
  const classe = `painel painel-escuro revelar group @container flex ${enche ? "h-full" : "h-32"} min-w-0 flex-col justify-between gap-2 ${enche ? "p-4" : "p-3"} transition-colors hover:bg-near-black lg:h-auto 2xl:p-4 baixo:gap-1 baixo:p-3 mbaixo:p-2.5 ${className}`;
  const conteudo = (
    <>
      <Chip className="self-end mbaixo:!size-7 mbaixo:[&_svg]:!size-4">{icone}</Chip>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-[15px] font-semibold leading-tight">{titulo}</span>
        {/* A seta só aparece quando a ficha tem largura para ela e para o título. */}
        <Seta className={`hidden size-3.5 shrink-0 @min-[6.25rem]:block ${estreita ? "max-2xl:!hidden" : ""}`} />
      </span>
    </>
  );
  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classe} style={ordem(i)}>
      {conteudo}
    </a>
  ) : (
    <Link href={href} className={classe} style={ordem(i)}>
      {conteudo}
    </Link>
  );
}

function PainelVazio({ href, titulo, icone }: { href: string; titulo: string; icone: ReactNode }) {
  return (
    <Link href={href} className="flex h-full flex-col justify-end p-8">
      <span className="absolute right-5 top-5"><Chip>{icone}</Chip></span>
      <h2 className="titulo-2">{titulo}</h2>
      <Seta className="mt-4 size-5" />
    </Link>
  );
}
