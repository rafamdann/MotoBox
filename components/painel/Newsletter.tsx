"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { comBase } from "@/lib/base";

/* ============================================================
   MOTOBOX — Newsletter
   Uma linha de email e um botão, dentro de um painel. Envia
   para /api/newsletter (a mesma rota de sempre); `website` é a
   armadilha para robôs.
   ============================================================ */

type Estado = "parado" | "a-enviar" | "feito" | "erro";

export function NewsletterPainel({
  titulo = "Os artigos novos, no seu email",
  texto = "Uma vez por semana: histórias da comunidade, passeios e eventos, e conselhos de segurança. Sem spam, e cancela quando quiser.",
}: {
  titulo?: string;
  texto?: string;
}) {
  const [email, setEmail] = useState("");
  const [armadilha, setArmadilha] = useState("");
  const [estado, setEstado] = useState<Estado>("parado");
  const [mensagem, setMensagem] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("a-enviar");
    try {
      const r = await fetch(comBase("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origem: "cartao", website: armadilha }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setEstado("erro");
        setMensagem(j.erro ?? "Não foi possível subscrever agora.");
        return;
      }
      setEstado("feito");
      setMensagem("Está na lista. Até à próxima semana.");
      setEmail("");
    } catch {
      setEstado("erro");
      setMensagem("Sem ligação. Tente de novo daqui a pouco.");
    }
  }

  return (
    <div className="painel painel-escuro grid gap-8 p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end">
      <div>
        <span className="chip-mb chip-mb-lg" aria-hidden>
          <Mail />
        </span>
        <h2 className="titulo-3 mt-8 max-w-[18ch]">{titulo}</h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/80">{texto}</p>
      </div>
      <form onSubmit={enviar} className="w-full" noValidate>
        <label htmlFor="news-email" className="mb-2 block text-sm text-white/70">
          Email
        </label>
        {/* O campo é o elemento principal: ocupa a largura toda (no telemóvel, com o
            botão por baixo, da mesma altura); a partir do sm ficam lado a lado. */}
        <div className="flex flex-col gap-[var(--intervalo)] sm:flex-row sm:items-stretch">
          <input
            id="news-email"
            type="email"
            required
            autoComplete="email"
            placeholder="o.seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="campo h-14 w-full min-w-0 shrink-0 rounded-[var(--raio)] text-base sm:w-auto sm:flex-1 sm:shrink"
          />
          <button
            type="submit"
            disabled={estado === "a-enviar"}
            className="h-14 w-full shrink-0 rounded-[var(--raio)] bg-mb-red px-6 text-[15px] font-medium text-white transition-colors hover:bg-mb-red-dark disabled:opacity-60 sm:w-auto sm:min-w-[9.5rem]"
          >
            {estado === "a-enviar" ? "A enviar..." : "Subscrever"}
          </button>
        </div>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={armadilha}
          onChange={(e) => setArmadilha(e.target.value)}
          className="absolute -left-[9999px] size-px opacity-0"
          name="website"
        />
        <p role="status" className={`mt-3 min-h-5 text-sm ${estado === "erro" ? "text-mb-red-light" : "text-white/70"}`}>
          {mensagem || "Ao subscrever aceita receber emails da MotoBox Angola."}
        </p>
      </form>
    </div>
  );
}
