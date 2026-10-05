const categories: Record<string, { name: string; image: string }> = {
  CONDUTOR: { name: "Fios e cabos", image: "condutor.jpg" },
  PROTECAO: { name: "Proteção elétrica", image: "protecao.png" },
  FERRAMENT: { name: "Ferramentas", image: "ferramenta.jpg" },
  "EQUIPAM.": { name: "Equipamentos", image: "equipamentos.jpg" },
  COMANDOS: { name: "Comandos elétricos", image: "comando.jpg" },
  ATERRAMEN: { name: "Aterramento", image: "aterramento.jpg" },
  DIVERSOS: { name: "Acessórios elétricos", image: "diversos.jpg" },
  ISOLADORES: { name: "Isoladores", image: "isoladores.jpg" },
};
export function categoryPresentation(
  erpName: string,
  publicName: string,
  imageUrl?: string | null,
) {
  const entry = categories[erpName.trim().toLocaleUpperCase("pt-BR")];
  return {
    name: entry?.name ?? publicName,
    image: imageUrl || (entry ? `/assets/categories/${entry.image}` : ""),
  };
}
