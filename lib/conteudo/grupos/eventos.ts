/* ============================================================
   Conteúdo editável — Eventos e Artigos
   - "eventos-extra": campos que o site mostra mas que a tabela
     `eventos` ainda não tem coluna para guardar ("Como
     participar"). Um documento por evento, com a chave do slug.
   - "paginas.eventos" e "paginas.artigos": os textos fixos das
     secções /eventos e /artigos e das páginas de cada evento e
     de cada artigo. O texto de partida é o que estava escrito no
     código; com nada gravado, o site fica exactamente igual.

   Os documentos são planos (sem objectos lá dentro): o gravado
   junta-se ao de partida campo a campo, por isso um texto novo
   que se acrescente aqui aparece logo, mesmo com o documento já
   editado no painel.
   ============================================================ */

import { eventos } from "@/lib/data";
import type { DefDoc, DefGrupo } from "../registo-tipos";

/** O que se guarda por evento em "eventos-extra". */
export interface ExtraEvento {
  /** Como se participa: "Entrada livre", "5.000 Kz pagos no local", "Inscrição através do clube". */
  entrada: string;
}

export const GRUPOS: DefGrupo[] = [
  {
    grupo: "eventos-extra",
    titulo: "Extras dos eventos",
    pagina: (chave) => `/eventos/${chave}`,
    padrao: () =>
      eventos
        .filter((e) => typeof e.entrada === "string" && e.entrada.trim())
        .map((e) => ({ chave: e.slug, titulo: e.titulo, dados: { entrada: e.entrada } })),
  },
];

/* ---------------- /eventos e /eventos/[slug] ---------------- */

export interface ConteudoPaginaEventos {
  /** Descrição para os motores de busca e as partilhas. */
  descricaoPesquisa: string;
  foto: string;
  sobretitulo: string;
  titulo: string;
  texto: string;
  proximos: string;
  todos: string;
  provasMostrar: boolean;
  provasTitulo: string;
  provasTexto: string;
  provasLigacao: string;
  vazio: string;
  /** Com um tipo escolhido; "{tipo}" passa a "passeio", "raide"… */
  vazioTipo: string;
  passados: string;
  divulgarMostrar: boolean;
  divulgarSobretitulo: string;
  divulgarTitulo: string;
  divulgarTexto: string;
  divulgarFoto: string;
  divulgarBotao: string;
  divulgarLigacao: string;
  /* Página de cada evento */
  eventoCalendario: string;
  eventoPassado: string;
  eventoRotuloData: string;
  eventoRotuloTipo: string;
  eventoRotuloOrganizacao: string;
  eventoSobre: string;
  eventoPrograma: string;
  eventoParticipar: string;
  eventoAvisoMostrar: boolean;
  eventoAvisoTitulo: string;
  eventoAvisoTexto: string;
  eventoAvisoBotao: string;
  eventoAvisoLigacao: string;
  eventoOutros: string;
  eventoTodos: string;
}

export const PAGINA_EVENTOS_PADRAO: ConteudoPaginaEventos = {
  descricaoPesquisa:
    "Passeios, raides, encontros, concentrações, acções solidárias e formações para quem anda de mota em Angola.",
  foto: "banner-eventos",
  sobretitulo: "Eventos",
  titulo: "Passeios, encontros e raides",
  texto:
    "Onde a comunidade se junta: saídas de domingo, raides pelo país, concentrações, acções solidárias e formações. Para todos os tipos de mota.",
  proximos: "Próximos eventos",
  todos: "Todos",
  provasMostrar: true,
  provasTitulo: "Provas do Campeonato Nacional",
  provasTexto: "motocross, enduro e rally-raid estão no calendário do Desporto, com bilhetes, horários e resultados.",
  provasLigacao: "/calendario",
  vazio: "Não há eventos marcados de momento. Volte em breve, ou divulgue o seu.",
  vazioTipo: "Não há eventos marcados do tipo {tipo} de momento. Volte em breve, ou divulgue o seu.",
  passados: "Já aconteceu",
  divulgarMostrar: true,
  divulgarSobretitulo: "Organiza um passeio, um encontro ou um raide?",
  divulgarTitulo: "Divulgue o seu evento na MotoBox",
  divulgarTexto:
    "Clubes, oficinas, escolas de condução e grupos de amigos: se o evento é para quem anda de mota, tem lugar aqui. Envie-nos a data, o local e o programa, e a equipa publica-o depois de confirmar.",
  divulgarFoto: "painel-eventos",
  divulgarBotao: "Enviar um evento",
  divulgarLigacao: `/contacto?assunto=${encodeURIComponent("Divulgar um evento")}`,
  eventoCalendario: "Adicionar ao calendário",
  eventoPassado: "Este evento já aconteceu.",
  eventoRotuloData: "data",
  eventoRotuloTipo: "tipo de evento",
  eventoRotuloOrganizacao: "organização",
  eventoSobre: "Sobre o evento",
  eventoPrograma: "Programa",
  eventoParticipar: "Como participar",
  eventoAvisoMostrar: true,
  eventoAvisoTitulo: "Vai a este evento?",
  eventoAvisoTexto: "Verifique a mota antes de sair, leve o capacete apertado e combine o ritmo com o grupo.",
  eventoAvisoBotao: "Guia de segurança",
  eventoAvisoLigacao: "/seguranca",
  eventoOutros: "Outros eventos",
  eventoTodos: "Todos os eventos",
};

