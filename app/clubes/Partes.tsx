import Link from "next/link";
import { Foto, Monograma, Seta } from "@/components/painel/kit";
import { localClube } from "@/lib/motobox";
import type { Clube } from "@/lib/types";
import { nomeTipo } from "./comum";

/* ============================================================
   MOTOBOX — Peças das páginas de clubes
   O cartão de clube é o do painel (components/painel/cartoes.tsx),
   com uma linha de apresentação por baixo do nome: o `resumo` do
   perfil alargado ou, sem perfil, a primeira frase da descrição.
   ============================================================ */

/** Primeira frase de um texto ("… família». Sai em raide …" → "… família»."). */
export const primeiraFrase = (texto: string) => texto.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý«])/)[0] ?? texto;

/**
 * No telemóvel é uma linha compacta (fotografia pequena à esquerda, nome e
 * uma linha de texto), para a lista não obrigar a rolar sem fim; a partir
 * do tablet volta a ser o cartão com a fotografia larga e as actividades.
 */
export function CartaoClube({ clube }: { clube: Clube }) {
  const linha = clube.resumo || primeiraFrase(clube.descricao);
  return (
    <Link
      href={`/clubes/${clube.slug}`}
      className="painel painel-escuro group flex items-stretch gap-3 p-[var(--intervalo)] md:flex-col md:gap-0"
    >
      <div className="relative w-[5.5rem] shrink-0 self-stretch md:w-auto md:self-auto">
        <Foto
          nome={[clube.imagem, clube.slug]}
          className="h-full min-h-[5.5rem] md:aspect-[16/9] md:h-auto md:min-h-0"
          largura={800}
          tamanhos="(max-width: 768px) 120px, 33vw"
        />
        <Monograma
          nome={clube.nome}
          cor={clube.cor}
          className="absolute bottom-1.5 left-1.5 size-8 text-[0.6875rem] shadow-lg md:bottom-3 md:left-3 md:size-12 md:text-sm"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1.5 pr-1 md:p-5 md:pt-5">
        <p className="truncate text-xs text-white/80 md:whitespace-normal md:text-[0.8125rem]">
          <span className="text-mb-red-light">{nomeTipo(clube.tipo)}</span> · {localClube(clube)}
          {clube.fundacao ? <span className="hidden sm:inline">{` · desde ${clube.fundacao}`}</span> : ""}
        </p>
        <h3 className="mt-1 text-base font-semibold leading-snug tracking-tight md:mt-2 md:text-xl">{clube.nome}</h3>
        {linha && (
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-white/75 md:mt-2 md:line-clamp-3 md:text-sm md:leading-relaxed md:text-white/70">
            {linha}
          </p>
        )}
        {clube.actividades.length > 0 && (
          <ul className="mt-4 hidden flex-wrap gap-1.5 md:flex">
            {clube.actividades.slice(0, 3).map((a) => (
              <li key={a} className="rounded-[4px] bg-white/7 px-2 py-1 text-xs text-white/75">
                {a}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto hidden justify-end pt-6 md:flex">
          <Seta className="size-3.5" />
        </div>
      </div>
      <Seta className="mr-2 mt-2.5 size-3 self-start md:hidden" />
    </Link>
  );
}
