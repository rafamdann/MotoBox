"use client";

/* ============================================================
   MOTOBOX ADMIN — Artigos
   Lista dos artigos (procura, categoria, estado) e o editor de
   cada um: título, resumo, o texto em blocos com a página ao
   lado tal como sai no site, fotografia, categoria, etiquetas,
   autor, data, tempo de leitura, destaque, publicação e fonte.
   A aba "Página Artigos" edita os textos fixos de /artigos e
   da página de cada artigo (documento "paginas.artigos").
   ============================================================ */

import { useMemo, useState } from "react";
import { Clock, ExternalLink, Newspaper, Plus, Star, UserRound } from "lucide-react";
import { useAdmin, slugify } from "@/lib/admin/store";
import { CATEGORIAS_ARTIGO, type Noticia } from "@/lib/types";
import { src as fotoSrc } from "@/lib/imagens";
import {
  Abas, Area, Botao, BotaoLigacao, CabecalhoPagina, Campo, CampoEndereco, Confirmar, Estatistica, Etiqueta,
  Input, Interruptor, ListaTexto, Painel, Procura, Seleccao, Vazio, useAviso, usePaginacao,
} from "@/components/admin/kit";
import { CampoImagem } from "@/components/admin/Media";
import { EditorDoc, useAvisoSaida } from "@/components/admin/editor/EditorDoc";
import type { CampoEsquema } from "@/components/admin/editor/esquema";
import { CorpoArtigo } from "@/app/artigos/[slug]/CorpoArtigo";
import { fotoDe } from "@/app/eventos/foto";
import { EditorCorpo, palavras } from "./EditorCorpo";
import { BarraEditor, dataLonga, hoje, iguais, useAbaNoEndereco } from "./_partilhado";

/** O artigo como o painel o vê: a coluna `publicado` não faz parte dos tipos do site. */
type Artigo = Noticia & { publicado?: boolean };
type Aba = "artigos" | "pagina";

const CATEGORIAS: string[] = [...CATEGORIAS_ARTIGO];
const publicado = (a: Artigo) => a.publicado !== false;

/** Minutos de leitura a partir do texto (cerca de 200 palavras por minuto). */
const leituraCalculada = (corpo: string[]) => Math.max(1, Math.ceil(palavras(corpo) / 200));

const artigoNovo = (): Artigo => ({
  slug: "", titulo: "", resumo: "", corpo: [], categoria: "Comunidade", tags: [],
  autor: "Redação MotoBox", data: hoje(), imagem: "", leitura: 1, destaque: false,
  fonte: "", fonteUrl: "", publicado: true,
});

/* ---------------- Textos fixos da página (paginas.artigos) ---------------- */

