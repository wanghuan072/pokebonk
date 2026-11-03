// Keep the explicitly published batch when factual game records are regenerated.
const fs = require('node:fs');
const file = 'src/data/pokedex/pokemon.json';
const details = require('../src/data/pokedex/details.json');
const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const entry of entries) {
  entry.isDetails = Object.hasOwn(details, entry.slug);
  if (entry.isDetails) entry.seo = details[entry.slug].seo;
  else delete entry.seo;
}
fs.writeFileSync(file, JSON.stringify(entries, null, 2) + '\n');
