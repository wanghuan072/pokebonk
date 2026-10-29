type Recipe = { slug: string; kind: string; moves: string[]; type: string; pair: string[][] | null };
type Move = { slug: string; type: string; shape?: string | null };
export function resolveFusion<T extends Recipe>(left: Move, right: Move, recipes: T[]): T | undefined {
  if (left.slug === right.slug || [left, right].some((m) => ["weather", "buff", "fusion"].includes(m.shape || ""))) return undefined;
  const signature = recipes.find((f) => f.kind === "signature" && f.moves.includes(left.slug) && f.moves.includes(right.slug));
  if (signature) return signature;
  const reaction = recipes.find((f) => f.kind === "reaction" && f.pair && ((f.pair[0].includes(left.type) && f.pair[1].includes(right.type)) || (f.pair[0].includes(right.type) && f.pair[1].includes(left.type))));
  if (reaction) return reaction;
  if (left.type === right.type) {
    const type = recipes.find((f) => f.kind === "type" && f.type === left.type);
    if (type) return type;
  }
  return recipes.find((f) => f.kind === "glitch");
}