const ESQUEMA_PAGINA: CampoEsquema[] = [
  {
    tipo: "secao", titulo: "Abertura de /artigos",
    descricao: "O topo da página com a lista de todos os artigos.",
    campos: [
      { tipo: "texto", chave: "sobretitulo", etiqueta: "Sobretítulo", ajuda: "A linha pequena em maiúsculas, por cima do título.", largura: "meia" },
      { tipo: "texto", chave: "todos", etiqueta: "Primeira pílula das categorias", ajuda: "A que mostra os artigos de todas as categorias.", largura: "meia" },
      { tipo: "texto", chave: "titulo", etiqueta: "Título" },
      { tipo: "area", chave: "texto", etiqueta: "Texto de apresentação", linhas: 3 },
      { tipo: "texto", chave: "vazio", etiqueta: "Aviso de categoria sem artigos", ajuda: "Aparece quando se escolhe uma categoria que ainda não tem artigos." },
      { tipo: "texto", chave: "recentes", etiqueta: "Título da caixa dos mais recentes", ajuda: "Ao lado do artigo de abertura (por baixo, no telemóvel), com os quatro artigos seguintes.", largura: "meia" },
      { tipo: "texto", chave: "verMais", etiqueta: "Botão da caixa dos mais recentes", ajuda: "Desce até à lista com os outros artigos.", largura: "meia" },
      { tipo: "texto", chave: "maisArtigos", etiqueta: "Título da lista dos outros artigos", largura: "meia" },
      { tipo: "booleano", chave: "newsletter", etiqueta: "Quadro da newsletter no fim da página", descricao: "Convida quem lê a receber os artigos por email." },
    ],
  },
  {
    tipo: "secao", titulo: "Página de cada artigo",
    descricao: "Textos fixos que se repetem em todos os artigos.",
    campos: [
      { tipo: "texto", chave: "artigoCaminho", etiqueta: "Caminho no topo do artigo", ajuda: "Lê-se «Artigos › Categoria», por cima do título; leva de volta à lista de artigos.", largura: "meia" },
      { tipo: "texto", chave: "artigoLeitura", etiqueta: "Depois dos minutos de leitura", ajuda: "No topo do artigo, ex.: «5 min de leitura».", largura: "meia" },
      { tipo: "texto", chave: "artigoEtiquetas", etiqueta: "Título das etiquetas", ajuda: "Por cima das etiquetas, ao lado do texto.", largura: "meia" },
      { tipo: "texto", chave: "artigoPartilhar", etiqueta: "Título de partilhar", largura: "meia" },
      { tipo: "texto", chave: "artigoPartilharBotao", etiqueta: "Botão de partilhar", largura: "meia" },
      { tipo: "texto", chave: "artigoCopiado", etiqueta: "Aviso de ligação copiada", ajuda: "Aparece no botão quando o telemóvel não tem partilha e a ligação é copiada.", largura: "meia" },
      { tipo: "texto", chave: "artigoGuardar", etiqueta: "Título de guardar", largura: "meia" },
      { tipo: "texto", chave: "artigoGuardarBotao", etiqueta: "Botão de guardar", ajuda: "Guarda o artigo em A minha conta → Guardados. Sem sessão, leva a entrar.", largura: "meia" },
      { tipo: "texto", chave: "artigoGuardado", etiqueta: "Botão depois de guardar", largura: "meia" },
      { tipo: "texto", chave: "artigoFonte", etiqueta: "Antes do nome da fonte", ajuda: "Nos artigos com fonte, ex.: «Fonte: MXGP».", largura: "meia" },
      { tipo: "texto", chave: "artigoTodos", etiqueta: "Ligação para a lista", ajuda: "Leva de volta a todos os artigos.", largura: "meia" },
      { tipo: "texto", chave: "artigoContinuar", etiqueta: "Título dos artigos relacionados", ajuda: "Por cima dos três artigos sugeridos no fim.", largura: "meia" },
      { tipo: "booleano", chave: "artigoNewsletter", etiqueta: "Quadro da newsletter no fim de cada artigo" },
    ],
  },
  {
    tipo: "secao", titulo: "Pesquisa e partilhas",
    campos: [
      {
        tipo: "area", chave: "descricaoPesquisa", etiqueta: "Descrição da secção", linhas: 2,
        ajuda: "O texto que o Google e as redes sociais mostram por baixo do nome da página. Até cerca de 160 caracteres.",
      },
    ],
  },
];

/* ---------------- Página ---------------- */

export function GestaoArtigos({ abaInicial }: { abaInicial: Aba }) {
  const { estado } = useAdmin();
  // O aviso vive aqui, e não no editor, para sobreviver à troca de "artigo novo" para "artigo gravado".
  const { mostrar, elemento } = useAviso();
  const [aba, setAba] = useAbaNoEndereco<Aba>(abaInicial, "artigos");
  /** Artigo aberto no editor: o endereço original (null num artigo novo). */
  const [aberto, setAberto] = useState<{ original: string | null; inicial: Artigo } | null>(null);
  const artigos = estado.noticias as Artigo[];

  if (aberto) {
    return (
      <>
        <EditorArtigo
          key={aberto.original ?? "novo"}
          original={aberto.original}
          inicial={aberto.inicial}
          mostrar={mostrar}
          aoFechar={() => setAberto(null)}
          aoMudarOriginal={(slug, a) => setAberto({ original: slug, inicial: a })}
        />
        {elemento}
      </>
    );
  }

  return (
    <>
      <CabecalhoPagina
        icone={<Newspaper />}
        sobretitulo="Conteúdo"
        titulo="Artigos"
        descricao="As histórias, guias e notícias da secção Artigos. Tudo o que gravar aparece no site no momento seguinte."
        accoes={
          <>
            <BotaoLigacao href="/artigos" externo variante="fantasma">
              <ExternalLink className="size-4" aria-hidden /> Ver no site
            </BotaoLigacao>
            {aba === "artigos" && (
              <Botao variante="primario" onClick={() => setAberto({ original: null, inicial: artigoNovo() })}>
                <Plus className="size-4" aria-hidden /> Novo artigo
              </Botao>
            )}
          </>
        }
      />
      <div className="mb-5">
        <Abas
          rotulo="Secções de Artigos"
          abas={[
            { chave: "artigos", nome: "Artigos", contador: artigos.length },
            { chave: "pagina", nome: "Página Artigos" },
          ]}
          activa={aba}
          onChange={setAba}
        />
      </div>

      {aba === "artigos" ? (
        <ListaArtigos artigos={artigos} aoAbrir={(a) => setAberto({ original: a.slug, inicial: a })} />
      ) : (
        <EditorDoc chave="paginas.artigos" pagina="/artigos" titulo="Artigos (página da secção)" esquema={ESQUEMA_PAGINA} />
      )}
      {elemento}
    </>
  );
}

