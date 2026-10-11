"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useIdioma } from "@/lib/i18n/contexto";
import { caminhoDaPagina, comBase } from "@/lib/base";
import { ABERTURA_PADRAO, type ConteudoAbertura } from "@/lib/conteudo/grupos/site";

/* ============================================================
   MOTOBOX — Abertura: luzes de partida
   Uma vez por sessão do navegador, ao entrar no site: cinco pares
   de luzes vermelhas acendem-se uma a uma, como na grelha de uma
   corrida, e a pergunta "Pronto?"; ao fim de um instante apagam-se
   todas de uma vez, os capacetes da grelha arrancam e a cortina
   sobe como uma viseira. Dura uns quatro segundos. O botão vermelho
   arranca já; "Saltar" e Esc fecham-na logo.

   Os textos e o interruptor estão em Gestão › Entrada e painel ›
   Abertura (conteúdo "site.abertura"); o layout passa-os por props.

   O servidor nunca a desenha: a página está sempre por baixo,
   inteira, para quem a lê sem JavaScript (motores de pesquisa).
   Fica por cima do banner de cookies e da janela de sessão, e
   nunca aparece no painel de gestão. Com o movimento reduzido, as
   luzes acendem-se todas juntas e a abertura esbate-se, sem nada a
   deslizar.
   ============================================================ */

/** "1" = já foi mostrada nesta sessão. Os testes no Playwright usam-na para a saltar. */
const CHAVE = "motobox-capacete-v1";
/**
 * Robôs e capturas automáticas. "whatsapp" e "preview" saíram da lista: o
 * navegador dentro de algumas aplicações também os traz e escondia a abertura
 * a quem abria o site a partir de uma conversa.
 */
const ROBOS = /bot|crawl|spider|slurp|facebookexternalhit|lighthouse|headless|prerender|inspectiontool/i;

/** Textos em inglês para quem escolheu inglês e a equipa não mudou os de origem. */
const EM_INGLES: Partial<Record<keyof ConteudoAbertura, string>> = {
  sobretitulo: "Starting grid",
  titulo: "Ready?",
  texto: "Five red lights. When they all go out, we're off.",
  botao: "Go",
  saltar: "Skip",
  partida: "Lights out. Let's ride!",
  dica: "Esc also skips the intro.",
};

const semSubscricao = () => () => {};

export function IntroCapacete({ textos = ABERTURA_PADRAO }: { textos?: ConteudoAbertura }) {
  // Só no navegador: no servidor e na hidratação não há abertura nenhuma.
  const noNavegador = useSyncExternalStore(semSubscricao, () => true, () => false);
  if (!noNavegador || !textos.activa) return null;
  return <Abertura textos={textos} />;
}

function deveMostrar(caminho: string, onde: ConteudoAbertura["onde"]): boolean {
  // O endereço do navegador também conta: por trás do encaminhamento,
  // usePathname() pode chegar sem o prefixo ou vazio.
  const real = caminhoDaPagina(window.location.pathname);
  const admin = (c: string) => c === "/admin" || c.startsWith("/admin/");
  if (admin(caminho) || admin(real)) return false;
  if (onde === "entrada" && caminho !== "/" && real !== "/") return false;
  if (ROBOS.test(navigator.userAgent)) return false;
  try {
    return sessionStorage.getItem(CHAVE) !== "1";
  } catch {
    // Sem sessionStorage não há como lembrar: melhor não a mostrar em cada página.
    return false;
  }
}

/** luzes: acendem-se; partida: apagam-se e os capacetes arrancam; saida: a cortina sobe. */
type Fase = "luzes" | "partida" | "saida" | "fim";

const LUZES = 5;
/** Entre uma luz e a seguinte. */
const PASSO_MS = 550;