/* ---------------- /artigos e /artigos/[slug] ---------------- */

export interface ConteudoPaginaArtigos {
  descricaoPesquisa: string;
  sobretitulo: string;
  titulo: string;
  texto: string;
  todos: string;
  vazio: string;
  /** Ao lado (ou por baixo, no telemóvel) do artigo de abertura: os mais recentes a seguir. */
  recentes: string;
  /** Botão da caixa dos mais recentes, que desce até à lista. */
  verMais: string;
  /** Título da lista com os restantes artigos. */
  maisArtigos: string;
  newsletter: boolean;
  /* Página de cada artigo */
  /** Primeiro elo do caminho no topo do artigo ("Artigos › Categoria"); leva à lista. */
  artigoCaminho: string;
  artigoLeitura: string;
  artigoPartilhar: string;
  artigoPartilharBotao: string;
  artigoCopiado: string;
  /** Guardar o artigo na conta do membro (/conta → Guardados). */
  artigoGuardar: string;
  artigoGuardarBotao: string;
  artigoGuardado: string;
  artigoFonte: string;
  artigoEtiquetas: string;
  artigoTodos: string;
  artigoContinuar: string;
  artigoNewsletter: boolean;
}

export const PAGINA_ARTIGOS_PADRAO: ConteudoPaginaArtigos = {
  descricaoPesquisa:
    "Histórias da comunidade motard angolana, clubes, viagens, guias e segurança. Os artigos da MotoBox.",
  sobretitulo: "MotoBox · Artigos",
  titulo: "Histórias de quem anda de mota",
  texto:
    "Clubes, viagens, guias e segurança: o que se passa na comunidade motard angolana, contado por quem lá anda.",
  todos: "Todos",
  vazio: "Ainda não há artigos nesta categoria.",
  recentes: "Mais recentes",
  verMais: "Ver mais artigos",
  maisArtigos: "Mais artigos",
  newsletter: true,
  artigoCaminho: "Artigos",
  artigoLeitura: "min de leitura",
  artigoPartilhar: "Partilhar",
  artigoPartilharBotao: "Partilhar artigo",
  artigoCopiado: "Ligação copiada",
  artigoGuardar: "Guardar",
  artigoGuardarBotao: "Guardar artigo",
  artigoGuardado: "Guardado na sua conta",
  artigoFonte: "Fonte:",
  artigoEtiquetas: "Etiquetas",
  artigoTodos: "Todos os artigos",
  artigoContinuar: "Continue a ler",
  artigoNewsletter: true,
};

/** Entradas das secções /eventos e /artigos. */
export const DOCS: DefDoc[] = [
  { chave: "paginas.eventos", titulo: "Eventos (página da secção)", pagina: "/eventos", padrao: () => ({ ...PAGINA_EVENTOS_PADRAO }) },
  { chave: "paginas.artigos", titulo: "Artigos (página da secção)", pagina: "/artigos", padrao: () => ({ ...PAGINA_ARTIGOS_PADRAO }) },
];
