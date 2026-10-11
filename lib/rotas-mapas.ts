/* ============================================================
   MOTOBOX — Mapas, navegação e GPX das rotas

   Três saídas a partir da mesma lista de paragens:
   - o mapa embebido do Google (sem chave de API), com o trajecto;
   - a ligação "Abrir no Google Maps", pela Maps URLs API
     documentada, que no telemóvel abre a navegação passo a passo;
   - o ficheiro GPX, com as paragens, os pontos de interesse e o
     traçado calculado pelo OSRM sobre o OpenStreetMap.

   As paragens vão sempre em coordenadas: com nomes, o Google
   escolhe às vezes outro sítio com o mesmo nome.
   ============================================================ */

import type { Paragem, Rota, Troco } from "@/lib/rotas";

type Coord = { lat: number; lng: number };

const c = (p: Coord) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;

/** Mapa embebido com o trajecto desenhado e a distância e o tempo do Google. */
export function urlMapaEmbebido(paragens: Coord[]): string {
  const [origem, ...resto] = paragens;
  return `https://www.google.com/maps?saddr=${c(origem)}&daddr=${resto.map(c).join("+to:")}&dirflg=d&output=embed`;
}

/**
 * Navegação no Google Maps (Maps URLs API). A documentação aceita até nove
 * pontos intermédios; no browser do telemóvel, sem a aplicação, só três.
 */
export function urlNavegacao(paragens: Coord[]): string {
  const origem = paragens[0];
  const destino = paragens[paragens.length - 1];
  const meio = paragens.slice(1, -1);
  const q = new URLSearchParams({ api: "1", origin: c(origem), destination: c(destino), travelmode: "driving" });
  if (meio.length) q.set("waypoints", meio.map(c).join("|"));
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}

/** Um ponto no Google Maps. */
export const urlPonto = (p: Coord) => `https://www.google.com/maps/search/?api=1&query=${c(p)}`;

/** Paragens de um dia: a primeira de onde se parte e todas as de chegada. */
export function paragensDoDia(rota: Rota, dia: number): Paragem[] {
  const trocos = rota.trocos.filter((t) => t.dia === dia);
  if (!trocos.length) return [];
  return [rota.paragens[trocos[0].de], ...trocos.map((t) => rota.paragens[t.para])];
}

/* ---------------- Tempos ---------------- */

/**
 * Factor sobre o tempo de carro do OSRM. A mota chega sempre antes do
 * carro: ultrapassa e fura o trânsito, acelera mais nas subidas e, nos
 * buracos, contorna-os em vez de quase parar como um carro. A vantagem é
 * maior no asfalto esburacado e menor na areia, onde a mota também tem de
 * ir devagar. Não inclui paragens.
 */
export const MARGEM_MOTA: Record<Troco["piso"], number> = { asfalto: 0.85, buracos: 0.75, terra: 0.85, areia: 0.95 };

export const NOME_PISO: Record<Troco["piso"], string> = {
  asfalto: "Asfalto",
  buracos: "Asfalto com buracos",
  terra: "Terra",
  areia: "Areia",
};

/** Minutos a rodar de mota num troço, arredondados aos 5 minutos. */
export const minMota = (t: Troco) => Math.round((t.minCarro * MARGEM_MOTA[t.piso]) / 5) * 5;

export function totais(rota: Rota) {
  const km = rota.trocos.reduce((s, t) => s + t.km, 0);
  const minCarro = rota.trocos.reduce((s, t) => s + t.minCarro, 0);
  const mota = rota.trocos.reduce((s, t) => s + minMota(t), 0);
  return { km: Math.round(km), minCarro: Math.round(minCarro), minMota: mota };
}

/** "45 min", "2h", "3h25". */
export function duracao(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h${String(r).padStart(2, "0")}` : `${h}h`;
}

/* ---------------- GPX ---------------- */

/** Descodifica uma polilinha codificada (formato do Google, precisão 5). */
export function descodificar(str: string): [number, number][] {
  const pts: [number, number][] = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  const ler = () => {
    let b: number;
    let s = 0;
    let r = 0;
    do {
      b = str.charCodeAt(i++) - 63;
      r |= (b & 31) << s;
      s += 5;
    } while (b >= 32);
    return r & 1 ? ~(r >> 1) : r >> 1;
  };
  while (i < str.length) {
    lat += ler();
    lng += ler();
    pts.push([lat / 1e5, lng / 1e5]);
  }
  return pts;
}

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** GPX 1.1 com as paragens (wpt), a rota (rte) e o traçado (trk). */
export function gerarGpx(rota: Rota, tracado: string | undefined, url: string): string {
  const linhas: string[] = [];
  linhas.push('<?xml version="1.0" encoding="UTF-8"?>');
  linhas.push(
    '<gpx version="1.1" creator="Motobox Angola" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
  );
  linhas.push("  <metadata>");
  linhas.push(`    <name>${xml(`Motobox: ${rota.nome}`)}</name>`);
  linhas.push(
    `    <desc>${xml(
      `${rota.resumo} Traçado calculado com o OSRM sobre dados do OpenStreetMap (ODbL). Confirme sempre o estado da estrada antes de partir.`,
    )}</desc>`,
  );
  linhas.push(`    <author><name>Motobox Angola</name></author>`);
  linhas.push(`    <copyright author="OpenStreetMap contributors"><license>https://opendatacommons.org/licenses/odbl/</license></copyright>`);
  linhas.push(`    <link href="${xml(url)}"><text>${xml(rota.nome)}</text></link>`);
  linhas.push("  </metadata>");

  for (const p of rota.paragens) {
    linhas.push(`  <wpt lat="${p.lat.toFixed(5)}" lon="${p.lng.toFixed(5)}">`);
    linhas.push(`    <ele>${p.alt}</ele>`);
    linhas.push(`    <name>${xml(p.nome)}</name>`);
    linhas.push(`    <type>Paragem</type>`);
    linhas.push("  </wpt>");
  }
  for (const p of rota.pontos) {
    linhas.push(`  <wpt lat="${p.lat.toFixed(5)}" lon="${p.lng.toFixed(5)}">`);
    linhas.push(`    <name>${xml(p.nome)}</name>`);
    linhas.push(`    <desc>${xml(p.nota)}</desc>`);
    linhas.push(`    <type>Ponto de interesse</type>`);
    linhas.push("  </wpt>");
  }

  linhas.push("  <rte>");
  linhas.push(`    <name>${xml(rota.nome)}</name>`);
  for (const p of rota.paragens) {
    linhas.push(`    <rtept lat="${p.lat.toFixed(5)}" lon="${p.lng.toFixed(5)}"><name>${xml(p.nome)}</name></rtept>`);
  }
  linhas.push("  </rte>");

  if (tracado) {
    linhas.push("  <trk>");
    linhas.push(`    <name>${xml(rota.nome)}</name>`);
    linhas.push("    <trkseg>");
    for (const [lat, lng] of descodificar(tracado)) {
      linhas.push(`      <trkpt lat="${lat.toFixed(5)}" lon="${lng.toFixed(5)}"/>`);
    }
    linhas.push("    </trkseg>");
    linhas.push("  </trk>");
  }
  linhas.push("</gpx>");
  return linhas.join("\n") + "\n";
}
