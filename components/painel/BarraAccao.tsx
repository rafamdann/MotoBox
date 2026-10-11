"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/contexto";
import { caminhoDaPagina } from "@/lib/base";
import { useTextosGerais } from "./TextosGerais";

/* ============================================================
   MOTOBOX — Botão de acção
   O único comando fixo do site, por baixo da moldura:
   na entrada abre o painel ("Explorar"), no painel volta à
   entrada ("Fechar"), em qualquer outra página regressa ao
   painel. No telemóvel é uma pílula escura e compacta que
   flutua ao centro, por cima da margem segura do ecrã, com o
   ícone num círculo vermelho (o vermelho fica só como acento);
   no computador, o botão vermelho de sempre. Os textos editam-se em Gestão › Entrada e painel › Geral.
   ============================================================ */

type Estado = "explorar" | "fechar" | "voltar";

function estadoPara(caminho: string): Estado {
  if (caminho === "/") return "explorar";
  if (caminho === "/explorar") return "fechar";
  return "voltar";
}

const DESTINO: Record<Estado, string> = { explorar: "/explorar", fechar: "/", voltar: "/explorar" };

export function BarraAccao() {
  const caminho = caminhoDaPagina(usePathname());
  const estado = estadoPara(caminho);
  const { barra } = useTextosGerais();
  const rotulo: Record<Estado, string> = {
    explorar: barra.explorarRotulo || barra.explorar,
    fechar: barra.fecharRotulo || barra.fechar,
    voltar: barra.voltar,
  };
  // Nas páginas interiores o painel ocupa o ecrã inteiro: o botão flutua por cima.
  const flutua = estado === "voltar";

  return (
    <>
      {/* Ligação de conta: no telemóvel fica no fim do conteúdo, por cima da barra.
          No painel (que cabe num ecrã) está dentro do próprio painel, na página "Mais". */}
      {estado !== "fechar" && (
        <div className="px-[var(--gutter)] pb-6 pt-5 text-right lg:hidden">
          <LigacaoConta />
        </div>
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-40 max-lg:pointer-events-none max-lg:bottom-[calc(env(safe-area-inset-bottom,0px)+0.875rem)] max-lg:flex max-lg:justify-center ${
          flutua
            ? "lg:pointer-events-none lg:bottom-6 lg:flex lg:h-auto lg:justify-center"
            : "lg:relative lg:z-auto lg:flex lg:h-[var(--zona-accao)] lg:justify-center lg:pt-[15px]"
        }`}
      >
        <Link
          href={DESTINO[estado]}
          aria-label={rotulo[estado]}
          data-estado={estado}
          className={`group/accao pointer-events-auto flex items-center px-5 text-[15px] text-white transition-colors duration-300 lg:h-[50px] lg:w-[210px] lg:rounded-[var(--raio)] lg:bg-mb-red lg:hover:bg-mb-red-dark ${
            flutua ? "lg:shadow-[0_12px_40px_rgb(0_0_0/0.55)]" : ""
          } max-lg:h-12 max-lg:w-[11.75rem] max-lg:rounded-full max-lg:bg-[rgb(29_29_35/0.78)] max-lg:shadow-[0_10px_30px_rgb(0_0_0/0.45)] max-lg:ring-1 max-lg:ring-white/15 max-lg:backdrop-blur-md max-lg:hover:bg-[rgb(29_29_35/0.92)] ${
            estado === "voltar" ? "max-lg:pl-1.5" : "max-lg:pr-1.5"
          }`}
        >
          {/* No telemóvel a linha tem a altura do círculo do ícone; no computador, a de uma linha de texto. */}
          <span className="relative block h-9 w-full overflow-hidden lg:h-[1.3em]">
            <Rotulo activo={estado === "explorar"} de={estado === "fechar" ? "baixo" : "cima"}>
              <span>{barra.explorar}</span>
              <Circulo><IconeMenu /></Circulo>
            </Rotulo>
            <Rotulo activo={estado === "fechar"} de="baixo">
              <span>{barra.fechar}</span>
              <Circulo><IconeFechar /></Circulo>
            </Rotulo>
            <Rotulo activo={estado === "voltar"} de="baixo" inicio>
              <Circulo><IconeVoltar /></Circulo>
              <span>{barra.voltar}</span>
            </Rotulo>
          </span>
        </Link>
        <div
          className={`hidden lg:block ${
            flutua
              ? "pointer-events-auto absolute bottom-1.5 right-6 rounded-[var(--raio)] bg-black/55 px-3 py-2 backdrop-blur-md"
              : "absolute right-[var(--gutter)] top-[44px]"
          }`}
        >
          <LigacaoConta />
        </div>
      </div>
    </>
  );
}

function Rotulo({
  activo,
  de,
  inicio = false,
  children,
}: {
  activo: boolean;
  de: "cima" | "baixo";
  inicio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={`absolute inset-0 flex items-center gap-x-3 transition-all lg:gap-x-6 duration-300 ease-in-out ${
        inicio ? "justify-start" : "justify-between"
      } ${activo ? "translate-y-0 opacity-100" : de === "cima" ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"}`}
    >
      {children}
    </span>
  );
}

/** No telemóvel, o ícone num círculo vermelho; no computador some (`contents`) e o ícone fica como sempre. */
function Circulo({ children }: { children: React.ReactNode }) {
  return <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mb-red lg:contents">{children}</span>;
}

export function LigacaoConta() {
  const { utilizador } = useAuth();
  const { barra } = useTextosGerais();
  const conta = Boolean(utilizador);
  return (
    <Link href={conta ? "/conta" : "/entrar"} className="sublinhado text-sm text-white">
      {conta ? barra.conta : barra.entrar}
    </Link>
  );
}

function IconeMenu() {
  return (
    <svg viewBox="0 0 17 12" className="h-3 w-[17px] shrink-0" aria-hidden>
      <path fill="currentColor" d="M.012 12v-1.5H17V12zm0-4.881v-1.5H17v1.5zm0-4.882V.74H17v1.498z" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5 shrink-0" aria-hidden>
      <path
        fill="currentColor"
        d="M1.755 14 .702 12.947 6.298 7.35.702 1.755 1.755.702 7.35 6.298 12.947.702 14 1.755 8.404 7.35 14 12.947 12.947 14 7.35 8.404z"
      />
    </svg>
  );
}

function IconeVoltar() {
  return (
    <span className="relative block size-3 shrink-0 overflow-hidden">
      <svg viewBox="0 0 13 13" className="absolute inset-0 size-3 transition-transform duration-300 group-hover/accao:-translate-x-full group-hover/accao:translate-y-full" aria-hidden>
        <path fill="currentColor" d="M13 1.4 3.4 11H12v2H0V1h2v8.6L11.6 0z" />
      </svg>
      <svg viewBox="0 0 13 13" className="absolute inset-0 size-3 translate-x-full -translate-y-full transition-transform duration-300 group-hover/accao:translate-x-0 group-hover/accao:translate-y-0" aria-hidden>
        <path fill="currentColor" d="M13 1.4 3.4 11H12v2H0V1h2v8.6L11.6 0z" />
      </svg>
    </span>
  );
}
