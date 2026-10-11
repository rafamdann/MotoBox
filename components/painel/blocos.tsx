import Link from "next/link";
import type { ReactNode } from "react";
import { Chip, Foto, FotoFundo, Seta, ordem } from "./kit";

/* ============================================================
   MOTOBOX — Blocos das páginas interiores
   Abertura em fotografia, cabeçalhos com quadrado de ícone,
   mosaicos de imagens, números em fichas escuras, cartões
   numerados e a chamada vermelha. Usados dentro de
   <PaginaInterior>.
   ============================================================ */

/** Abertura de página: fotografia a encher o painel, título grande à esquerda. */
export function Abertura({
  foto,
  sobretitulo,
  titulo,
  texto,
  children,
  compacta = false,
  posicaoFoto,
  tamanho = "1",
}: {
  foto: string | (string | undefined)[];
  sobretitulo?: ReactNode;
  titulo: ReactNode;
  texto?: ReactNode;
  children?: ReactNode;
  /** Abertura mais baixa, para páginas de lista. */
  compacta?: boolean;
  posicaoFoto?: string;
  /** "2" para títulos longos (artigos, eventos). */
  tamanho?: "1" | "2";
}) {
  return (
    <header
      className={`relative isolate flex flex-col justify-end overflow-hidden ${
        compacta ? "min-h-[60svh] lg:min-h-[64%]" : "min-h-[78svh] lg:min-h-full"
      }`}
    >
      <FotoFundo nome={foto} veu="esquerda" prioridade tamanhos="100vw" posicao={posicaoFoto} />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
      {/* Sombra leve no texto: com o véu mais claro, lê-se também sobre fotografias claras. */}
      <div className="coluna pb-14 pt-28 [text-shadow:0_1px_14px_rgb(0_0_0/0.45)] lg:pb-[12%]">
        {sobretitulo && <p className="sobretitulo surgir text-white/85" style={ordem(0)}>{sobretitulo}</p>}
        <h1
          className={`surgir mt-4 text-balance ${tamanho === "2" ? "titulo-2 max-w-[24ch]" : "titulo-1 max-w-[15ch]"}`}
          style={ordem(1)}
        >
          {titulo}
        </h1>
        {texto && (
          <div className="texto-lead surgir mt-6 max-w-[44ch] text-white/90" style={ordem(2)}>
            {texto}
          </div>
        )}
        {children && <div className="surgir mt-8" style={ordem(3)}>{children}</div>}
      </div>
    </header>
  );
}

/** Secção com espaçamento vertical e a coluna de conteúdo. */
export function Seccao({
  children,
  className = "",
  id,
  estreita = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  estreita?: boolean;
}) {
  return (
    <section id={id} className={`coluna scroll-mt-6 py-14 lg:py-20 ${estreita ? "max-w-5xl" : ""} ${className}`}>
      {children}
    </section>
  );
}

/** Quadrado de ícone, título grande e texto: o arranque de cada secção. */
export function Cabecalho({
  icone,
  titulo,
  texto,
  accao,
  className = "",
}: {
  icone?: ReactNode;
  titulo: ReactNode;
  texto?: ReactNode;
  accao?: { href: string; texto: string };
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-6 ${className}`}>
      <div className="max-w-2xl">
        {icone && <Chip grande className="mb-8">{icone}</Chip>}
        <h2 className="titulo-2 text-balance">{titulo}</h2>
        {texto && <div className="texto-lead mt-5 max-w-[46ch] text-white/85">{texto}</div>}
      </div>
      {accao && (
        <Link href={accao.href} className="group inline-flex items-center gap-3 text-[15px] text-white">
          <span className="sublinhado">{accao.texto}</span>
          <Seta className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

/** Três fotografias lado a lado, com 5px entre elas. */
export function Triptico({ fotos, className = "" }: { fotos: { nome: string; alt?: string }[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-[var(--intervalo)] md:grid-cols-[1fr_1.35fr_1fr] ${className}`}>
      {fotos.slice(0, 3).map((f, i) => (
        <Foto
          key={f.nome + i}
          nome={f.nome}
          alt={f.alt}
          className={`h-56 md:h-72 ${i === 1 ? "col-span-2 row-start-1 md:col-span-1 md:row-start-auto" : ""}`}
          largura={900}
        />
      ))}
    </div>
  );
}

