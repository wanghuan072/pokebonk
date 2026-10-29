const sections=[['Pokémon','/pokedex'],['Attacks','/wiki/attacks'],['Vitamins','/wiki/vitamins'],['Items','/wiki/items']];
export default function WikiNavigation({current}:{current:string}){return <nav className="wiki-section-nav" aria-label="Wiki sections">{sections.map(([label,href])=><a key={href} href={href} aria-current={current===href?'page':undefined}>{label}</a>)}</nav>}