function Abertura({ textos }: { textos: ConteudoAbertura }) {
  const caminho = caminhoDaPagina(usePathname());
  const { idioma } = useIdioma();
  const [mostrar] = useState(() => deveMostrar(caminho, textos.onde));
  const [calmo] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [acesas, setAcesas] = useState(0);
  const [fase, setFase] = useState<Fase>(mostrar ? "luzes" : "fim");
  // Saltar esbate; arrancar deixa a cortina subir.
  const [saltou, setSaltou] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);

  const texto = (k: keyof ConteudoAbertura) => {
    const v = String(textos[k] ?? "");
    return idioma === "en" && v === String(ABERTURA_PADRAO[k]) && EM_INGLES[k] ? EM_INGLES[k]! : v;
  };

  // Marca como vista logo à entrada: um recarregamento a meio já não a repete.
  useEffect(() => {
    if (!mostrar) return;
    try { sessionStorage.setItem(CHAVE, "1"); } catch { /* indisponível */ }
    botao.current?.focus({ preventScroll: true });
  }, [mostrar]);

  const arrancar = useCallback(() => setFase((f) => (f === "luzes" ? "partida" : f)), []);
  const saltar = useCallback(() => {
    setSaltou(true);
    setFase((f) => (f === "luzes" || f === "partida" ? "saida" : f));
  }, []);

  // As luzes: uma a uma (ou todas juntas, com movimento reduzido); depois de
  // um instante que ninguém adivinha, como numa partida a sério, apagam-se.
  useEffect(() => {
    if (fase !== "luzes") return;
    const relogios: number[] = [];
    if (calmo) {
      relogios.push(window.setTimeout(() => setAcesas(LUZES), 250));
      relogios.push(window.setTimeout(arrancar, 2000));
    } else {
      for (let i = 1; i <= LUZES; i++) relogios.push(window.setTimeout(() => setAcesas(i), 450 + (i - 1) * PASSO_MS));
      const espera = 550 + Math.round(Math.random() * 450);
      relogios.push(window.setTimeout(arrancar, 450 + (LUZES - 1) * PASSO_MS + espera));
    }
    return () => relogios.forEach(clearTimeout);
  }, [fase, calmo, arrancar]);

  // Luzes apagadas: os capacetes arrancam e, logo a seguir, a cortina sobe.
  useEffect(() => {
    if (fase !== "partida") return;
    const r = window.setTimeout(() => setFase("saida"), calmo ? 650 : 750);
    return () => clearTimeout(r);
  }, [fase, calmo]);

  const saidaMs = calmo || saltou ? 300 : 600;
  useEffect(() => {
    if (fase !== "saida") return;
    const r = window.setTimeout(() => setFase("fim"), saidaMs);
    return () => clearTimeout(r);
  }, [fase, saidaMs]);

  useEffect(() => {
    if (fase === "fim") return;
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") saltar(); };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [fase, saltar]);

  if (fase === "fim") return null;

  const aSair = fase === "saida";
  const arrancou = fase === "partida" || fase === "saida";
  const ligadas = arrancou ? 0 : acesas;
  // Com movimento reduzido (ou ao saltar) só há um esbatido; senão, a cortina sobe como uma viseira.
  const estiloSaida: CSSProperties = calmo || saltou
    ? { opacity: aSair ? 0 : 1, transition: `opacity ${saidaMs}ms ease` }
    : { transform: aSair ? "translateY(-100%)" : "none", transition: `transform ${saidaMs}ms cubic-bezier(0.7, 0, 0.84, 0)` };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={texto("titulo")}
      onClick={arrancar}
      className="fixed inset-0 z-[98] flex cursor-pointer flex-col overflow-hidden bg-[#141417] text-white"
      style={estiloSaida}
    >
      {/* Brilho vermelho que cresce com cada luz e some quando se apagam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_28%,rgb(225_6_0/0.32),transparent_70%)] transition-opacity duration-150"
        style={{ opacity: ligadas / LUZES }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-4 pt-10 text-center [@media(max-height:720px)]:pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={comBase("/marca/motobox-palavra-480.png")} alt="" className="w-44 sm:w-56 [@media(max-height:720px)]:w-36" />
        {textos.sobretitulo && (
          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-white/85 sm:text-[13px] [@media(max-height:720px)]:mt-3">{texto("sobretitulo")}</p>
        )}

        <Portico ligadas={ligadas} />

        <div aria-live="polite" className="mt-8 sm:mt-10 [@media(max-height:720px)]:mt-5">
          <h2 className="titulo-1 text-balance [@media(max-height:720px)]:text-5xl">{arrancou ? texto("partida") : texto("titulo")}</h2>
        </div>
        {textos.texto && (
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/90 sm:text-base [@media(max-height:720px)]:mt-2">{texto("texto")}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-[var(--intervalo)] [@media(max-height:720px)]:mt-5">
          <button
            ref={botao}
            type="button"
            onClick={(e) => { e.stopPropagation(); arrancar(); }}
            className="inline-flex h-[50px] w-[12rem] items-center justify-between rounded-[6px] bg-mb-red px-5 text-[15px] text-white transition-colors hover:bg-mb-red-dark focus-visible:outline-offset-4"
          >
            {texto("botao")}
            <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true">
              <path fill="currentColor" d="M0 5.5h10.1L6.3 1.7 7.7.3 13.9 6.5l-6.2 6.2-1.4-1.4 3.8-3.8H0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); saltar(); }}
            className="inline-flex h-[50px] items-center rounded-[6px] bg-white/10 px-5 text-[15px] text-white transition-colors hover:bg-white/20 focus-visible:outline-offset-4"
          >
            {texto("saltar")}
          </button>
        </div>
        {textos.dica && <p className="mt-4 hidden text-[13px] text-white/75 [@media(pointer:fine)]:block [@media(max-height:720px)]:!hidden">{texto("dica")}</p>}
      </div>

      <Grelha arrancou={arrancou} calmo={calmo} />
    </div>
  );
}

/* ---------------- Pórtico das luzes ---------------- */

/** Cinco caixas penduradas numa trave, cada uma com duas luzes. */
function Portico({ ligadas }: { ligadas: number }) {
  return (
    <div aria-hidden className="mt-7 w-full max-w-[22rem] sm:mt-9 sm:max-w-[30rem] [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:max-w-[22rem]">
      <div className="h-2.5 rounded-[3px] bg-gradient-to-b from-[#3a3a42] to-[#24242a] shadow-[0_6px_18px_rgb(0_0_0/0.5)]" />
      <div className="mx-auto flex w-[92%] justify-between">
        {Array.from({ length: LUZES }, (_, i) => {
          const acesa = i < ligadas;
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="h-2 w-1.5 bg-[#2c2c33]" />
              <div className="flex flex-col gap-2 rounded-[8px] border border-white/10 bg-gradient-to-b from-[#1d1d22] to-[#101013] p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_10px_24px_rgb(0_0_0/0.55)] sm:gap-2.5 sm:p-2.5">
                {[0, 1].map((n) => (
                  <span
                    key={n}
                    className={`block size-8 rounded-full sm:size-11 [@media(max-height:720px)]:size-8 ${
                      acesa
                        ? "bg-[radial-gradient(circle_at_38%_35%,#ff8a7a,#ff2a17_38%,#c00500_75%)] shadow-[0_0_22px_6px_rgb(255_30_10/0.55),inset_0_-3px_6px_rgb(0_0_0/0.25)]"
                        : "bg-[radial-gradient(circle_at_38%_35%,#4a2020,#2a0f0f_55%,#170707)] shadow-[inset_0_2px_5px_rgb(0_0_0/0.6)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Capacetes na grelha ---------------- */

const PINTURAS: { casco: string; faixa: string; filete: string }[] = [
  { casco: "#e10600", faixa: "#ffffff", filete: "#1a1a1f" },
  { casco: "#f2f2f2", faixa: "#e10600", filete: "#1a1a1f" },
  { casco: "#34343c", faixa: "#e10600", filete: "#ffffff" },
];

/** Três capacetes alinhados na linha de partida; quando as luzes se apagam, arrancam. */
function Grelha({ arrancou, calmo }: { arrancou: boolean; calmo: boolean }) {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-3xl shrink-0 px-5 pb-6 sm:pb-8 [@media(max-height:720px)]:pb-4">
      <div className="flex items-end justify-center gap-6 sm:gap-12">
        {PINTURAS.map((p, i) => (
          <div
            key={i}
            className="w-[clamp(4.5rem,15vw,8.5rem)] [@media(max-height:720px)]:w-[clamp(4rem,10vw,5.5rem)]"
            style={
              calmo
                ? undefined
                : {
                    transform: arrancou ? "translateX(110vw)" : "none",
                    transition: `transform 900ms cubic-bezier(0.55, 0, 0.9, 0.35) ${i * 70}ms`,
                  }
            }
          >
            <Capacete {...p} />
          </div>
        ))}
      </div>
      {/* Linha de partida axadrezada. */}
      <div className="mt-2 h-2 w-full bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.85)_0_8px,transparent_8px_16px),repeating-linear-gradient(90deg,transparent_0_8px,rgb(255_255_255/0.85)_8px_16px)] bg-[length:100%_50%,100%_50%] bg-[position:0_0,0_100%] bg-no-repeat opacity-70" />
    </div>
  );
}

/** Capacete integral de corrida, de lado, virado para a direita. */
const CASCO = "M18 86 C6 64 8 32 32 16 C54 2 90 4 108 24 C118 35 122 50 120 62 L117 82 C115 93 106 99 94 99 L32 99 C25 99 21 94 18 86 Z";

function Capacete({ casco, faixa, filete }: { casco: string; faixa: string; filete: string }) {
  // Sem caracteres que estraguem url(#…).
  const id = `capacete${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 130 110" className="block h-auto w-full drop-shadow-[0_8px_14px_rgb(0_0_0/0.55)]">
      <defs>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a33" />
          <stop offset="1" stopColor="#050507" />
        </linearGradient>
        <radialGradient id={`${id}b`} cx="0.4" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {/* Casco, com luz de cima */}
      <path d={CASCO} fill={casco} />
      <path d={CASCO} fill={`url(#${id}b)`} />
      {/* Faixa de corrida e filete */}
      <path d="M9 52 C24 36 44 28 66 28 L67 37 C47 37 28 45 12 62 Z" fill={faixa} />
      <path d="M12 67 C28 50 46 43 67 42" fill="none" stroke={filete} strokeWidth="2.5" />
      {/* Viseira fumada, com reflexo */}
      <path d="M60 40 C76 33 104 34 119 44 C122 52 122 59 120 64 L66 67 C58 61 56 48 60 40 Z" fill={`url(#${id}v)`} />
      <path d="M70 43 C86 38 104 39 115 45" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="62" cy="54" r="4.5" fill="#5a5a63" />
      {/* Queixeira: entradas de ar */}
      <path d="M100 72 L116 70 M98 78 L115 77 M97 84 L113 84" stroke="#0d0d10" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
      {/* Remate de baixo */}
      <path d="M22 91 L116 89 C113 95 106 99 94 99 L32 99 C27 99 24 96 22 91 Z" fill="#0d0d10" fillOpacity="0.85" />
    </svg>
  );
}