/** Fichas escuras com um número grande e a legenda por baixo. */
export function Numeros({
  itens,
  colunas = 2,
  className = "",
}: {
  itens: { valor: ReactNode; texto: ReactNode; nota?: ReactNode }[];
  colunas?: 2 | 3 | 4;
  className?: string;
}) {
  const grelha = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" }[colunas];
  return (
    <dl className={`grid gap-[var(--intervalo)] ${grelha} ${className}`}>
      {itens.map((n, i) => (
        <div key={i} className="painel painel-escuro flex min-h-36 flex-col justify-end p-5 lg:min-h-40">
          <dt className="sr-only">{typeof n.texto === "string" ? n.texto : "Número"}</dt>
          <dd>
            <span className="block text-[2.5rem] leading-none tracking-tight lg:text-5xl">{n.valor}</span>
            <span className="mt-2 block text-sm leading-snug text-white/85">{n.texto}</span>
            {n.nota && <span className="mt-1 block text-xs text-white/70">{n.nota}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Cartão numerado, com a fotografia ao lado (lista de pontos de uma secção). */
export function CartaoNumerado({
  numero,
  sobretitulo,
  titulo,
  children,
  foto,
  inverter = false,
  href,
  compacto = false,
}: {
  numero: ReactNode;
  sobretitulo?: string;
  titulo: ReactNode;
  children: ReactNode;
  foto?: string | (string | undefined)[];
  inverter?: boolean;
  href?: string;
  /**
   * Abaixo do computador, uma linha compacta: o número ao lado do texto, sem
   * as alturas mínimas e sem a fotografia grande (fica uma miniatura a partir
   * do tablet). No computador é igual ao cartão normal. Para listas de vários
   * cartões seguidos, que no telemóvel ocupariam ecrãs inteiros.
   */
  compacto?: boolean;
}) {
  const c = (normal: string, compactas: string) => (compacto ? compactas : normal);
  const texto = (
    <div
      className={`painel painel-escuro flex ${c(
        "min-h-80 flex-col p-6 lg:p-10",
        "h-full items-start gap-4 p-5 lg:min-h-80 lg:flex-col lg:items-stretch lg:gap-0 lg:p-10",
      )}`}
    >
      <span
        aria-hidden
        className={`grid shrink-0 place-items-center rounded-[4px] bg-mb-red font-semibold text-white ${c(
          "size-10 text-lg",
          "size-8 text-base lg:size-10 lg:text-lg",
        )}`}
      >
        {numero}
      </span>
      <div className={c("mt-auto pt-16", "min-w-0 flex-1 lg:mt-auto lg:flex-none lg:pt-16")}>
        {sobretitulo && <p className={c("text-sm text-white/80", "text-[0.8125rem] text-white/80 lg:text-sm")}>{sobretitulo}</p>}
        <h3 className={`titulo-4 ${c("mt-3", "mt-1 lg:mt-3")}`}>{titulo}</h3>
        <div
          className={`max-w-[52ch] leading-relaxed text-white/85 ${c(
            "mt-4 text-[15px]",
            "mt-2 text-sm lg:mt-4 lg:text-[15px]",
          )}`}
        >
          {children}
        </div>
        {href && (
          <span className={`inline-flex items-center gap-2 text-sm text-white ${c("mt-6", "mt-3 lg:mt-6")}`}>
            <span className="sublinhado">Ver mais</span>
            <Seta className="size-3" />
          </span>
        )}
      </div>
    </div>
  );
  const corpo = (
    <div
      className={`grid gap-[var(--intervalo)] ${
        foto ? (compacto ? "sm:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[1.05fr_1fr]" : "lg:grid-cols-[1.05fr_1fr]") : ""
      }`}
    >
      <div className={inverter ? "lg:order-2" : ""}>{texto}</div>
      {foto && (
        <Foto
          nome={foto}
          className={c("min-h-64 lg:min-h-full", "hidden sm:block sm:min-h-full")}
          largura={1100}
        />
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="group block">
      {corpo}
    </Link>
  ) : (
    corpo
  );
}

/** Ficha escura com ícone, título em vermelho e texto curto. */
export function CartaoIcone({
  icone,
  titulo,
  children,
  className = "",
}: {
  icone: ReactNode;
  titulo: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`painel painel-escuro flex flex-col p-6 ${className}`}>
      <span aria-hidden className="text-white [&_svg]:size-8">{icone}</span>
      <h3 className="mt-10 text-lg font-semibold leading-snug text-mb-red-light">{titulo}</h3>
      <div className="mt-2 text-sm leading-relaxed text-white/85">{children}</div>
    </div>
  );
}

/** Ficha vermelha de chamada (seguir no Instagram, juntar um clube...). */
export function Chamada({
  href,
  icone,
  titulo,
  externo = false,
  className = "",
}: {
  href: string;
  icone: ReactNode;
  titulo: ReactNode;
  externo?: boolean;
  className?: string;
}) {
  const conteudo = (
    <>
      <span aria-hidden className="[&_svg]:size-9">{icone}</span>
      <span className="mt-auto block max-w-[14ch] pt-16 text-[1.65rem] font-medium leading-[1.1]">{titulo}</span>
      <Seta className="mt-5 size-6" />
    </>
  );
  const classes = `group flex min-h-72 flex-col rounded-[var(--raio)] bg-mb-red p-6 text-white transition-colors hover:bg-mb-red-dark ${className}`;
  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {conteudo}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {conteudo}
    </Link>
  );
}

/** Botão vermelho largo com seta (como "Become a member"). */
export function BotaoMB({
  href,
  children,
  externo = false,
  variante = "vermelho",
  className = "",
}: {
  href: string;
  children: ReactNode;
  externo?: boolean;
  variante?: "vermelho" | "escuro";
  className?: string;
}) {
  const cor =
    variante === "vermelho"
      ? "bg-mb-red hover:bg-mb-red-dark"
      : "bg-white/10 hover:bg-white/20";
  const classes = `group inline-flex h-14 w-full max-w-[20.5rem] items-center justify-between gap-6 rounded-[var(--raio)] px-5 text-[15px] text-white transition-colors ${cor} ${className}`;
  const dentro = (
    <>
      <span>{children}</span>
      <Seta className="size-4" />
    </>
  );
  return externo ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {dentro}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {dentro}
    </Link>
  );
}

/** Frase grande sobre fotografia, a fechar a página, com um botão. */
export function FraseFinal({
  foto,
  frase,
  children,
}: {
  foto: string | (string | undefined)[];
  frase: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="coluna py-6">
      <div className="relative isolate flex min-h-[32rem] flex-col justify-center overflow-hidden rounded-[var(--raio)] px-6 py-16 lg:min-h-[36rem] lg:px-12">
        <FotoFundo nome={foto} veu="esquerda" tamanhos="(max-width: 1024px) 100vw, 80vw" />
        <p className="titulo-2 max-w-[18ch] text-balance">{frase}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}

/** Lista de pílulas de filtro (ligações), com a activa a vermelho. */
export function Pilulas({
  itens,
  activa,
  rotulo,
}: {
  itens: { href: string; texto: string; chave: string }[];
  activa: string;
  rotulo: string;
}) {
  return (
    <nav aria-label={rotulo} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {itens.map((i) => (
        <Link key={i.chave} href={i.href} scroll={false} className="pilula" aria-current={i.chave === activa ? "page" : undefined}>
          {i.texto}
        </Link>
      ))}
    </nav>
  );
}
