"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Newspaper, Pause, Play } from "lucide-react";
import { Chip, FotoFundo, Seta } from "./kit";

/* ============================================================
   MOTOBOX — Artigos em destaque, no painel grande do Explorar
   Com vários artigos marcados como destaque, o painel passa de um
   para o outro sozinho (por omissão, a cada 7 segundos: Gestão ›
   Entrada e painel › Painel Explorar), esbatendo a fotografia e o
   texto. Uma barra no ponto activo mostra quanto falta; os pontos
   escolhem um artigo; o botão ao lado pára e retoma.

   Pára sozinho com o rato por cima ou com o foco do teclado lá
   dentro (para quem lê ou navega assim), e não roda com o movimento
   reduzido: fica o primeiro, e os pontos continuam a escolher.
   O servidor desenha já o primeiro artigo, inteiro.
   ============================================================ */

export interface ArtigoDestaque {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: string;
  foto: (string | undefined)[];
}

export interface ArtigoCurto {
  slug: string;
  titulo: string;
  categoria: string;
}

const consultaCalma = "(prefers-reduced-motion: reduce)";
const subscreverCalma = (aviso: () => void) => {
  const m = window.matchMedia(consultaCalma);
  m.addEventListener("change", aviso);
  return () => m.removeEventListener("change", aviso);
};

