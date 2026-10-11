import Link from "next/link";
import type { ReactNode } from "react";
import {
  CalendarDays, Newspaper, Route, ShieldCheck, Sparkles, Store, Timer, Trophy, Users,
} from "lucide-react";
import type { TipoFoco } from "@/lib/conteudo/grupos/site";
import { FotoFundo, Seta, ordem } from "./kit";
import { ContagemUbuntu, type UnidadesContagem } from "./ContagemUbuntu";
import type { Foco } from "./EmFoco";

/* ============================================================
   MOTOBOX — "Em foco", versão baixa para o painel do telemóvel
   O mesmo item do mosaico "Em foco" (./EmFoco.tsx), por baixo do
   artigo em destaque na primeira página do painel do telemóvel:
   a linha de cima, o título e, conforme o item, a contagem
   decrescente em fichas baixas (globals.css, .contagem-compacta),
   o preço ou uma linha de texto. O mosaico inteiro leva ao item.
   ============================================================ */

const ICONES: Record<TipoFoco, ReactNode> = {
  evento: <CalendarDays />,
  prova: <Trophy />,
  artigo: <Newspaper />,
  rota: <Route />,
  anuncio: <Store />,
  clube: <Users />,
  modalidade: <Trophy />,
  seguranca: <ShieldCheck />,
  personalizado: <Sparkles />,
};

const externo = (href: string) => /^https?:\/\//i.test(href);

export function EmFocoCompacto({ foco, unidades, className = "", i }: {
  foco: Foco;
  unidades: UnidadesContagem;
  className?: string;
  i: number;
}) {
  const comContagem = Boolean(foco.data);
  const classe = `painel revelar group flex flex-col p-4 [text-shadow:0_1px_10px_rgb(0_0_0/0.6)] ${className}`;
  const conteudo = (
    <>
      <FotoFundo nome={[...foco.foto, "passeios"]} veu="nenhum" tamanhos="(max-width: 1024px) 100vw, 30vw" />
      {/* Véu inteiro: o texto e a contagem ocupam o mosaico todo. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/40" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] text-white/90">{foco.sobretitulo}</p>
          <h2 className="mt-0.5 line-clamp-1 text-[17px] font-medium leading-snug">{foco.titulo}</h2>
        </div>
        <span aria-hidden className="mt-0.5 shrink-0 [&_svg]:size-5 [&_svg]:stroke-[1.6]">
          {comContagem ? <Timer /> : ICONES[foco.tipo]}
        </span>
      </div>
      {foco.data ? (
        <div className="contagem-compacta mt-2.5">
          <ContagemUbuntu data={foco.data} unidades={unidades} />
          {foco.dataExtenso && <span className="sr-only">{foco.dataExtenso}</span>}
        </div>
      ) : (
        <div className="mt-2 flex items-end justify-between gap-3">
          {foco.preco ? (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-2xl font-bold leading-none tracking-tight tabular-nums">{foco.preco}</span>
              {foco.precoNota && <span className="text-[0.8125rem] text-white/90">{foco.precoNota}</span>}
            </p>
          ) : (
            foco.linha && <p className="line-clamp-2 text-[0.8125rem] leading-snug text-white/90">{foco.linha}</p>
          )}
          {foco.accao && (
            <span className="inline-flex shrink-0 items-center gap-2 text-sm">
              <span className="sublinhado">{foco.accao}</span>
              <Seta className="size-3" />
            </span>
          )}
        </div>
      )}
    </>
  );

  return externo(foco.href) ? (
    <a href={foco.href} target="_blank" rel="noopener noreferrer" className={classe} style={ordem(i)}>
      {conteudo}
    </a>
  ) : (
    <Link href={foco.href} className={classe} style={ordem(i)}>
      {conteudo}
    </Link>
  );
}
