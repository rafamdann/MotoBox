"use client";

/* ============================================================
   MOTOBOX ADMIN — Rotas: paragens, mapa, traçado e troços

   - As paragens mudam de ordem ou saem sem estragar os troços:
     cada troço guarda as paragens por posição, e aqui as posições
     acompanham as paragens.
   - "Recalcular o traçado" pede ao servidor (OSRM e SRTM) o
     caminho pelas paragens, os quilómetros e minutos de cada troço
     e as altitudes, e junta tudo à rota. Só fica no site ao gravar.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { comBase } from "@/lib/base";
import { descodificar, duracao, MARGEM_MOTA, NOME_PISO, urlMapaEmbebido, urlNavegacao } from "@/lib/rotas-mapas";
import { assinaturaParagens, coordValida, PISOS_TROCO, type Paragem, type PisoTroco, type Rota, type Troco } from "@/lib/rotas-tipos";
import { AccaoIcone, Aviso, Botao, Etiqueta, Grupo, Seta } from "@/components/admin/kit";
import { Formulario } from "@/components/admin/editor/Formulario";
import type { CampoEsquema, Valor } from "@/components/admin/editor/esquema";
import { fonte, fontes } from "./esquemas";

const eObj = (v: unknown): v is Valor => typeof v === "object" && v !== null && !Array.isArray(v);
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const km1 = (x: number) => Math.round(x * 10) / 10;

/** Minutos de mota num troço: os de carro com a margem do piso, aos 5 minutos. */
const minMota = (t: Partial<Troco>) =>
  Math.round((n(t.minCarro) * (MARGEM_MOTA[(t.piso as PisoTroco) ?? "asfalto"] ?? 0.85)) / 5) * 5;

export const paragensDe = (r: Rota): Paragem[] => (Array.isArray(r.paragens) ? r.paragens : []);
export const trocosDe = (r: Rota): Troco[] => (Array.isArray(r.trocos) ? r.trocos : []);

/** O traçado gravado ainda corresponde às paragens? */
export function estadoTracado(r: Rota): "sem" | "certo" | "desactualizado" {
  const ps = paragensDe(r);
  if (!r.tracado) return "sem";
  if (!ps.every(coordValida)) return "desactualizado";
  return r.tracadoDe === assinaturaParagens(ps) ? "certo" : "desactualizado";
}

/* ---------------- Recalcular ---------------- */

interface Calculo {
  pernas: { km: number; min: number }[];
  altitudes: (number | null)[];
  altimetria: Rota["altimetria"] | null;
  tracado: string;
  tracadoDe: string;
  km: number;
  aviso?: string;
}

/** Junta o cálculo à rota: altitudes, km e minutos de cada troço, altimetria e traçado. */
function aplicarCalculo(r: Rota, c: Calculo): Rota {
  const paragens = paragensDe(r).map((p, i) => (typeof c.altitudes[i] === "number" ? { ...p, alt: c.altitudes[i] as number } : p));
  const trocos = trocosDe(r).map((t) => {
    const a = Math.min(t.de, t.para);
    const b = Math.max(t.de, t.para);
    const pernas = c.pernas.slice(a, b);
    if (a < 0 || b > c.pernas.length || !pernas.length) return t;
    return { ...t, km: km1(pernas.reduce((s, p) => s + p.km, 0)), minCarro: pernas.reduce((s, p) => s + p.min, 0) };
  });
  return {
    ...r,
    paragens,
    trocos,
    altimetria: c.altimetria ?? r.altimetria,
    tracado: c.tracado,
    tracadoDe: c.tracadoDe,
  };
}

export function useRecalcular(rota: Rota, mudar: (r: Rota) => void, mostrar: (t: string, tom?: "ok" | "erro") => void) {
  const [aCalcular, setACalcular] = useState(false);
  const recalcular = async () => {
    const ps = paragensDe(rota);
    if (ps.length < 2) { mostrar("Junte pelo menos duas paragens com coordenadas.", "erro"); return; }
    const sem = ps.findIndex((p) => !coordValida(p));
    if (sem >= 0) { mostrar(`A paragem ${sem + 1} não tem coordenadas.`, "erro"); return; }
    setACalcular(true);
    try {
      const r = await fetch(comBase("/api/admin/rotas/tracado"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragens: ps.map((p) => ({ lat: p.lat, lng: p.lng })) }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro ?? "Falha ao calcular o traçado.");
      mudar(aplicarCalculo(rota, j as Calculo));
      mostrar(j.aviso ?? `Traçado recalculado: ${String(j.km).replace(".", ",")} km. Grave para o site o usar.`, j.aviso ? "erro" : "ok");
    } catch (e) {
      mostrar(e instanceof Error ? e.message : "Falha ao calcular o traçado.", "erro");
    } finally {
      setACalcular(false);
    }
  };
  return { recalcular, aCalcular };
}

