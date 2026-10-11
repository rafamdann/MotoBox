"use client";

/* Faixa de navegação dentro de Desporto, no desenho do painel.

   Sem `modalidade`: o nível de Desporto. Mostra o caminho ("Desporto") e as
   secções do Campeonato Nacional (visão geral, calendário, resultados,
   classificação, pilotos, equipas), que juntam todas as modalidades. Entra na
   página Desporto e nas páginas de sempre do campeonato (pelos layouts).

   Com `modalidade`: "Desporto › Modalidade" e as secções dessa modalidade (as
   do Motocross por omissão; o Enduro e o Rally-Raid ganham a visão geral e o
   seu arquivo quando têm resultados).

   Vai sempre antes do <PaginaInterior>, fora do fluxo do painel:
   - no computador flutua no topo, alinhada à direita e encostada ao quadrado
     de ícone da secção: uma fila de pílulas da mesma altura, 5px entre elas,
     com a activa a vermelho. Fica parada enquanto o painel rola por baixo,
     como o logótipo;
   - no telemóvel e no tablet é uma faixa por cima do painel: o caminho numa
     linha e, por baixo, todas as secções à vista numa grelha de botões do
     mesmo tamanho (três por linha no telemóvel, todas numa linha no tablet),
     sem nada escondido fora do ecrã, com a activa a vermelho. */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useIdioma } from "@/lib/i18n/contexto";
import { caminhoDaPagina } from "@/lib/base";
import { MODALIDADE_PRINCIPAL, SECCOES_DESPORTO, SECCOES_MOTOCROSS } from "@/lib/desporto";

/**
 * Pílula. No telemóvel e no tablet é um botão da grelha, centrado e um pouco mais
 * claro; no computador, escura e opaca (o painel rola por baixo sem se ver).
 * A activa é sempre vermelha.
 */
const PILULA =
  "pilula h-8 justify-center bg-white/10 px-2 text-white/85 hover:bg-white/15 aria-[current=page]:bg-mb-red aria-[current=page]:font-medium aria-[current=page]:text-white " +
  "lg:h-9 lg:px-[0.95rem] lg:bg-near-black lg:font-normal lg:hover:bg-[#262626] lg:aria-[current=page]:bg-mb-red";

/** Colunas da grelha no telemóvel e no tablet: todas à vista, sem deslizar. */
function colunas(n: number): { telemovel: number; tablet: number } {
  const telemovel = n <= 3 ? n : n === 4 ? 2 : 3;
  return { telemovel, tablet: Math.min(n, 6) };
}

export function SubNavDesporto({
  modalidade,
  nome,
  principal,
  seccoes: proprias,
}: {
  /** Sem ela, a faixa é a de Desporto (campeonato). */
  modalidade?: string;
  /** Nome da modalidade, como está gravado no painel (Modalidades). */
  nome?: string;
  /** A modalidade em destaque, a casa do campeonato (por omissão, o Motocross). */
  principal?: boolean;
  /** Secções da modalidade (ver `seccoesDaModalidade`). Por omissão, as do Motocross na principal e nenhuma nas outras. */
  seccoes?: { href: string; chave: string }[];
}) {
  const { t } = useIdioma();
  const pathname = caminhoDaPagina(usePathname());
  const faixa = useRef<HTMLDivElement>(null);

  const ePrincipal = principal ?? modalidade === MODALIDADE_PRINCIPAL;
  const raiz = modalidade ? `/desporto/${modalidade}` : "/desporto";
  const seccoes = !modalidade
    ? SECCOES_DESPORTO
    : (proprias ?? (ePrincipal ? SECCOES_MOTOCROSS.map((s, i) => (i === 0 ? { ...s, href: raiz } : s)) : []));

  // A secção acesa: a própria página, ou uma página dentro dela (/pilotos/x acende Pilotos).
  const acesa = (href: string) => pathname === href || (href !== raiz && pathname.startsWith(href + "/"));
  // O segundo elo do caminho é a modalidade. No nível de Desporto a secção onde
  // se está já vem acesa nas pílulas, por isso o caminho fica só "Desporto".
  const segundo = modalidade && nome ? { href: raiz, nome } : undefined;

  // No computador a fila pode deslizar: se a secção acesa ficou fora da vista, centrá-la.
  useEffect(() => {
    const f = faixa.current;
    const activa = f?.querySelector<HTMLElement>('[data-seccao][aria-current="page"]');
    if (!f || !activa) return;
    const a = activa.getBoundingClientRect();
    const v = f.getBoundingClientRect();
    if (a.left >= v.left && a.right <= v.right) return;
    f.scrollLeft += a.left - v.left - (v.width - a.width) / 2;
  }, [pathname]);

  return (
    <div
      className={
        // Telemóvel e tablet: faixa no fluxo, por cima do painel.
        "relative z-30 border-b border-white/10 bg-black/70 backdrop-blur-md " +
        // Computador: fora do fluxo, no topo à direita, antes do quadrado de ícone
        // (right-5 + 2.25rem do quadrado + 5px) e sem chegar ao logótipo.
        "lg:absolute lg:right-[calc(1.25rem+2.25rem+var(--intervalo))] lg:top-5 lg:max-w-[calc(100%-2.5rem-var(--tile)-2.25rem-var(--intervalo)*3)] lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
      }
    >
      <div
        ref={faixa}
        className="no-scrollbar flex flex-col gap-2 px-4 py-2.5 md:px-5 lg:flex-row lg:items-center lg:gap-[var(--intervalo)] lg:overflow-x-auto lg:p-0"
      >
        <nav aria-label={t("desporto.caminho")} className="shrink-0">
          <ol className="flex h-6 items-center gap-2 pr-2 text-sm lg:h-9 lg:rounded-[4px] lg:bg-near-black lg:px-3.5">
            <li>
              <Link
                href="/desporto"
                aria-current={pathname === "/desporto" ? "page" : undefined}
                className={`transition-colors hover:text-white ${segundo ? "text-white/80" : "font-medium text-white"}`}
              >
                {t("nav.desporto")}
              </Link>
            </li>
            {segundo && (
              <>
                <li aria-hidden className="text-mb-red-light">›</li>
                <li>
                  <Link
                    href={segundo.href}
                    aria-current={pathname === segundo.href ? "page" : undefined}
                    className="font-medium whitespace-nowrap text-white transition-colors hover:text-mb-red-light"
                  >
                    {segundo.nome}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        {seccoes.length > 0 && (
          <nav
            aria-label={modalidade ? (modalidade === MODALIDADE_PRINCIPAL ? t("desporto.seccoesMotocross") : nome) : t("nav.desporto")}
            className="grid grid-cols-[repeat(var(--colunas),minmax(0,1fr))] gap-[var(--intervalo)] md:grid-cols-[repeat(var(--colunas-md),minmax(0,1fr))] lg:flex lg:shrink-0"
            style={{
              ["--colunas" as string]: colunas(seccoes.length).telemovel,
              ["--colunas-md" as string]: colunas(seccoes.length).tablet,
            }}
          >
            {seccoes.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                data-seccao
                aria-current={acesa(s.href) ? "page" : undefined}
                className={PILULA}
              >
                {t(s.chave)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
