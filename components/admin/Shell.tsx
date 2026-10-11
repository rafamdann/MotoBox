"use client";

/* ============================================================
   MOTOBOX ADMIN — Estrutura da área de gestão
   No desenho do site: a fotografia de fundo desfocada, painéis
   de carvão translúcidos, o quadrado do logótipo no canto e o
   vermelho só no que está activo. Barra lateral com as secções
   pela ordem do site (Site, Conteúdo, Desporto, Comunidade…),
   barra de topo com o caminho e a conta.
   ============================================================ */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  Activity, CalendarDays, Database, ExternalLink, FileText, Flag, House, Images, Layers, LayoutGrid,
  ListOrdered, LogOut, Mail, Menu, MessagesSquare, Newspaper, Receipt, Route, Scale, Send, Settings,
  Shield, ShieldAlert, Sparkles, Store, Ticket, UserCog, UserRound, Users, X,
} from "lucide-react";
import { useAdmin, limparDadosLocais } from "@/lib/admin/store";
import { useAuth } from "@/lib/auth/contexto";
import { authConfigurada } from "@/lib/auth/clientes";
import { PAPEIS } from "@/lib/admin/types";
import { caminhoDaPagina, comBase } from "@/lib/base";

type Icone = ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;

interface ItemNav {
  href: string;
  nome: string;
  icone: Icone;
  /** Contador no estado, para o crachá */
  contador?: "mensagens" | "denuncias" | "encomendas";
}

interface GrupoNav {
  grupo: string;
  itens: ItemNav[];
}

export const NAVEGACAO: GrupoNav[] = [
  {
    grupo: "Visão geral",
    itens: [
      { href: "/admin", nome: "Painel", icone: LayoutGrid },
      { href: "/admin/atividade", nome: "Actividade", icone: Activity },
      { href: "/admin/organizador", nome: "Organizador IA", icone: Sparkles },
    ],
  },
  {
    grupo: "Site",
    itens: [
      { href: "/admin/site", nome: "Entrada e painel", icone: House },
      { href: "/admin/paginas", nome: "Páginas", icone: FileText },
      { href: "/admin/legais", nome: "Páginas legais", icone: Scale },
      { href: "/admin/media", nome: "Imagens e vídeos", icone: Images },
    ],
  },
  {
    grupo: "Conteúdo",
    itens: [
      { href: "/admin/noticias", nome: "Artigos", icone: Newspaper },
      { href: "/admin/eventos", nome: "Eventos", icone: CalendarDays },
      { href: "/admin/clubes", nome: "Clubes e movimentos", icone: Users },
      { href: "/admin/rotas", nome: "Rotas", icone: Route },
    ],
  },
  {
    grupo: "Desporto",
    itens: [
      { href: "/admin/provas", nome: "Provas", icone: Flag },
      { href: "/admin/corridas", nome: "Resultados", icone: ListOrdered },
      { href: "/admin/pilotos", nome: "Pilotos", icone: UserRound },
      { href: "/admin/equipas", nome: "Equipas", icone: Shield },
      { href: "/admin/modalidades", nome: "Modalidades", icone: Layers },
    ],
  },
  {
    grupo: "Comunidade",
    itens: [
      { href: "/admin/marketplace", nome: "Marketplace", icone: Store },
      { href: "/admin/forum", nome: "Fórum", icone: MessagesSquare },
      { href: "/admin/moderacao", nome: "Moderação", icone: ShieldAlert, contador: "denuncias" },
      { href: "/admin/mensagens", nome: "Mensagens", icone: Mail, contador: "mensagens" },
      { href: "/admin/newsletter", nome: "Newsletter", icone: Send },
      { href: "/admin/utilizadores", nome: "Utilizadores", icone: UserCog },
    ],
  },
  {
    grupo: "Bilheteira",
    itens: [
      { href: "/admin/bilheteira", nome: "Bilheteira", icone: Ticket },
      { href: "/admin/encomendas", nome: "Encomendas", icone: Receipt, contador: "encomendas" },
    ],
  },
  {
    grupo: "Sistema",
    itens: [
      { href: "/admin/definicoes", nome: "Definições", icone: Settings },
      { href: "/admin/dados", nome: "Dados", icone: Database },
    ],
  },
];

/* Ícones antigos por nome, para as páginas que ainda os usam. */
const CAMINHOS: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  news: "M4 4h13a2 2 0 0 1 2 2v13a2 2 0 0 0 2-2V8M4 4v14a2 2 0 0 0 2 2h13M8 8h7M8 12h7M8 16h4",
  ticket: "M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM13 5v14",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  send: "m22 2-7 20-4-9-9-4z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm18 2-10 7L2 6",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  tag: "M20.6 13.4 12 22l-9-9V3h10zM7.5 7.5h.01",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  route: "M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6",
  cart: "M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L23 6H6",
};

