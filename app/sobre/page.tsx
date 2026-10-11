import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import {
  BookOpen, Camera, Compass, Flag, HeartHandshake, Info, Library, MapPin, Route, ShieldCheck, Star, Users, Wrench,
} from "lucide-react";
import { lerClubes, lerEventos, lerNoticias } from "@/lib/supabase/publico";
import { lerDoc, lerGrupo } from "@/lib/conteudo";
import { SOBRE_PADRAO, type ConteudoSobre } from "@/lib/conteudo/grupos/paginas";
import { fundir } from "@/lib/conteudo/grupos/site";
import { lerRedes } from "@/lib/redes";
import { PaginaInterior } from "@/components/painel/PaginaInterior";
import {
  Abertura, BotaoMB, Cabecalho, CartaoIcone, CartaoNumerado, Chamada, FraseFinal, Numeros, Seccao, Triptico,
} from "@/components/painel/blocos";
import { Chip, Foto, Monograma } from "@/components/painel/kit";
import { Icon } from "@/components/ui";

// O Next exige um literal aqui, não aceita constante importada.
export const revalidate = 60;

/* O texto vive no conteúdo editável ("paginas.sobre", editado em
   Gestão › Páginas); o de partida está em lib/conteudo/grupos/paginas.ts. */
async function lerSobre(): Promise<ConteudoSobre> {
  return fundir(SOBRE_PADRAO, await lerDoc<ConteudoSobre>("paginas.sobre"));
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await lerSobre();
  return { title: seo.titulo, description: seo.descricao };
}

/** Os ícones que se podem escolher para os cartões "Porque existimos". */
const ICONES: Record<string, ReactNode> = {
  bussola: <Compass />,
  coracao: <HeartHandshake />,
  biblioteca: <Library />,
  escudo: <ShieldCheck />,
  pessoas: <Users />,
  estrada: <Route />,
  camara: <Camera />,
  estrela: <Star />,
  bandeira: <Flag />,
  livro: <BookOpen />,
  oficina: <Wrench />,
  local: <MapPin />,
};

/** Título com mudança de linha só nos ecrãs largos (como "Feito por motards, / para motards"). */
function comQuebras(texto: string): ReactNode {
  const partes = texto.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  return partes.map((p, i) => (
    <Fragment key={i}>
      {i > 0 && <>{" "}<br className="hidden md:block" /></>}
      {p}
    </Fragment>
  ));
}