/* ---------------- Mapa ---------------- */

/** O traçado gravado desenhado à escala, com as paragens numeradas. */
function DesenhoTracado({ rota }: { rota: Rota }) {
  const ps = paragensDe(rota).filter(coordValida);
  const linha = useMemo(() => {
    try { return rota.tracado ? descodificar(rota.tracado) : []; } catch { return []; }
  }, [rota.tracado]);
  const todos = [...linha, ...ps.map((p) => [p.lat, p.lng] as [number, number])];
  if (todos.length < 2) {
    return <p className="grid h-full place-items-center p-6 text-center text-sm text-white/70">Sem traçado calculado.</p>;
  }
  const lats = todos.map((p) => p[0]);
  const lngs = todos.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const larg = Math.max((maxLng - minLng) * k, 1e-4);
  const alt = Math.max(maxLat - minLat, 1e-4);
  const W = 400, H = 260, M = 18;
  const escala = Math.min((W - 2 * M) / larg, (H - 2 * M) / alt);
  const ox = (W - larg * escala) / 2, oy = (H - alt * escala) / 2;
  const xy = (lat: number, lng: number) => [ox + (lng - minLng) * k * escala, oy + (maxLat - lat) * escala] as const;
  const caminho = linha.map(([la, ln], i) => `${i ? "L" : "M"}${xy(la, ln).map((v) => v.toFixed(1)).join(" ")}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="size-full" role="img" aria-label="Desenho do traçado gravado, com as paragens">
      {caminho && <path d={caminho} fill="none" stroke="#e10600" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {ps.map((p, i) => {
        const [x, y] = xy(p.lat, p.lng);
        return (
          <g key={i}>
            <rect x={x - 8} y={y - 8} width={16} height={16} rx={3} fill={i === 0 ? "#e10600" : "#fff"} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={600} fill={i === 0 ? "#fff" : "#111"}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Google Maps embebido, como na página, actualizado um segundo depois de parar de escrever. */
function MapaGoogle({ paragens }: { paragens: { lat: number; lng: number }[] }) {
  const alvo = paragens.length >= 2 ? urlMapaEmbebido(paragens) : "";
  const [src, setSrc] = useState(alvo);
  useEffect(() => {
    if (alvo === src) return;
    const t = setTimeout(() => setSrc(alvo), 1000);
    return () => clearTimeout(t);
  }, [alvo, src]);
  if (!src) {
    return <p className="grid h-full place-items-center p-6 text-center text-sm text-white/70">Junte pelo menos duas paragens com coordenadas para ver o mapa.</p>;
  }
  return <iframe src={src} title="Mapa da rota no Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 size-full border-0" />;
}

export function PainelMapa({
  rota, recalcular, aCalcular,
}: { rota: Rota; recalcular: () => void; aCalcular: boolean }) {
  const validas = paragensDe(rota).filter(coordValida);
  const estado = estadoTracado(rota);
  const trocos = trocosDe(rota);
  const kmTotal = Math.round(trocos.reduce((s, t) => s + n(t.km), 0));
  const minTotal = trocos.reduce((s, t) => s + minMota(t), 0);
  return (
    <Grupo
      titulo="Mapa e traçado"
      descricao="À esquerda, o mapa do Google como aparece na página. À direita, o traçado gravado, que vai no ficheiro GPX."
      accoes={
        <>
          {validas.length >= 2 && (
            <a href={urlNavegacao(validas)} target="_blank" rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-[var(--raio)] px-4 text-sm font-medium text-white/75 hover:bg-white/[0.07] hover:text-white">
              Abrir no Google Maps<span className="sr-only"> (abre numa nova janela)</span>
            </a>
          )}
          <Botao variante="primario" onClick={recalcular} disabled={aCalcular || validas.length < 2}>
            <RefreshCw className={`size-4 ${aCalcular ? "animate-spin" : ""}`} aria-hidden />
            {aCalcular ? "A calcular…" : "Recalcular o traçado"}
          </Botao>
        </>
      }
    >
      <div className="grid gap-[var(--intervalo)] lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--raio)] bg-black/30">
          <MapaGoogle paragens={validas} />
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--raio)] bg-black/30">
          <DesenhoTracado rota={rota} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {estado === "certo" && <Etiqueta tom="ok">Traçado em dia com as paragens</Etiqueta>}
        {estado === "desactualizado" && <Etiqueta tom="ouro">As paragens mudaram: recalcule o traçado</Etiqueta>}
        {estado === "sem" && <Etiqueta tom="ouro">Ainda sem traçado: o GPX só leva as paragens</Etiqueta>}
        <span className="text-white/75 tabular-nums">
          {kmTotal} km · {duracao(minTotal)} a rodar de mota · {validas.length} paragens
        </span>
      </div>
      <p className="text-xs leading-relaxed text-white/75">
        O cálculo usa o OSRM (caminho de carro sobre o OpenStreetMap) e as altitudes do SRTM. Demora alguns segundos e
        actualiza as altitudes das paragens, os quilómetros e minutos de cada troço, as altitudes da rota e o traçado.
      </p>
    </Grupo>
  );
}

/* ---------------- Paragens ---------------- */

const ESQUEMA_PARAGEM: CampoEsquema[] = [
  { tipo: "texto", chave: "nome", etiqueta: "Nome da paragem", obrigatorio: true, placeholder: "Ex.: Miradouro da Leba" },
  { tipo: "coordenadas", chave: "_coord", etiqueta: "Onde fica" },
  { tipo: "numero", chave: "alt", etiqueta: "Altitude (m)", largura: "meia", ajuda: "Preenche-se ao recalcular o traçado." },
  { tipo: "texto", chave: "nota", etiqueta: "Nota", largura: "meia", ajuda: "Opcional: uma linha por baixo do nome, no itinerário." },
  fonte("fonte", "Onde se confirmou o sítio", "Aparece em \"Coordenadas das paragens\", ao lado das coordenadas."),
];

const paraFormulario = (p: Paragem): Valor => ({ ...p, _coord: { lat: p.lat, lng: p.lng } });
function doFormulario(v: Valor): Paragem {
  const { _coord, ...resto } = v;
  const c = eObj(_coord) ? _coord : {};
  return { ...(resto as unknown as Paragem), lat: c.lat as number, lng: c.lng as number };
}

const trocoNovo = (dia: number, de: number, para: number): Troco => ({
  dia, de, para, km: 0, minCarro: 0, piso: "asfalto", estrada: "", ver: "", fontes: [],
});

export function EditorParagens({ rota, mudar }: { rota: Rota; mudar: (r: Rota) => void }) {
  const ps = paragensDe(rota);
  const ts = trocosDe(rota);
  const [aberta, setAberta] = useState<number | null>(ps.length ? null : 0);

  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ps.length) return;
    const novas = [...ps];
    [novas[i], novas[j]] = [novas[j], novas[i]];
    const troca = (x: number) => (x === i ? j : x === j ? i : x);
    mudar({ ...rota, paragens: novas, trocos: ts.map((t) => ({ ...t, de: troca(t.de), para: troca(t.para) })) });
    setAberta((a) => (a === i ? j : a === j ? i : a));
  };

  const apagar = (k: number) => {
    const novas = ps.filter((_, i) => i !== k);
    const ultimo = Math.max(0, novas.length - 1);
    const ajusta = (x: number) => Math.min(x > k ? x - 1 : x, ultimo);
    mudar({ ...rota, paragens: novas, trocos: ts.map((t) => ({ ...t, de: ajusta(t.de), para: ajusta(t.para) })) });
    setAberta(null);
  };

  const juntar = () => {
    const nova = { nome: "", alt: 0, fonte: { nome: "", url: "" } } as unknown as Paragem;
    const novas = [...ps, nova];
    // Um troço novo da última paragem para a nova, no dia do último troço.
    const trocos = ps.length ? [...ts, trocoNovo(ts[ts.length - 1]?.dia ?? 1, ps.length - 1, ps.length)] : ts;
    mudar({ ...rota, paragens: novas, trocos });
    setAberta(ps.length);
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-white/75">
          Paragens <span className="ml-1 text-white/70">{ps.length}</span>
        </span>
        <span className="text-xs text-white/70">A primeira é a partida, a última a chegada.</span>
      </div>
      <p className="-mt-1 mb-3 text-xs leading-relaxed text-white/75">
        O caminho passa pelas paragens por esta ordem. Ao juntar uma paragem, junta-se também o troço que lá chega.
        Mudar a ordem ou apagar uma paragem leva os troços atrás.
      </p>
      <ol className="space-y-[var(--intervalo)]">
        {ps.map((p, i) => {
          const valida = coordValida(p);
          const aberto = aberta === i;
          const tipo = i === 0 ? "Partida" : i === ps.length - 1 ? "Chegada" : null;
          return (
            <li key={i} className="rounded-[var(--raio)] border border-white/10 bg-black/[0.18]">
              <div className="flex items-center gap-2 px-3 py-2">
                <button type="button" onClick={() => setAberta(aberto ? null : i)} aria-expanded={aberto}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                  <span className={`grid size-6 shrink-0 place-items-center rounded-[4px] text-xs font-semibold tabular-nums ${i === 0 ? "bg-mb-red text-white" : "bg-white/10 text-white/80"}`}>{i + 1}</span>
                  <span className="truncate text-sm text-white">{p.nome || "Paragem sem nome"}</span>
                  {tipo && <span className="hidden shrink-0 text-xs text-white/70 sm:inline">{tipo}</span>}
                  {!valida && <Etiqueta tom="vermelho">Sem coordenadas</Etiqueta>}
                  {valida && <span className="ml-auto hidden shrink-0 text-xs tabular-nums text-white/70 sm:inline">{Math.round(n(p.alt))} m</span>}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden
                    className={`size-4 shrink-0 text-white/75 transition-transform ${valida ? "" : "ml-auto"} ${aberto ? "rotate-180" : ""}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <span className="flex shrink-0 gap-1">
                  <AccaoIcone titulo="Subir" onClick={() => mover(i, -1)}><Seta para="cima" /></AccaoIcone>
                  <AccaoIcone titulo="Descer" onClick={() => mover(i, 1)}><Seta para="baixo" /></AccaoIcone>
                  <AccaoIcone titulo="Apagar paragem" tom="perigo" onClick={() => apagar(i)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                  </AccaoIcone>
                </span>
              </div>
              {aberto && (
                <div className="border-t border-white/10 p-3 md:p-4">
                  <Formulario
                    esquema={ESQUEMA_PARAGEM}
                    valor={paraFormulario(p)}
                    onChange={(v) => mudar({ ...rota, paragens: ps.map((x, j) => (j === i ? doFormulario(v) : x)) })}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <Botao className="mt-2" onClick={juntar}>
        <MapPin className="size-4" aria-hidden /> Juntar paragem
      </Botao>
    </div>
  );
}

/* ---------------- Troços ---------------- */

const OPCOES_PISO = PISOS_TROCO.map((p) => ({ valor: p, nome: NOME_PISO[p] }));

export function EditorTrocos({ rota, mudar }: { rota: Rota; mudar: (r: Rota) => void }) {
  const ps = paragensDe(rota);
  const ts = trocosDe(rota);
  const nomeP = (i: unknown) => {
    const k = Number(i);
    return ps[k] ? ps[k].nome || `Paragem ${k + 1}` : "?";
  };
  const opcoesParagens = ps.map((p, i) => ({ valor: String(i), nome: `${i + 1}. ${p.nome || "Paragem sem nome"}` }));
  const seguidos = ts.length === Math.max(0, ps.length - 1) && ts.every((t, i) => t.de === i && t.para === i + 1);

  const esquema: CampoEsquema[] = [
    {
      tipo: "lista", chave: "trocos", etiqueta: "Troços", nomeItem: "troço",
      ajuda: "Cada troço é um cartão do itinerário, de uma paragem a outra. Os troços do mesmo dia aparecem juntos.",
      resumo: (t) => {
        const kmT = n(Number(t.km));
        return `Dia ${t.dia ?? 1} · ${nomeP(t.de)} → ${nomeP(t.para)}${kmT ? ` · ${String(kmT).replace(".", ",")} km` : ""}`;
      },
      novo: () => {
        const ultimo = ts[ts.length - 1];
        const de = ultimo ? Math.min(ultimo.para, Math.max(0, ps.length - 2)) : 0;
        const t = trocoNovo(ultimo?.dia ?? 1, de, Math.min(de + 1, Math.max(0, ps.length - 1)));
        return { ...t, de: String(t.de), para: String(t.para) } as unknown as Valor;
      },
      campos: [
        { tipo: "seleccao", chave: "de", etiqueta: "De", largura: "meia", opcoes: opcoesParagens },
        { tipo: "seleccao", chave: "para", etiqueta: "Para", largura: "meia", opcoes: opcoesParagens },
        { tipo: "numero", chave: "dia", etiqueta: "Dia", largura: "meia", min: 1, passo: 1, ajuda: "Em que dia da viagem se faz." },
        { tipo: "seleccao", chave: "piso", etiqueta: "Piso", largura: "meia", opcoes: OPCOES_PISO, ajuda: "Conta para o tempo de mota (a mota ganha mais tempo no asfalto com buracos e menos na areia)." },
        { tipo: "numero", chave: "km", etiqueta: "Distância (km)", largura: "meia", min: 0, ajuda: "Preenche-se ao recalcular o traçado." },
        { tipo: "numero", chave: "minCarro", etiqueta: "Minutos de carro", largura: "meia", min: 0, ajuda: "Preenche-se ao recalcular o traçado." },
        {
          tipo: "personalizado", chave: "_mota", etiqueta: "Tempo de mota",
          render: (_v, _m, t) => (
            <p className="rounded-[var(--raio)] bg-white/[0.05] px-3 py-2.5 text-sm text-white/75">
              A página mostra <strong className="text-white">{duracao(minMota({ minCarro: Number(t.minCarro), piso: t.piso as PisoTroco }))}</strong> de mota:
              sempre menos do que de carro (a mota fura o trânsito e contorna os buracos), sem contar paragens.
            </p>
          ),
        },
        { tipo: "area", chave: "estrada", etiqueta: "A estrada", linhas: 2, ajuda: "Número, por onde passa e em que estado está." },
        { tipo: "area", chave: "ver", etiqueta: "Pelo caminho", linhas: 2, ajuda: "O que se vê neste troço." },
        { tipo: "area", chave: "aviso", etiqueta: "Aviso", linhas: 2, ajuda: "Opcional: aparece numa caixa vermelha no cartão do troço." },
        fontes(),
      ],
    },
  ];

  const valor = { trocos: ts.map((t) => ({ ...t, de: String(t.de), para: String(t.para) })) };
  const aoMudar = (v: Valor) => {
    const lista = Array.isArray(v.trocos) ? (v.trocos as Valor[]) : [];
    mudar({
      ...rota,
      trocos: lista.map((t) => ({ ...(t as unknown as Troco), de: Number(t.de ?? 0), para: Number(t.para ?? 0) })),
    });
  };

  const ligarPelaOrdem = () => {
    const precisos = Math.max(0, ps.length - 1);
    const novos = ts.map((t, i) => (i < precisos ? { ...t, de: i, para: i + 1 } : t));
    for (let i = novos.length; i < precisos; i++) novos.push(trocoNovo(novos[novos.length - 1]?.dia ?? 1, i, i + 1));
    mudar({ ...rota, trocos: novos });
  };

  return (
    <div className="space-y-4">
      {ps.length < 2 ? (
        <Aviso tom="atencao">Junte primeiro as paragens (separador &quot;Paragens e mapa&quot;): cada troço vai de uma paragem a outra.</Aviso>
      ) : !seguidos ? (
        <Aviso
          tom="info"
          titulo="Os troços não seguem as paragens uma a uma"
          accoes={<Botao tamanho="sm" onClick={ligarPelaOrdem}>Ligar as paragens pela ordem</Botao>}
        >
          Normalmente há um troço de cada paragem para a seguinte. O botão acerta o &quot;De&quot; e o &quot;Para&quot; de cada troço
          pela ordem das paragens (e junta os que faltarem), sem mexer nos textos.
        </Aviso>
      ) : null}
      <Formulario esquema={esquema} valor={valor} onChange={aoMudar} />
    </div>
  );
}
