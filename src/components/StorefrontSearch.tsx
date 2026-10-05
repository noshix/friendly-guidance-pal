import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

export function StorefrontSearch({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({ to: "/produtos", search: { search: query.trim() || undefined, page: 1 } });
  }
  return (
    <form
      action="/produtos"
      method="get"
      onSubmit={submit}
      className={`store-search ${compact ? "store-search--compact" : ""}`}
      role="search"
    >
      <Search size={20} aria-hidden="true" />
      <input
        name="search"
        aria-label="Buscar produtos no catálogo"
        placeholder="O que você precisa para o seu projeto?"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" aria-label="Pesquisar no catálogo">
        <span>Buscar</span>
        <ArrowUpRight size={19} aria-hidden="true" />
      </button>
    </form>
  );
}
