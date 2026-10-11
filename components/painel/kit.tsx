import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { src as fotoSrc, otimizavel } from "@/lib/imagens";
import { comBase } from "@/lib/base";
import { tintaSobre } from "@/lib/cor";

/* ============================================================
   MOTOBOX — Peças do painel
   Moldura, quadrado do logótipo, quadrados de ícone, seta e
   fotografia de fundo. Todas as páginas públicas montam-se com
   estas peças.
   ============================================================ */

/** Moldura de página: largura com margens laterais e, no computador, a altura do ecrã. */
export function Moldura({
  children,
  fixa = true,
  className = "",
}: {
  children: ReactNode;
  /** No computador, a moldura ocupa a altura do ecrã (o conteúdo rola por dentro). */
  fixa?: boolean;
  className?: string;
}) {
  return <div className={`moldura ${fixa ? "moldura-fixa" : ""} ${className}`}>{children}</div>;
}

/**
 * Quadrado do logótipo, no canto superior esquerdo de todas as páginas.
 * `flutuante`: por cima de um painel de ecrã inteiro, afastado do canto e
 * com o fundo desfocado, para se ler sobre qualquer fotografia.
 */
export function Logotipo({ flutuante = false }: { flutuante?: boolean }) {
  return (
    <div
      className={`absolute z-30 size-[var(--tile)] ${
        flutuante ? "left-4 top-4 md:left-5 md:top-5" : "left-0 top-0"
      }`}
    >
      <Link
        href="/"
        aria-label="MotoBox Angola, página de entrada"
        className={`painel group flex size-full items-center justify-center transition-colors hover:bg-black/70 ${
          flutuante ? "backdrop-blur-md" : ""
        }`}
      >
        <Image
          src={comBase("/marca/motobox-original-240.png")}
          alt=""
          width={240}
          height={240}
          priority
          unoptimized
          className="w-[90%] max-w-[5.25rem] transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
    </div>
  );
}

/** Quadrado de ícone vermelho. */
export function Chip({ children, grande = false, className = "" }: { children: ReactNode; grande?: boolean; className?: string }) {
  return (
    <span aria-hidden className={`chip-mb ${grande ? "chip-mb-lg" : ""} ${className}`}>
      {children}
    </span>
  );
}

/** Seta para fora (↗), que troca de lugar ao passar o rato sobre o grupo. */
export function Seta({ className = "size-[1.15rem]", para = "fora" }: { className?: string; para?: "fora" | "direita" }) {
  const d =
    para === "fora"
      ? "M0 11.6 9.6 2H1V0h12v12h-2V3.4L1.4 13z"
      : "M0 5.5h10.1L6.3 1.7 7.7.3 13.9 6.5l-6.2 6.2-1.4-1.4 3.8-3.8H0z";
  const sai = para === "fora" ? "group-hover:translate-x-full group-hover:-translate-y-full" : "group-hover:translate-x-full";
  const entra = para === "fora" ? "-translate-x-full translate-y-full" : "-translate-x-full";
  return (
    <span aria-hidden className={`relative inline-block shrink-0 overflow-hidden ${className}`}>
      <svg viewBox="0 0 14 14" className={`absolute inset-0 size-full transition-transform duration-300 ease-in-out ${sai}`}>
        <path fill="currentColor" d={d} />
      </svg>
      <svg
        viewBox="0 0 14 14"
        className={`absolute inset-0 size-full transition-transform duration-300 ease-in-out ${entra} group-hover:translate-x-0 group-hover:translate-y-0`}
      >
        <path fill="currentColor" d={d} />
      </svg>
    </span>
  );
}

/**
 * Fotografia que enche o painel, com o véu de leitura por cima.
 * `veu`: "baixo" escurece de baixo para cima; "esquerda" escurece o lado do texto.
 */
export function FotoFundo({
  nome,
  alt = "",
  veu = "baixo",
  largura = 1600,
  tamanhos = "(max-width: 1024px) 100vw, 60vw",
  prioridade = false,
  className = "",
  posicao,
}: {
  nome: string | (string | undefined)[];
  alt?: string;
  veu?: "baixo" | "esquerda" | "cima" | "total" | "nenhum";
  largura?: number;
  tamanhos?: string;
  prioridade?: boolean;
  className?: string;
  posicao?: string;
}) {
  const url = fotoSrc(nome, { w: largura });
  const veus: Record<string, string> = {
    baixo: "bg-gradient-to-t from-black/75 via-black/20 to-black/0",
    esquerda: "bg-gradient-to-r from-black/75 via-black/30 to-black/0",
    cima: "bg-gradient-to-b from-black/70 via-black/15 to-black/0",
    total: "bg-black/40",
    nenhum: "",
  };
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden bg-near-black ${className}`} aria-hidden={!alt}>
      {url && (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={tamanhos}
          priority={prioridade}
          unoptimized={!otimizavel(url)}
          className="foto-painel object-cover"
          style={posicao ? ({ objectPosition: posicao } as CSSProperties) : undefined}
        />
      )}
      {veu !== "nenhum" && <div className={`absolute inset-0 ${veus[veu]}`} />}
    </div>
  );
}

/** Fotografia simples, com cantos do painel (galerias e colunas de imagem). */
export function Foto({
  nome,
  alt = "",
  className = "",
  largura = 1200,
  tamanhos = "(max-width: 1024px) 100vw, 40vw",
}: {
  nome: string | (string | undefined)[];
  alt?: string;
  className?: string;
  largura?: number;
  tamanhos?: string;
}) {
  const url = fotoSrc(nome, { w: largura });
  return (
    <div className={`relative overflow-hidden rounded-[var(--raio)] bg-near-black ${className}`}>
      {url && (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={tamanhos}
          unoptimized={!otimizavel(url)}
          className="foto-painel object-cover"
        />
      )}
    </div>
  );
}

/** Quadradinho com as iniciais de um nome, na cor indicada (clubes sem logótipo). */
export function Monograma({ nome, cor = "#e10600", className = "size-12 text-base" }: { nome: string; cor?: string; className?: string }) {
  const iniciais = nome
    .replace(/[«»"']/g, "")
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^\d+$/.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || nome.slice(0, 2).toUpperCase();
  const tinta = tintaSobre(cor);
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[4px] font-semibold ${className}`}
      style={{ background: tinta.fundo, color: tinta.texto }}
    >
      {iniciais}
    </span>
  );
}

/** Estilo com o índice para escalonar as animações de entrada. */
export const ordem = (i: number): CSSProperties => ({ ["--i" as string]: i }) as CSSProperties;
