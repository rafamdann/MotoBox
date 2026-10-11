import Link from "next/link";
import type { Clube, Evento, Noticia } from "@/lib/types";
import { dataArtigo, diaMes, intervaloDatas, localClube, tipoEvento } from "@/lib/motobox";
import { Foto, FotoFundo, Monograma, Seta } from "./kit";
import { fotoDe } from "@/app/eventos/foto";

/* ============================================================
   MOTOBOX — Cartões
   Artigo, clube e evento, sempre com a mesma gramática: painel
   escuro, fotografia com os cantos do painel, texto por baixo e
   a seta que salta ao passar o rato.
   ============================================================ */

/** Artigo numa linha: miniatura à esquerda, categoria, data e título. */
function LinhaArtigo({ artigo, className = "" }: { artigo: Noticia; className?: string }) {
  return (
    <Link href={`/artigos/${artigo.slug}`} className={`group flex items-stretch gap-3 ${className}`}>
      <Foto
        nome={fotoDe(artigo.slug, artigo.imagem)}
        className="w-[5.5rem] shrink-0 self-stretch min-h-[5rem]"
        largura={300}
        tamanhos="120px"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <p className="truncate text-xs text-white/80">
          <span className="text-mb-red-light">{artigo.categoria}</span> · {dataArtigo(artigo.data)}
        </p>
        <h3 className="mt-1 line-clamp-3 text-[0.9375rem] font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-white/85">
          {artigo.titulo}
        </h3>
      </div>
      <Seta className="mr-1 mt-1.5 size-3 self-start" />
    </Link>
  );
}

/**
 * Cartão de artigo. `grande`: o artigo de abertura, sobre a fotografia.
 * `linha`: sempre numa linha compacta (listas laterais). `linhaTelemovel`:
 * linha compacta no telemóvel e cartão normal a partir do tablet.
 */
export function CartaoArtigo({
  artigo,
  grande = false,
  variante,
}: {
  artigo: Noticia;
  grande?: boolean;
  variante?: "linha" | "linhaTelemovel";
}) {
  if (variante === "linha") return <LinhaArtigo artigo={artigo} />;
  if (variante === "linhaTelemovel") {
    return (
      <>
        <LinhaArtigo artigo={artigo} className="painel painel-escuro p-[var(--intervalo)] md:hidden" />
        <div className="hidden md:contents">
          <CartaoArtigo artigo={artigo} />
        </div>
      </>
    );
  }
  if (grande) {
    return (
      <Link
        href={`/artigos/${artigo.slug}`}
        className="painel group relative flex min-h-[26rem] flex-col justify-end p-6 md:p-10 lg:min-h-[32rem]"
      >
        <FotoFundo nome={fotoDe(artigo.slug, artigo.imagem)} veu="esquerda" tamanhos="(max-width: 1024px) 100vw, 75vw" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
        <p className="text-sm text-white/80">
          {artigo.categoria} · {dataArtigo(artigo.data)}
        </p>
        <h2 className="titulo-2 mt-3 max-w-[20ch] text-balance">{artigo.titulo}</h2>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-white/85">{artigo.resumo}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm">
          <span className="sublinhado">Ler artigo</span>
          <Seta className="size-3.5" />
        </span>
      </Link>
    );
  }

  return (
    <Link href={`/artigos/${artigo.slug}`} className="painel painel-escuro group flex flex-col p-[var(--intervalo)]">
      <Foto nome={fotoDe(artigo.slug, artigo.imagem)} className="aspect-[16/10]" largura={800} tamanhos="(max-width: 768px) 100vw, 33vw" />
      <div className="flex flex-1 flex-col p-4 pt-5 md:p-5">
        <p className="text-[0.8125rem] text-white/80">
          <span className="text-mb-red-light">{artigo.categoria}</span> · {dataArtigo(artigo.data)}
        </p>
        <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-balance">{artigo.titulo}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">{artigo.resumo}</p>
        <div className="mt-auto flex items-center justify-between pt-6 text-[0.8125rem] text-white/75">
          <span>{artigo.leitura} min de leitura</span>
          <Seta className="size-3.5 text-white" />
        </div>
      </div>
    </Link>
  );
}

export function CartaoClube({ clube }: { clube: Clube }) {
  const tipo = clube.tipo === "Outro" ? "Convívio e solidariedade" : clube.tipo;
  return (
    <Link href={`/clubes/${clube.slug}`} className="painel painel-escuro group flex flex-col p-[var(--intervalo)]">
      <div className="relative">
        <Foto nome={[clube.imagem, clube.slug]} className="aspect-[16/9]" largura={800} tamanhos="(max-width: 768px) 100vw, 33vw" />
        <Monograma nome={clube.nome} cor={clube.cor} className="absolute bottom-3 left-3 size-12 text-sm shadow-lg" />
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5 md:p-5">
        <p className="text-[0.8125rem] text-white/80">
          <span className="text-mb-red-light">{tipo}</span> · {localClube(clube)}
          {clube.fundacao ? ` · desde ${clube.fundacao}` : ""}
        </p>
        <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight">{clube.nome}</h3>
        {clube.actividades.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {clube.actividades.slice(0, 3).map((a) => (
              <li key={a} className="rounded-[4px] bg-white/7 px-2 py-1 text-xs text-white/75">
                {a}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex justify-end pt-6">
          <Seta className="size-3.5" />
        </div>
      </div>
    </Link>
  );
}

export function CartaoEvento({ evento }: { evento: Evento }) {
  const { dia, mes } = diaMes(evento.dataInicio);
  return (
    <Link href={`/eventos/${evento.slug}`} className="painel painel-escuro group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-[var(--intervalo)] p-[var(--intervalo)] md:grid-cols-[5.5rem_minmax(0,1fr)_14rem]">
      <div className="flex flex-col items-center justify-center rounded-[var(--raio)] bg-mb-red py-4 text-white">
        <span className="text-3xl font-semibold leading-none">{dia}</span>
        <span className="mt-1 text-sm uppercase tracking-[0.15em]">{mes}</span>
      </div>
      <div className="flex flex-col justify-center px-3 py-3 md:px-5">
        <p className="text-[0.8125rem] text-white/80">
          <span className="text-mb-red-light">{tipoEvento(evento)}</span> · {evento.localidade}, {evento.provincia}
        </p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug md:text-xl">{evento.titulo}</h3>
        <p className="mt-1 text-sm text-white/80">{intervaloDatas(evento.dataInicio, evento.dataFim)}</p>
      </div>
      <Foto nome={fotoDe(evento.slug, evento.imagem)} className="hidden md:block" largura={600} tamanhos="14rem" />
    </Link>
  );
}