/* ---------------- Lista ---------------- */

type FiltroEstado = "" | "publicados" | "rascunhos" | "destaque";

function ListaArtigos({ artigos, aoAbrir }: { artigos: Artigo[]; aoAbrir: (a: Artigo) => void }) {
  const [procura, setProcura] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [filtro, setFiltro] = useState<FiltroEstado>("");
  const [ordem, setOrdem] = useState<"recentes" | "antigos" | "titulo">("recentes");

  const filtrados = useMemo(() => {
    const q = procura.trim().toLowerCase();
    const lista = artigos.filter((a) => {
      if (categoria !== "todas" && a.categoria !== categoria) return false;
      if (filtro === "publicados" && !publicado(a)) return false;
      if (filtro === "rascunhos" && publicado(a)) return false;
      if (filtro === "destaque" && !a.destaque) return false;
      if (!q) return true;
      return `${a.titulo} ${a.resumo} ${a.autor} ${a.tags.join(" ")} ${a.slug}`.toLowerCase().includes(q);
    });
    return [...lista].sort((a, b) =>
      ordem === "titulo" ? a.titulo.localeCompare(b.titulo)
        : ordem === "antigos" ? a.data.localeCompare(b.data)
          : b.data.localeCompare(a.data));
  }, [artigos, procura, categoria, filtro, ordem]);

  const { fatia, controlos } = usePaginacao(filtrados, 12);
  const contagem = (c: string) => artigos.filter((a) => a.categoria === c).length;
  const ultimo = [...artigos].filter(publicado).sort((a, b) => b.data.localeCompare(a.data))[0];

  return (
    <div className="space-y-[var(--intervalo)]">
      <div className="grid grid-cols-2 gap-[var(--intervalo)] lg:grid-cols-4">
        <Estatistica rotulo="No site" valor={artigos.filter(publicado).length} sufixo="artigos" />
        <Estatistica rotulo="Em destaque" valor={artigos.filter((a) => a.destaque).length} tom="red" />
        <Estatistica rotulo="Rascunhos" valor={artigos.filter((a) => !publicado(a)).length} variacao="Guardados, mas fora do site" />
        <Estatistica rotulo="Último publicado" valor={ultimo ? dataLonga(ultimo.data).replace(/ de \d{4}$/, "") : "—"} variacao={ultimo?.titulo} />
      </div>

      <Painel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Procura valor={procura} onChange={setProcura} placeholder="Procurar por título, autor ou etiqueta…" />
          <Seleccao
            aria-label="Estado"
            className="sm:!w-auto sm:min-w-[11rem]"
            valor={filtro}
            onChange={(v) => setFiltro(v as FiltroEstado)}
            opcoes={[
              { valor: "", nome: "Todos os estados" },
              { valor: "publicados", nome: "Publicados" },
              { valor: "rascunhos", nome: "Rascunhos" },
              { valor: "destaque", nome: "Em destaque" },
            ]}
          />
          <Seleccao
            aria-label="Ordem"
            className="sm:!w-auto sm:min-w-[10rem]"
            valor={ordem}
            onChange={(v) => setOrdem(v as typeof ordem)}
            opcoes={[
              { valor: "recentes", nome: "Mais recentes" },
              { valor: "antigos", nome: "Mais antigos" },
              { valor: "titulo", nome: "Por título" },
            ]}
          />
        </div>
        <div className="mb-5">
          <Abas
            rotulo="Categoria"
            activa={categoria}
            onChange={setCategoria}
            abas={[
              { chave: "todas", nome: "Todas", contador: artigos.length },
              ...CATEGORIAS.map((c) => ({ chave: c, nome: c, contador: contagem(c) })),
            ]}
          />
        </div>

        {fatia.length === 0 ? (
          <Vazio titulo={artigos.length ? "Nenhum artigo corresponde aos filtros" : "Ainda não há artigos"}>
            {artigos.length ? "Mude a procura, a categoria ou o estado." : "Carregue em «Novo artigo» para escrever o primeiro."}
          </Vazio>
        ) : (
          <ul className="-mx-2 divide-y divide-white/[0.06]">
            {fatia.map((a) => (
              <li key={a.slug}>
                <LinhaArtigo artigo={a} aoAbrir={() => aoAbrir(a)} />
              </li>
            ))}
          </ul>
        )}
        {controlos}
      </Painel>
    </div>
  );
}