export function IconeNav({ nome, className = "size-4" }: { nome: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={CAMINHOS[nome] ?? CAMINHOS.grid} />
    </svg>
  );
}

/** Em desenvolvimento e sem Supabase, o painel abre sem sessão (para testar). */
const DEMONSTRACAO = !authConfigurada && process.env.NODE_ENV !== "production";

export function AdminShell({ children }: { children: ReactNode }) {
  const caminho = caminhoDaPagina(usePathname());
  const { estado, pronto, origem, erroSync, limparErro } = useAdmin();
  const { utilizador, perfil, equipa, carregando, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [aSair, setASair] = useState(false);
  const conta = useRef<HTMLDivElement>(null);

  // O proxy barra quem chega sem sessão; isto cobre a sessão que
  // termina com o painel já aberto (saída noutro separador, expiração).
  // A navegação é completa para que nada do painel fique em memória.
  useEffect(() => {
    if (DEMONSTRACAO || carregando || aSair) return;
    if (!utilizador) window.location.replace(comBase(`/entrar?destino=${encodeURIComponent(caminho)}`));
    else if (perfil && !equipa) window.location.replace(comBase("/sem-acesso"));
  }, [carregando, utilizador, perfil, equipa, aSair, caminho]);

  // Fecha o menu da conta ao clicar fora dele
  useEffect(() => {
    if (!contaAberta) return;
    const fora = (e: MouseEvent) => {
      if (conta.current && !conta.current.contains(e.target as Node)) setContaAberta(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [contaAberta]);

  // Fecha o menu móvel ao mudar de página
  const [caminhoMenu, setCaminhoMenu] = useState(caminho);
  if (caminhoMenu !== caminho) {
    setCaminhoMenu(caminho);
    setMenuAberto(false);
  }

  const terminarSessao = async () => {
    setASair(true);
    await sair();
    limparDadosLocais();
    window.location.replace(comBase("/entrar"));
  };

  const nome = perfil?.nome || utilizador?.email || (DEMONSTRACAO ? "Demonstração" : "");
  const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
  const papel = PAPEIS.find((p) => p.valor === perfil?.papel)?.nome ?? (DEMONSTRACAO ? "Sem sessão" : "");

  const contadores = {
    mensagens: estado.mensagens.filter((m) => !m.lida && !m.arquivada).length,
    denuncias: estado.denuncias.filter((d) => d.estado === "pendente").length,
    encomendas: estado.encomendas.filter((e) => e.estado === "pendente").length,
  };

  const activo = (href: string) => (href === "/admin" ? caminho === "/admin" : caminho === href || caminho.startsWith(`${href}/`));
  const grupoActual = NAVEGACAO.find((g) => g.itens.some((i) => activo(i.href)));
  const itemActual = grupoActual?.itens.find((i) => activo(i.href));

  const lateral = (
    <nav aria-label="Secções da gestão" className="flex h-full flex-col gap-[var(--intervalo)]">
      <div className="flex shrink-0 gap-[var(--intervalo)]">
        <Link href="/admin" aria-label="Painel de gestão" className="painel grid size-[var(--tile)] shrink-0 place-items-center transition-colors hover:bg-white/10">
          <Image src={comBase("/marca/motobox-original-240.png")} alt="" width={240} height={240} unoptimized priority className="w-[90%] max-w-[5.25rem]" />
        </Link>
        <div className="painel flex min-w-0 flex-1 flex-col justify-center px-4">
          <p className="truncate text-[15px] font-semibold leading-tight">Gestão</p>
          <p className="truncate text-xs text-white/75">Temporada {estado.definicoes.temporada}</p>
        </div>
        <button type="button" onClick={() => setMenuAberto(false)} aria-label="Fechar menu"
          className="painel grid size-[var(--tile)] shrink-0 place-items-center lg:hidden">
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="painel min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {NAVEGACAO.map((g) => (
          <div key={g.grupo} className="mb-3 last:mb-0">
            <p className="px-3 pb-1 text-xs text-white/70">{g.grupo}</p>
            <ul className="space-y-0.5">
              {g.itens.map((it) => {
                const n = it.contador ? contadores[it.contador] : 0;
                const sel = activo(it.href);
                const Ic = it.icone;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={sel ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-[var(--raio)] px-3 py-2 text-[14px] transition-colors ${
                        sel ? "bg-mb-red text-white" : "text-white/75 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <Ic className="size-[1.05rem] shrink-0" strokeWidth={1.8} aria-hidden />
                      <span className="flex-1 truncate">{it.nome}</span>
                      {pronto && n > 0 && (
                        <span className={`grid min-w-5 place-items-center rounded-[4px] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${sel ? "bg-white/25" : "bg-mb-red text-white"}`}>
                          {n}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <Link href="/" target="_blank" rel="noopener noreferrer"
        className="painel flex shrink-0 items-center justify-between gap-2 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
        Ver o site
        <ExternalLink className="size-4" aria-hidden />
        <span className="sr-only"> (abre numa nova janela)</span>
      </Link>
    </nav>
  );

  return (
    <div className="relative min-h-dvh text-white">
      {/* Fundo: a imagem do vídeo do site, desfocada, sob um véu leve */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#2a2a30]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comBase("/videos/fundo.jpg")} alt="" className="size-full scale-110 object-cover blur-[24px]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Barra lateral fixa em ecrãs grandes */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] p-4 pr-0 lg:block">{lateral}</aside>

      {/* Barra lateral deslizante em telemóvel */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMenuAberto(false)} aria-hidden />
          <aside className="relative h-full w-[19rem] max-w-[88vw] bg-[#2a2a30]/80 p-3 backdrop-blur-xl">{lateral}</aside>
        </div>
      )}

      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 px-3 pt-3 md:px-4 lg:px-4 lg:pt-4">
          <div className="painel flex h-14 items-center gap-3 !bg-[#2c2c33]/80 px-3 backdrop-blur-xl md:px-4">
            <button type="button" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"
              className="grid size-9 place-items-center rounded-[var(--raio)] bg-white/[0.07] text-white/80 hover:text-white lg:hidden">
              <Menu className="size-5" aria-hidden />
            </button>

            <p className="min-w-0 flex-1 truncate text-sm">
              {grupoActual && <span className="text-white/75">{grupoActual.grupo} <span aria-hidden>·</span> </span>}
              <span className="font-medium text-white">{itemActual?.nome ?? "Gestão"}</span>
            </p>

            {DEMONSTRACAO && (
              <span className="hidden rounded-[4px] bg-gold/15 px-2 py-1 text-xs font-medium text-gold sm:inline">Demonstração local</span>
            )}
            {pronto && origem === "local" && !DEMONSTRACAO && (
              <Link href="/admin/dados" className="hidden rounded-[4px] bg-gold/15 px-2 py-1 text-xs font-medium text-gold hover:bg-gold/25 sm:inline">
                Modo local
              </Link>
            )}
            {estado.definicoes.manutencao && (
              <Link href="/admin/definicoes" className="hidden rounded-[4px] bg-gold/15 px-2 py-1 text-xs font-medium text-gold sm:inline">
                Manutenção activa
              </Link>
            )}

            <div ref={conta} className="relative">
              <button
                type="button" onClick={() => setContaAberta((v) => !v)}
                aria-haspopup="menu" aria-expanded={contaAberta}
                className="flex items-center gap-2.5 rounded-[var(--raio)] px-1.5 py-1 transition-colors hover:bg-white/[0.07]"
              >
                <span className="grid size-8 place-items-center rounded-[var(--raio)] text-xs font-semibold text-white"
                  style={{ backgroundColor: perfil?.avatarCor ?? "#e10600" }}>
                  {iniciais}
                </span>
                <span className="hidden text-left text-xs leading-tight sm:block">
                  <span className="block max-w-40 truncate text-[13px] text-white">{nome}</span>
                  <span className="block text-white/75">{papel}</span>
                </span>
              </button>

              {contaAberta && (
                <div role="menu"
                  className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-[var(--raio)] border border-white/10 bg-[#2c2c33]/95 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm text-white">{nome}</p>
                    <p className="truncate text-xs text-white/75">{utilizador?.email}</p>
                  </div>
                  <Link href="/" target="_blank" role="menuitem"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white">
                    <ExternalLink className="size-3.5" aria-hidden />
                    Ver o site
                  </Link>
                  {!DEMONSTRACAO && (
                    <button type="button" role="menuitem" onClick={terminarSessao} disabled={aSair}
                      className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-2.5 text-left text-sm text-mb-red-light transition-colors hover:bg-mb-red/15 disabled:opacity-60">
                      <LogOut className="size-3.5" aria-hidden />
                      {aSair ? "A terminar sessão…" : "Terminar sessão"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {erroSync && (
            <div role="alert"
              className="mt-2 flex items-start gap-3 rounded-[var(--raio)] border border-mb-red/50 bg-mb-red/20 px-4 py-3 text-sm text-white backdrop-blur-xl">
              <span className="flex-1">{erroSync}</span>
              <button type="button" onClick={limparErro} aria-label="Fechar aviso"
                className="shrink-0 rounded-[4px] bg-white/10 px-2 py-0.5 text-xs hover:bg-white/20">
                Fechar
              </button>
            </div>
          )}
        </header>

        <main id="conteudo" className="mx-auto max-w-[1500px] px-3 pb-16 pt-6 md:px-4 lg:px-6 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