export function DestaqueRotativo({
  artigos, outros, textos, intervalo,
}: {
  /** Os artigos em destaque, pela ordem em que passam (pelo menos um). */
  artigos: ArtigoDestaque[];
  /** Para a caixa "Mais artigos": os três primeiros que não estão à vista. */
  outros: ArtigoCurto[];
  textos: { rotulo: string; maisArtigos: string; todosArtigos: string };
  /** Segundos de cada artigo; 0 desliga a passagem automática. */
  intervalo: number;
}) {
  const n = artigos.length;
  const [activo, setActivo] = useState(0);
  const [pausaManual, setPausaManual] = useState(false);
  const [sobre, setSobre] = useState(false);
  const [foco, setFoco] = useState(false);
  const calmo = useSyncExternalStore(subscreverCalma, () => window.matchMedia(consultaCalma).matches, () => false);
  const barra = useRef<HTMLSpanElement>(null);
  const animacao = useRef<Animation | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const bloco = useRef<HTMLDivElement>(null);
  const lateral = useRef<HTMLElement>(null);

  const roda = n > 1 && intervalo > 0 && !calmo;
  const parado = pausaManual || sobre || foco;
  const actual = artigos[Math.min(activo, n - 1)];

  // A barra do ponto activo enche durante o intervalo; quando acaba, passa ao seguinte.
  useEffect(() => {
    const el = barra.current;
    if (!roda || !el || typeof el.animate !== "function") return;
    const a = el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: intervalo * 1000, easing: "linear", fill: "forwards",
    });
    a.onfinish = () => setActivo((i) => (i + 1) % n);
    animacao.current = a;
    return () => { a.onfinish = null; a.cancel(); animacao.current = null; };
  }, [activo, roda, intervalo, n]);

  useEffect(() => {
    const a = animacao.current;
    if (!a) return;
    if (parado) a.pause();
    else if (a.playState === "paused") a.play();
  }, [parado, activo, roda]);

  const escolher = useCallback((i: number) => setActivo(i), []);
  const mais = outros.filter((a) => a.slug !== actual.slug).slice(0, 3);

  // Encaixe pela altura real do painel (e não pela da janela): as letras não
  // medem o mesmo em todos os computadores (no Mac são maiores), por isso
  // mede-se e aperta-se até caber. Só mexe em atributos do DOM, sem estado.
  useLayoutEffect(() => {
    const r = raiz.current;
    if (!r) return;
    const encaixar = () => {
      const P = r.getBoundingClientRect();
      if (!P.height) return;
      // "Mais artigos": tira artigos do fim até a caixa caber por baixo do ícone do canto.
      const caixa = lateral.current;
      if (caixa) {
        const itens = [...caixa.querySelectorAll<HTMLElement>("li")];
        caixa.style.display = "";
        itens.forEach((li) => (li.style.display = ""));
        if (caixa.offsetParent) {
          const livre = P.height - 76;
          let visiveis = itens.length;
          while (caixa.offsetHeight > livre && visiveis > 1) itens[--visiveis].style.display = "none";
          if (caixa.offsetHeight > livre) caixa.style.display = "none";
        }
        r.toggleAttribute("data-sem-caixa", caixa.style.display === "none");
      }
      // O texto do destaque não pode subir para cima do logótipo: primeiro sai o
      // resumo, depois o título fica em duas linhas, por fim fica mais pequeno.
      const logo = [...document.querySelectorAll<HTMLElement>("a[aria-label^=\"MotoBox Angola\"]")]
        .map((a) => a.getBoundingClientRect())
        .find((L) => L.width && L.right > P.left && L.left < P.right && L.bottom > P.top && L.top < P.bottom);
      const topoLivre = (logo ? logo.bottom - P.top : 0) + 14;
      const texto = bloco.current;
      if (!texto) return;
      for (let nivel = 0; nivel <= 3; nivel++) {
        r.dataset.aperto = String(nivel);
        if (texto.getBoundingClientRect().top - P.top >= topoLivre) break;
      }
    };
    encaixar();
    const obs = new ResizeObserver(encaixar);
    obs.observe(r);
    document.fonts?.ready.then(encaixar).catch(() => {});
    // Durante a animação de entrada o painel ainda está deslocado: volta a medir no fim.
    const painel = r.closest(".revelar");
    painel?.addEventListener("animationend", encaixar);
    const tarde = window.setTimeout(encaixar, 1500);
    return () => {
      obs.disconnect();
      painel?.removeEventListener("animationend", encaixar);
      window.clearTimeout(tarde);
    };
  }, [activo]);

  return (
    <div
      ref={raiz}
      className="destaque-rotativo absolute inset-0"
      onMouseEnter={() => setSobre(true)}
      onMouseLeave={() => setSobre(false)}
      // Só o foco do teclado pára a passagem: um clique num ponto escolhe e deixa continuar.
      onFocus={(e) => { if (e.target.matches(":focus-visible")) setFoco(true); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFoco(false); }}
    >
      {/* Fotografias, umas por cima das outras: só a activa se vê. */}
      {artigos.map((a, i) => (
        <div
          key={a.slug}
          aria-hidden
          className="absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none"
          style={{ opacity: i === activo ? 1 : 0 }}
        >
          <FotoFundo nome={a.foto} veu="esquerda" prioridade={i === 0} tamanhos="(max-width: 1024px) 100vw, 70vw" />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />

      <Link
        href={`/artigos/${actual.slug}`}
        aria-label={`Ler o artigo: ${actual.titulo}`}
        className="absolute inset-0 z-10"
      />
      <span className="absolute right-4 top-4 z-20 md:right-5 md:top-5">
        <Chip><Newspaper /></Chip>
      </span>

      <div ref={bloco} className="dr-texto pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 md:p-8 lg:pr-[18rem] xl:pr-[21rem] baixo:p-6 baixo:xl:pr-[19rem]">
        {/* Os textos ocupam a mesma célula: a altura é a do maior e a troca não salta. */}
        <div className="grid items-end">
          {artigos.map((a, i) => (
            <div
              key={a.slug}
              aria-hidden={i !== activo}
              className="[grid-area:1/1] transition-opacity duration-700 ease-in-out motion-reduce:transition-none"
              style={{ opacity: i === activo ? 1 : 0 }}
            >
              <p className="text-sm text-white/85">{textos.rotulo} · {a.categoria}</p>
              <h2 className="dr-titulo titulo-3 mt-3 line-clamp-3 max-w-[20ch] text-balance baixo:mt-2 baixo:line-clamp-2 baixo:text-[1.75rem]">{a.titulo}</h2>
              <p className="dr-resumo mt-3 line-clamp-3 max-w-[50ch] text-sm leading-relaxed text-white/90 md:text-[15px] baixo:line-clamp-2 mbaixo:hidden">
                {a.resumo}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-5 baixo:mt-3">
          <Seta className="size-5" />
          {n > 1 && (
            <div className="pointer-events-auto flex items-center gap-1" role="group" aria-label="Artigos em destaque">
              {artigos.map((a, i) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => escolher(i)}
                  aria-label={`Artigo ${i + 1} de ${n}: ${a.titulo}`}
                  aria-current={i === activo ? "true" : undefined}
                  className="group/ponto flex h-6 min-w-6 items-center justify-center rounded-full"
                >
                  <span
                    className={`relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                      i === activo ? "w-8 bg-white/35" : "w-2 bg-white/60 group-hover/ponto:bg-white"
                    }`}
                  >
                    {i === activo && (
                      <span
                        ref={barra}
                        className="absolute inset-0 origin-left bg-white"
                        // Sem passagem automática, a barra fica cheia.
                        style={roda ? { transform: "scaleX(0)" } : undefined}
                      />
                    )}
                  </span>
                </button>
              ))}
              {roda && (
                <button
                  type="button"
                  onClick={() => setPausaManual((p) => !p)}
                  aria-label={pausaManual ? "Retomar a passagem dos destaques" : "Parar a passagem dos destaques"}
                  className="ml-1 grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  {pausaManual ? <Play className="size-3.5" fill="currentColor" aria-hidden /> : <Pause className="size-3.5" fill="currentColor" aria-hidden />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mais artigos, por cima da fotografia */}
      <aside ref={lateral} className="absolute bottom-0 right-0 z-20 hidden w-[17rem] p-4 lg:block xl:w-[20rem] xl:p-5 baixo:xl:w-[18rem] baixo:xl:p-4">
        <div className="rounded-[var(--raio)] bg-black/60 p-4 backdrop-blur-md baixo:p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">{textos.maisArtigos}</p>
          <ul className="mt-3 divide-y divide-white/10">
            {/* Os que não cabem na altura do painel saem pelo fim (ver "encaixar"). */}
            {mais.map((a) => (
              <li key={a.slug}>
                <Link href={`/artigos/${a.slug}`} className="group/item block py-2.5 baixo:py-2">
                  <span className="block text-xs text-mb-red-light">{a.categoria}</span>
                  <span className="mt-0.5 line-clamp-2 text-sm leading-snug text-white/90 transition-colors group-hover/item:text-white">
                    {a.titulo}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/artigos" className="mt-2 inline-flex items-center gap-2 text-sm text-white">
            <span className="sublinhado">{textos.todosArtigos}</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
