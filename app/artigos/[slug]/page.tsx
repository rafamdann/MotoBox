import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Newspaper, UserRound } from "lucide-react";
import { lerNoticia, lerNoticias } from "@/lib/supabase/publico";
import { dataArtigo } from "@/lib/motobox";
import { lerDoc } from "@/lib/conteudo";
import type { ConteudoPaginaArtigos } from "@/lib/conteudo/grupos/eventos";
import { fotoDe } from "@/app/eventos/foto";
import { PaginaInterior } from "@/components/painel/PaginaInterior";
import { Abertura, Seccao } from "@/components/painel/blocos";
import { CartaoArtigo } from "@/components/painel/cartoes";
import { NewsletterPainel } from "@/components/painel/Newsletter";
import { Seta } from "@/components/painel/kit";
import { Partilhar } from "./Partilhar";
import { GuardarNaConta } from "./GuardarNaConta";
import { CorpoArtigo } from "./CorpoArtigo";

// O Next exige um literal aqui, não aceita constante importada.
export const revalidate = 60;

// Artigos criados depois do build são gerados no primeiro pedido.
export async function generateStaticParams() {
  const artigos = await lerNoticias();
  return artigos.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await lerNoticia(slug);
  if (!a) return { title: "Artigo não encontrado" };
  return {
    title: a.titulo,
    description: a.resumo,
    openGraph: { title: a.titulo, description: a.resumo, type: "article", publishedTime: a.data },
  };
}

export default async function Artigo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artigo = await lerNoticia(slug);
  if (!artigo) notFound();
  // Os textos fixos (etiquetas, fonte, relacionados) editam-se no painel: Artigos → Página Artigos.
  const t = await lerDoc<ConteudoPaginaArtigos>("paginas.artigos");

  // Relacionados: mesma categoria e etiquetas em comum primeiro.
  const relacionados = (await lerNoticias())
    .filter((a) => a.slug !== artigo.slug)
    .map((a) => ({
      a,
      pontos: a.tags.filter((t) => artigo.tags.includes(t)).length + (a.categoria === artigo.categoria ? 2 : 0),
    }))
    .sort((x, y) => y.pontos - x.pontos)
    .slice(0, 3)
    .map((x) => x.a);

  return (
    <PaginaInterior icone={<Newspaper />}>
      <Abertura
        foto={fotoDe(artigo.slug, artigo.imagem)}
        sobretitulo={
          // Caminho de volta (dentro do <p> do sobretítulo, por isso um <span>): "Artigos › Categoria". Quem chega pelo destaque do painel vê logo onde estão os outros.
          <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Link href="/artigos" className="group inline-flex items-center gap-1.5 text-white">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
              <span className="sublinhado">{t.artigoCaminho}</span>
            </Link>
            <span aria-hidden className="text-white/70">/</span>
            <Link href={`/artigos?categoria=${encodeURIComponent(artigo.categoria)}`} className="hover:text-white">
              {artigo.categoria}
            </Link>
          </span>
        }
        titulo={artigo.titulo}
        tamanho="2"
        texto={artigo.resumo}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4" aria-hidden /> {artigo.autor}
          </span>
          <time dateTime={artigo.data}>{dataArtigo(artigo.data)}</time>
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4" aria-hidden /> {artigo.leitura}{` ${t.artigoLeitura}`}
          </span>
        </div>
      </Abertura>

      <Seccao>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] xl:gap-20">
          <div className="prosa max-w-[68ch]">
            <CorpoArtigo corpo={artigo.corpo} />

            {artigo.fonte && (
              <p className="!mt-10 border-l-2 border-mb-red pl-4 !text-sm !text-white/80">
                {t.artigoFonte}{" "}
                {artigo.fonteUrl ? (
                  <a href={artigo.fonteUrl} target="_blank" rel="noopener noreferrer" className="sublinhado text-white/80">
                    {artigo.fonte}
                  </a>
                ) : (
                  artigo.fonte
                )}
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-8 lg:sticky lg:top-8 lg:self-start">
            {artigo.tags.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">{t.artigoEtiquetas}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {artigo.tags.map((t) => (
                    <li key={t} className="rounded-[4px] bg-white/7 px-2.5 py-1 text-xs text-white/80">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Partilhar titulo={artigo.titulo} rotulo={t.artigoPartilhar} botao={t.artigoPartilharBotao} copiadoTexto={t.artigoCopiado} />
            <GuardarNaConta slug={artigo.slug} rotulo={t.artigoGuardar} botao={t.artigoGuardarBotao} guardadoTexto={t.artigoGuardado} />
            <Link
              href="/artigos"
              className="group inline-flex h-12 w-full max-w-[20.5rem] items-center justify-between gap-4 rounded-[var(--raio)] bg-white/10 px-4 text-[15px] text-white transition-colors hover:bg-white/20"
            >
              <span>{t.artigoTodos}</span>
              <Seta className="size-3.5" />
            </Link>
          </aside>
        </div>
      </Seccao>

      {relacionados.length > 0 && (
        <Seccao className="!pt-0">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 className="titulo-3">{t.artigoContinuar}</h2>
            <Link href="/artigos" className="group inline-flex items-center gap-2 text-[15px] text-white">
              <span className="sublinhado">{t.artigoTodos}</span>
              <Seta className="size-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid gap-[var(--intervalo)] md:grid-cols-2 xl:grid-cols-3">
            {relacionados.map((a) => (
              <CartaoArtigo key={a.slug} artigo={a} variante="linhaTelemovel" />
            ))}
          </div>
        </Seccao>
      )}

      {t.artigoNewsletter && (
        <Seccao className="!pt-0">
          <NewsletterPainel />
        </Seccao>
      )}
    </PaginaInterior>
  );
}
