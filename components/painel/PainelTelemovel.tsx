"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth/contexto";
import { useTextosGerais } from "./TextosGerais";
import { Chip, Seta, ordem } from "./kit";

/* ============================================================
   MOTOBOX — Painel Explorar no telemóvel
   No telemóvel o painel cabe num só ecrã: em vez de empilhar os
   mosaicos (e obrigar a rolar muito), divide-os em páginas que se
   passam de lado com o dedo. A passagem é a do próprio navegador
   (CSS scroll-snap), sem bibliotecas; os separadores de cima
   mostram a página em que se está e levam a cada uma. Um pedaço
   da página seguinte espreita na margem, para se perceber que há
   mais para o lado.

   A página aberta fica guardada na sessão do navegador: ao voltar
   de uma secção ("Voltar ao painel"), o painel abre onde estava.
   Os nomes das páginas editam-se em Gestão › Entrada e painel ›
   Painel Explorar › No telemóvel.
   ============================================================ */

export interface PaginaPainel {
  id: string;
  nome: string;
  conteudo: ReactNode;
}

const CHAVE = "mb-painel-pagina";

/** Posição de deslocação que centra a página `i` (a mesma que o scroll-snap escolhe). */
function posicao(c: HTMLElement, i: number): number | null {
  const p = c.children[i] as HTMLElement | undefined;
  return p ? p.offsetLeft - (c.clientWidth - p.offsetWidth) / 2 : null;
}

export function PainelTelemovel({ paginas, rotulo = "Secções do painel" }: { paginas: PaginaPainel[]; rotulo?: string }) {
  const [activa, setActiva] = useState(0);
  const carrossel = useRef<HTMLDivElement>(null);
  const separadores = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const c = carrossel.current;
    if (!c) return;
    const filhos = Array.from(c.children) as HTMLElement[];

    // Volta à página em que se estava (o observador acerta o separador).
    try {
      const guardada = Number(sessionStorage.getItem(CHAVE));
      const x = guardada > 0 ? posicao(c, guardada) : null;
      if (x !== null) c.scrollTo({ left: x, behavior: "auto" });
    } catch {
      /* armazenamento indisponível: começa na primeira */
    }

    // A página que ocupa a maior parte do carrossel é a activa.
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const i = filhos.indexOf(e.target as HTMLElement);
          if (i < 0) continue;
          setActiva(i);
          try {
            sessionStorage.setItem(CHAVE, String(i));
          } catch {
            /* indisponível */
          }
        }
      },
      { root: c, threshold: 0.6 },
    );
    filhos.forEach((f) => observador.observe(f));
    return () => observador.disconnect();
  }, []);

  const ir = (i: number) => {
    const c = carrossel.current;
    const x = c ? posicao(c, i) : null;
    if (!c || x === null) return;
    setActiva(i);
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.scrollTo({ left: x, behavior: calmo ? "auto" : "smooth" });
  };

  // Setas, Home e End entre os separadores (como num grupo de separadores do sistema).
  const teclas = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = paginas.length;
    const alvo =
      e.key === "ArrowRight" ? (i + 1) % n
      : e.key === "ArrowLeft" ? (i - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : null;
    if (alvo === null) return;
    e.preventDefault();
    separadores.current[alvo]?.focus();
    ir(alvo);
  };

  return (
    <>
      <div
        role="tablist"
        aria-label={rotulo}
        className="painel revelar flex h-11 shrink-0 items-stretch gap-1 p-1"
        style={ordem(2)}
      >
        {paginas.map((p, i) => {
          const sel = i === activa;
          return (
            <button
              key={p.id}
              ref={(el) => {
                separadores.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`painel-sep-${p.id}`}
              aria-selected={sel}
              aria-controls={`painel-pag-${p.id}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => ir(i)}
              onKeyDown={(e) => teclas(e, i)}
              className={`relative min-w-0 flex-auto rounded-[4px] px-1.5 text-[13px] font-medium leading-none transition-colors duration-300 ${
                sel ? "bg-white/[0.14] text-white" : "text-white/75 hover:text-white"
              }`}
            >
              {p.nome}
              {/* O acento vermelho por baixo do separador activo. */}
              <span
                aria-hidden
                className={`absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-mb-red transition-opacity duration-300 ${sel ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>

      {/* O carrossel vai de margem a margem do ecrã: as páginas passam por baixo das margens e a seguinte espreita. */}
      <div
        ref={carrossel}
        data-carrossel
        className="no-scrollbar relative -mx-[var(--gutter)] flex min-h-0 flex-1 snap-x snap-mandatory gap-[var(--intervalo)] overflow-x-auto overflow-y-hidden overscroll-x-contain px-[var(--gutter)]"
      >
        {paginas.map((p) => (
          <section
            key={p.id}
            id={`painel-pag-${p.id}`}
            role="tabpanel"
            aria-labelledby={`painel-sep-${p.id}`}
            className="h-full w-full shrink-0 snap-center snap-always"
          >
            {p.conteudo}
          </section>
        ))}
      </div>
    </>
  );
}

/** Linha da conta (entrar, ou a conta de quem já entrou), no fim da página "Mais". */
export function FichaConta({ className = "", i }: { className?: string; i: number }) {
  const { utilizador } = useAuth();
  const { barra } = useTextosGerais();
  const conta = Boolean(utilizador);
  return (
    <Link
      href={conta ? "/conta" : "/entrar"}
      className={`painel painel-escuro revelar group flex min-w-0 items-center gap-3 py-2 pl-2.5 pr-4 transition-colors hover:bg-near-black ${className}`}
      style={ordem(i)}
    >
      <Chip><UserRound /></Chip>
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight">{conta ? barra.conta : barra.entrar}</span>
      <Seta className="size-3.5 shrink-0" />
    </Link>
  );
}