export default async function Sobre() {
  const [s, artigos, clubes, eventos, rotas, redes] = await Promise.all([
    lerSobre(), lerNoticias(), lerClubes(), lerEventos(), lerGrupo("rotas"), lerRedes(),
  ]);
  const contagens: Record<string, number> = {
    artigos: artigos.length,
    clubes: clubes.length,
    rotas: rotas.length,
    eventos: eventos.length,
  };
  const instagram = s.instagram.ligacao || redes.find((r) => r.rede === "instagram")?.url || "";
  const [foto1, foto2, foto3] = s.instagram.fotos;

  return (
    <PaginaInterior icone={<Info />}>
      <Abertura
        foto={s.abertura.foto}
        sobretitulo={s.abertura.sobretitulo}
        titulo={s.abertura.titulo}
        texto={s.abertura.texto}
      />

      {/* ---------- Feito por motards ---------- */}
      <Seccao>
        <Cabecalho icone={<HeartHandshake />} titulo={comQuebras(s.feito.titulo)} texto={s.feito.texto} />
        <Triptico className="mt-12" fotos={s.feito.fotos.map((f) => ({ nome: f.foto, alt: f.alt }))} />
      </Seccao>

      {/* ---------- A história ---------- */}
      <Seccao>
        {/* O quadrado vai por cima e o título fica à altura da primeira linha do texto. */}
        <Chip grande className="mb-8">
          <BookOpen />
        </Chip>
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <h2 className="titulo-2 max-w-2xl text-balance">{s.historia.titulo}</h2>
          <div className="prosa max-w-[62ch]">
            {s.historia.paragrafos.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Seccao>

      {/* ---------- Em números ---------- */}
      <Seccao>
        <div className="grid gap-[var(--intervalo)] lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h2 className="titulo-2">{s.numeros.titulo}</h2>
            <p className="texto-lead mt-5 max-w-[46ch] text-white/85">{s.numeros.texto}</p>
            <Numeros
              className="mt-10"
              itens={s.numeros.itens.map((n) => ({
                valor: n.auto && n.auto in contagens ? contagens[n.auto] : n.valor,
                texto: n.texto,
              }))}
            />
          </div>
          <Foto nome={s.numeros.foto} alt={s.numeros.fotoAlt} className="min-h-96 lg:min-h-full" largura={1200} />
        </div>
      </Seccao>

      {/* ---------- O que fazemos ---------- */}
      <Seccao>
        <h2 className="titulo-2">{s.encontra.titulo}</h2>
        {/* No telemóvel e no tablet, cartões compactos: a lista não ocupa ecrãs inteiros. */}
        <div className="mt-6 grid gap-[var(--intervalo)] lg:mt-10">
          {s.encontra.cartoes.map((c, i) => (
            <CartaoNumerado
              key={i}
              numero={i + 1}
              sobretitulo={c.sobretitulo}
              titulo={c.titulo}
              foto={c.foto}
              href={c.ligacao || undefined}
              inverter={i % 2 === 1}
              compacto
            >
              {c.texto}
            </CartaoNumerado>
          ))}
        </div>
      </Seccao>

      {/* ---------- Missão ---------- */}
      <Seccao>
        <Cabecalho titulo={s.missao.titulo} />
        <div className="mt-10 grid gap-[var(--intervalo)] md:grid-cols-2 xl:grid-cols-4">
          {s.missao.cartoes.map((c, i) => (
            <CartaoIcone key={i} icone={ICONES[c.icone] ?? <Compass />} titulo={c.titulo}>
              {c.texto}
            </CartaoIcone>
          ))}
        </div>
      </Seccao>

      {/* ---------- Equipa ---------- */}
      <Seccao>
        <Cabecalho titulo={s.equipa.titulo} texto={s.equipa.texto} />
        <div className="mt-10 grid gap-[var(--intervalo)] md:grid-cols-3">
          {s.equipa.pessoas.map((p, i) => (
            <div key={i} className="painel painel-escuro flex flex-col p-6 md:min-h-72">
              {p.camara ? (
                <span className="grid size-14 place-items-center rounded-[4px] bg-mb-red" aria-hidden>
                  <Camera className="size-6" />
                </span>
              ) : (
                <Monograma nome={p.nome} className="size-14 text-lg" />
              )}
              <p className="mt-auto pt-6 text-sm text-mb-red-light md:pt-10">{p.papel}</p>
              <h3 className="mt-1 text-xl font-semibold">{p.nome}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{p.texto}</p>
            </div>
          ))}
        </div>
      </Seccao>

      {/* ---------- Instagram ---------- */}
      <Seccao>
        <div className="grid gap-[var(--intervalo)] md:grid-cols-[1fr_1fr_2fr]">
          {instagram && (
            <Chamada href={instagram} externo icone={<Icon name="instagram" />} titulo={s.instagram.titulo} />
          )}
          {foto1 && <Foto nome={foto1} className="min-h-72" largura={700} />}
          {foto2 && <Foto nome={foto2} className="row-span-2 min-h-72" largura={1100} />}
          {foto3 && <Foto nome={foto3} className="min-h-64 md:col-span-2" largura={1100} />}
        </div>
      </Seccao>

      <FraseFinal foto={s.final.foto} frase={s.final.frase}>
        {s.final.botoes.length > 0 && (
          <div className="flex flex-wrap gap-[var(--intervalo)]">
            {s.final.botoes.map((b, i) => (
              <BotaoMB
                key={i}
                href={b.ligacao || "/"}
                externo={/^https?:\/\//.test(b.ligacao)}
                variante={i === 0 ? "vermelho" : "escuro"}
              >
                {b.texto}
              </BotaoMB>
            ))}
          </div>
        )}
      </FraseFinal>
    </PaginaInterior>
  );
}
