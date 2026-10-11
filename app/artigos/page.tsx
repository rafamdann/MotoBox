import type { Metadata } from "next";
import { ArrowDown, Newspaper } from "lucide-react";
import { lerNoticias } from "@/lib/supabase/publico";
import { CATEGORIAS_ARTIGO } from "@/lib/types";
import { lerDoc } from "@/lib/conteudo";
import type { ConteudoPaginaArtigos } from "@/lib/conteudo/grupos/eventos";
import { PaginaInterior } from "@/components/painel/PaginaInterior";
import { Pilulas, Seccao } from "@/components/painel/blocos";
import { CartaoArtigo } from "@/components/painel/cartoes";
import { NewsletterPainel } from "@/components/painel/Newsletter";

// Os textos fixos desta página editam-se no painel: Artigos → Página Artigos.
export async function generateMetadata(): Promise<Metadata> {
  const t = await lerDoc<ConteudoPaginaArtigos>("paginas.artigos");
  return { title: "Artigos", description: t.descricaoPesquisa };
}

export default async function Artigos({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [artigos, t] = await Promise.all([lerNoticias(), lerDoc<ConteudoPaginaArtigos>("paginas.artigos")]);

  // Só aparecem as categorias que têm artigos, pela ordem oficial.
  const presentes = CATEGORIAS_ARTIGO.filter((c) => artigos.some((a) => a.categoria === c));
  const activa = presentes.find((c) => c === categoria) ?? "todas";
  const lista = activa === "todas" ? artigos : artigos.filter((a) => a.categoria === activa);
  const [primeiro, ...resto] = lista;
  // Os quatro seguintes vão para a caixa "Mais recentes"; os outros, para a lista por baixo.
  const recentes = resto.slice(0, 4);
  const mais = resto.slice(4);

  return (
    <PaginaInterior icone={<Newspaper />}>
      <header className="coluna pb-10 pt-28 lg:pt-32">
        <p className="sobretitulo surgir text-white/80">{t.sobretitulo}</p>
        <h1 className="titulo-1 surgir mt-4 max-w-[14ch] text-balance" style={{ ["--i" as string]: 1 }}>
          {t.titulo}
        </h1>
        <p className="texto-lead surgir mt-6 max-w-[52ch] text-white/85" style={{ ["--i" as string]: 2 }}>
          {t.texto}
        </p>
        <div className="surgir mt-10" style={{ ["--i" as string]: 3 }}>
          <Pilulas
            rotulo="Categorias de artigos"
            activa={activa}
            itens={[
              { chave: "todas", texto: t.todos, href: "/artigos" },
              ...presentes.map((c) => ({ chave: c, texto: c, href: `/artigos?categoria=${encodeURIComponent(c)}` })),
            ]}
          />
        </div>
      </header>

      <Seccao className="!pt-0">
        {primeiro ? (
          <div className={`grid gap-[var(--intervalo)] ${recentes.length ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : ""}`}>
            <CartaoArtigo artigo={primeiro} grande />
            {/* Os seguintes logo à vista: ao lado do artigo de abertura no computador, por baixo no telemóvel. */}
            {recentes.length > 0 && (
              <aside aria-labelledby="artigos-recentes" className="painel painel-escuro flex flex-col p-4 md:p-5">
                <h2 id="artigos-recentes" className="text-xs uppercase tracking-[0.2em] text-white/75">
                  {t.recentes}
                </h2>
                <ul className="mt-3 flex-1 divide-y divide-white/10">
                  {recentes.map((a) => (
                    <li key={a.slug} className="py-[var(--intervalo)] first:pt-0 last:pb-0">
                      <CartaoArtigo artigo={a} variante="linha" />
                    </li>
                  ))}
                </ul>
                {mais.length > 0 && (
                  <a
                    href="#lista"
                    className="group mt-4 inline-flex h-12 items-center justify-between gap-4 rounded-[var(--raio)] bg-white/10 px-4 text-[15px] text-white transition-colors hover:bg-white/20"
                  >
                    <span>
                      {t.verMais} <span className="text-white/75">({mais.length})</span>
                    </span>
                    <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
                  </a>
                )}
              </aside>
            )}
          </div>
        ) : (
          <p className="painel painel-escuro p-10 text-white/70">{t.vazio}</p>
        )}
      </Seccao>

      {mais.length > 0 && (
        <Seccao id="lista" className="!pt-0">
          <h2 className="titulo-3">{t.maisArtigos}</h2>
          {/* No telemóvel, linhas compactas; a partir do tablet, os cartões com fotografia. */}
          <div className="mt-6 grid gap-[var(--intervalo)] md:mt-8 md:grid-cols-2 xl:grid-cols-3">
            {mais.map((a) => (
              <CartaoArtigo key={a.slug} artigo={a} variante="linhaTelemovel" />
            ))}
          </div>
        </Seccao>
      )}

      {t.newsletter && (
        <Seccao className="!pt-0">
          <NewsletterPainel />
        </Seccao>
      )}
    </PaginaInterior>
  );
}