function LinhaArtigo({ artigo: a, aoAbrir }: { artigo: Artigo; aoAbrir: () => void }) {
  const foto = fotoSrc(fotoDe(a.slug, a.imagem), { w: 320 });
  return (
    <button
      type="button" onClick={aoAbrir}
      className="grid w-full grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 rounded-[var(--raio)] p-2 text-left transition-colors hover:bg-white/[0.05] sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-4"
    >
      <span className="relative block aspect-[16/10] overflow-hidden rounded-[var(--raio)] bg-black/30">
        {foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-white/75">
          <span className="text-mb-red-light">{a.categoria}</span> · {dataLonga(a.data)} · {a.leitura} min
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[15px] font-semibold leading-snug text-white">{a.titulo || "Sem título"}</span>
        <span className="mt-0.5 line-clamp-1 hidden text-[13px] text-white/75 sm:block">{a.resumo}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">
          <EstadoArtigo artigo={a} />
        </span>
      </span>
      <span className="hidden flex-col items-end gap-1.5 sm:flex">
        <EstadoArtigo artigo={a} />
      </span>
    </button>
  );
}

function EstadoArtigo({ artigo }: { artigo: Artigo }) {
  return (
    <>
      {publicado(artigo) ? <Etiqueta tom="ok">No site</Etiqueta> : <Etiqueta>Rascunho</Etiqueta>}
      {artigo.destaque && <Etiqueta tom="vermelho"><Star className="size-3" aria-hidden /> Destaque</Etiqueta>}
    </>
  );
}

/* ---------------- Editor ---------------- */

function EditorArtigo({
  original, inicial, mostrar, aoFechar, aoMudarOriginal,
}: {
  original: string | null;
  inicial: Artigo;
  mostrar: (texto: string, tom?: "ok" | "erro") => void;
  aoFechar: () => void;
  /** Depois de gravar um artigo novo (ou de lhe mudar o endereço), o editor passa a apontar para ele. */
  aoMudarOriginal: (slug: string, a: Artigo) => void;
}) {
  const { estado, criar, atualizar, remover } = useAdmin();
  const novo = original === null;
  const [base, setBase] = useState<Artigo>(() => normalizar(inicial));
  const [r, setR] = useState<Artigo>(() => normalizar(inicial));
  const [autoLeitura, setAutoLeitura] = useState(() => novo || inicial.leitura === leituraCalculada(inicial.corpo ?? []));
  const [vista, setVista] = useState<"editar" | "previa">("editar");
  const [aGravar, setAGravar] = useState(false);
  const [aApagar, setAApagar] = useState(false);

  const sujo = novo || !iguais(r, base);
  // Um artigo novo ainda em branco pode fechar-se sem perguntar.
  const comTrabalho = sujo && (!novo || Boolean(r.titulo.trim() || r.corpo.length));
  useAvisoSaida(comTrabalho);

  const definir = (campos: Partial<Artigo>) =>
    setR((a) => {
      const prox = { ...a, ...campos };
      if (autoLeitura && campos.corpo) prox.leitura = leituraCalculada(prox.corpo);
      return prox;
    });

  const mudarTitulo = (titulo: string) =>
    definir({ titulo, slug: novo && (r.slug === "" || r.slug === slugify(r.titulo)) ? slugify(titulo) : r.slug });

  const voltar = () => {
    if (comTrabalho && !window.confirm("Há alterações por gravar neste artigo. Sair sem gravar?")) return;
    aoFechar();
  };

  const gravar = async () => {
    const final: Artigo = {
      ...r,
      titulo: r.titulo.trim(),
      slug: (r.slug || slugify(r.titulo)).replace(/-+$/, ""),
      resumo: r.resumo.trim(),
      corpo: r.corpo.map((l) => l.trim()).filter(Boolean),
      tags: r.tags.map((t) => t.trim()).filter(Boolean),
      leitura: Math.max(1, Math.round(Number(r.leitura) || 1)),
      fonte: r.fonte?.trim() ?? "",
      fonteUrl: r.fonteUrl?.trim() ?? "",
    };
    if (!final.titulo) return mostrar("Escreva o título do artigo.", "erro");
    if (!final.slug) return mostrar("Falta o endereço da página.", "erro");
    if (!final.data) return mostrar("Escolha a data do artigo.", "erro");
    if (final.slug !== original && estado.noticias.some((a) => a.slug === final.slug)) {
      return mostrar(`Já existe um artigo com o endereço /artigos/${final.slug}. Mude o endereço.`, "erro");
    }
    setAGravar(true);
    const registo = final as unknown as Record<string, unknown>;
    const falha = original === null ? await criar("noticias", registo) : await atualizar("noticias", original, registo);
    setAGravar(false);
    if (falha) return mostrar(falha, "erro");
    mostrar(novo ? "Artigo criado." : "Gravado. O site já mostra as alterações.");
    if (novo || final.slug !== original) aoMudarOriginal(final.slug, final);
    else { setBase(final); setR(final); }
  };

  const apagar = async () => {
    if (!original) return;
    const falha = await remover("noticias", original);
    if (falha) return mostrar(falha, "erro");
    aoFechar();
  };

  const fotoPropria = !/^(https:\/\/|\/)/.test(r.imagem) && r.slug && fotoSrc(r.slug) && fotoSrc(r.slug) !== fotoSrc(r.imagem);
  const calculada = leituraCalculada(r.corpo);

  return (
    <div className="space-y-[var(--intervalo)]">
      <BarraEditor
        aoVoltar={voltar}
        voltar="Artigos"
        titulo={r.titulo || (novo ? "Novo artigo" : "Sem título")}
        etiquetas={
          <>
            {novo ? <Etiqueta tom="ouro">Por gravar</Etiqueta> : <EstadoArtigo artigo={base} />}
            {!novo && sujo && <Etiqueta tom="ouro">Alterações por gravar</Etiqueta>}
          </>
        }
        accoes={
          <>
            {!novo && publicado(base) && (
              <BotaoLigacao href={`/artigos/${original}`} externo variante="fantasma">Ver no site</BotaoLigacao>
            )}
            {!novo && <Botao variante="fantasma" onClick={() => setAApagar(true)}>Apagar</Botao>}
            {!novo && <Botao variante="fantasma" disabled={!sujo} onClick={() => setR(base)}>Desfazer</Botao>}
            <Botao variante="primario" disabled={!sujo || aGravar} onClick={gravar}>
              {aGravar ? "A gravar…" : novo ? "Criar artigo" : "Gravar"}
            </Botao>
          </>
        }
      />

      <div className="xl:hidden">
        <Abas
          rotulo="Vista"
          activa={vista}
          onChange={setVista}
          abas={[{ chave: "editar", nome: "Escrever" }, { chave: "previa", nome: "Ver como fica" }]}
        />
      </div>

      <div className="grid items-start gap-[var(--intervalo)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------- Formulário ---------- */}
        <div className={`space-y-[var(--intervalo)] ${vista === "previa" ? "hidden xl:block" : ""}`}>
          <Painel titulo="Título e resumo" descricao="O que aparece no topo do artigo e nos cartões das listas.">
            <div className="space-y-4">
              <Campo etiqueta="Título" obrigatorio>
                <Input value={r.titulo} onChange={(e) => mudarTitulo(e.target.value)} className="text-lg font-semibold" placeholder="Ex.: A Serra da Leba de mota" />
              </Campo>
              <CampoEndereco prefixo="/artigos" novo={novo} valor={r.slug} onChange={(slug) => definir({ slug })} />
              <Campo etiqueta="Resumo" ajuda="Uma ou duas frases. Aparece por baixo do título, nos cartões e quando alguém partilha o artigo.">
                <Area rows={3} value={r.resumo} onChange={(e) => definir({ resumo: e.target.value })} />
              </Campo>
            </div>
          </Painel>

          <Painel
            titulo="Texto do artigo"
            descricao="Um bloco por parágrafo. Use «Subtítulo» para dividir o texto em secções e «Citação» para destacar uma frase dita por alguém. O primeiro parágrafo leva a letra grande vermelha."
          >
            <EditorCorpo valor={r.corpo} onChange={(corpo) => definir({ corpo })} />
          </Painel>

          <Painel titulo="Fotografia">
            <CampoImagem
              etiqueta="Fotografia de abertura"
              valor={r.imagem}
              onChange={(imagem) => definir({ imagem })}
              ajuda={
                fotoPropria
                  ? "Este endereço já tem uma fotografia própria do site, que aparece no topo do artigo. Para a trocar, carregue outra ou cole o endereço de uma imagem."
                  : "Aparece em fundo no topo do artigo e nos cartões das listas. Escolha uma fotografia larga, em pé não fica bem."
              }
            />
          </Painel>

          <Painel titulo="Publicação">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Categoria" ajuda="Decide em que pílula o artigo aparece em /artigos.">
                  <Seleccao valor={r.categoria} opcoes={CATEGORIAS.map((c) => ({ valor: c, nome: c }))} onChange={(v) => definir({ categoria: v as Artigo["categoria"] })} />
                </Campo>
                <Campo etiqueta="Data" obrigatorio ajuda="Os artigos aparecem do mais recente para o mais antigo.">
                  <Input type="date" value={r.data.slice(0, 10)} onChange={(e) => definir({ data: e.target.value })} />
                </Campo>
                <Campo etiqueta="Autor" ajuda="Quem assina o artigo.">
                  <Input value={r.autor} onChange={(e) => definir({ autor: e.target.value })} />
                </Campo>
                <Campo
                  etiqueta="Tempo de leitura (minutos)"
                  ajuda={autoLeitura ? `Calculado a partir do texto (${palavras(r.corpo)} palavras).` : `Pelo texto seriam ${calculada} min.`}
                >
                  <span className="flex gap-2">
                    <Input
                      type="number" min={1} max={120} inputMode="numeric" disabled={autoLeitura}
                      value={autoLeitura ? calculada : r.leitura}
                      onChange={(e) => definir({ leitura: Number(e.target.value) })}
                    />
                    <Botao
                      onClick={() => {
                        const auto = !autoLeitura;
                        setAutoLeitura(auto);
                        if (auto) definir({ leitura: calculada });
                      }}
                    >
                      {autoLeitura ? "Escrever à mão" : "Calcular"}
                    </Botao>
                  </span>
                </Campo>
              </div>
              <ListaTexto
                etiqueta="Etiquetas"
                ajuda="Palavras-chave que aparecem ao lado do texto e ajudam a sugerir artigos relacionados."
                valores={r.tags}
                placeholder="Ex.: Lady Riders"
                onChange={(tags) => definir({ tags })}
              />
              <Interruptor
                etiqueta="Publicado no site"
                descricao="Desligado, o artigo fica guardado como rascunho e não aparece a ninguém."
                activo={publicado(r)}
                onChange={(v) => definir({ publicado: v })}
              />
              <Interruptor
                etiqueta="Em destaque"
                descricao="O artigo em destaque mais recente abre o painel Explorar e a secção de artigos."
                activo={Boolean(r.destaque)}
                onChange={(v) => definir({ destaque: v })}
              />
            </div>
          </Painel>

          <Painel titulo="Fonte" descricao="Só para artigos que vêm de outro site ou de uma reportagem. Aparece no fim do texto.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nome da fonte" ajuda="Ex.: MXGP, Jornal de Angola.">
                <Input value={r.fonte ?? ""} onChange={(e) => definir({ fonte: e.target.value })} />
              </Campo>
              <Campo etiqueta="Endereço da fonte" ajuda="Com ele, o nome da fonte passa a ligação.">
                <Input type="url" value={r.fonteUrl ?? ""} placeholder="https://…" onChange={(e) => definir({ fonteUrl: e.target.value })} />
              </Campo>
            </div>
          </Painel>
        </div>

        {/* ---------- Pré-visualização ---------- */}
        <div className={`xl:sticky xl:top-[8.75rem] xl:max-h-[calc(100dvh-10rem)] xl:overflow-y-auto xl:rounded-[var(--raio)] ${vista === "editar" ? "hidden xl:block" : ""}`}>
          <PreviaArtigo artigo={{ ...r, leitura: autoLeitura ? calculada : r.leitura }} />
        </div>
      </div>

      <Confirmar
        aberta={aApagar} aoFechar={() => setAApagar(false)} aoConfirmar={apagar} perigo textoConfirmar="Apagar"
        titulo={`Apagar «${base.titulo}»?`}
        mensagem="O artigo sai do site e da lista. Se só o quer esconder por agora, desligue «Publicado no site»."
      />
    </div>
  );
}

/** Campos que um artigo antigo pode não ter, já preenchidos (para comparar e editar). */
function normalizar(a: Artigo): Artigo {
  return {
    ...a,
    resumo: a.resumo ?? "", corpo: a.corpo ?? [], tags: a.tags ?? [], autor: a.autor ?? "",
    imagem: a.imagem ?? "", fonte: a.fonte ?? "", fonteUrl: a.fonteUrl ?? "",
    destaque: Boolean(a.destaque), publicado: a.publicado !== false,
  };
}

/* ---------------- Pré-visualização ---------------- */

/** O artigo como sai no site: a abertura em fotografia e o texto com a letra do site. */
function PreviaArtigo({ artigo: a }: { artigo: Artigo }) {
  const foto = fotoSrc(fotoDe(a.slug, a.imagem), { w: 1200 });
  return (
    <div className="painel overflow-hidden" aria-label="Pré-visualização do artigo">
      <p className="flex items-center justify-between gap-2 bg-black/30 px-4 py-2 text-xs text-white/75">
        <span>Assim fica no site</span>
        <span>/artigos/{a.slug || "…"}</span>
      </p>
      <div className="relative isolate flex min-h-[24rem] flex-col justify-end p-6 md:p-8">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 -z-20 bg-[#3a3a42]" />
        )}
        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="[text-shadow:0_1px_14px_rgb(0_0_0/0.45)]">
          <p className="sobretitulo text-white/85">{a.categoria}</p>
          <h1 className="titulo-3 mt-3 max-w-[24ch] text-balance">{a.titulo || "Título do artigo"}</h1>
          {a.resumo && <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-white/90">{a.resumo}</p>}
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/75">
            <span className="inline-flex items-center gap-2"><UserRound className="size-4" aria-hidden /> {a.autor || "Autor"}</span>
            <span>{dataLonga(a.data)}</span>
            <span className="inline-flex items-center gap-2"><Clock className="size-4" aria-hidden /> {a.leitura} min de leitura</span>
          </p>
        </div>
      </div>
      <div className="painel-escuro px-6 py-8 md:px-8">
        {a.corpo.some((l) => l.trim()) ? (
          <div className="prosa max-w-[68ch]">
            <CorpoArtigo corpo={a.corpo} />
            {a.fonte && (
              <p className="!mt-10 border-l-2 border-mb-red pl-4 !text-sm !text-white/80">
                Fonte: <span className={a.fonteUrl ? "sublinhado text-white/80" : ""}>{a.fonte}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/75">O texto aparece aqui à medida que o escreve.</p>
        )}
        {a.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-1.5 border-t border-white/10 pt-5">
            {a.tags.map((t) => (
              <li key={t} className="rounded-[4px] bg-white/7 px-2.5 py-1 text-xs text-white/80">{t}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
