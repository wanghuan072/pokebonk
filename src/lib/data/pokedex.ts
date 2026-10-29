import data from "@/data/pokedex/pokemon.json";
export const pokemon = data;
export const getPokemon = (slug: string) =>
  pokemon.find((p) => p.slug === slug);
export const popularPokemon = [4, 7, 1, 25, 133, 92].map((id) =>
  pokemon.find((p) => p.id === id)!,
);
