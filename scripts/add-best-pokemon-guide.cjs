const fs = require('node:fs');
const file = 'src/data/guides/guides.json';
const guides = JSON.parse(fs.readFileSync(file, 'utf8'));
function section(title, text, paragraphs = [], portraits = [], columns = [], rows = [], steps = []) {
  return { title, text, paragraphs, portraits, columns, rows, steps, image: '', caption: '', callout: '' };
}
const guide = {
  slug: 'best-pokemon-in-pokebonk',
  title: 'Best Pokemon in PokeBonk: Who Should You Choose?',
  category: 'Partner guide',
  summary: 'Choose a starter or your next unlocked partner with clear reasons, build directions and tradeoffs for Classic, Survival and co-op.',
  icon: 'trophy', minutes: 9, isDetails: true,
  sections: [
    section('Best Pokemon in PokeBonk: the quick answer',
      'For a fresh account, Bulbasaur is our first recommendation. Once more League partners are unlocked, Slowpoke leads our solo Classic opening comparison. Bulbasaur is available from the first-partner screen; Slowpoke requires an unlock and asks you to accept slower movement.', [
        'If several small mistakes usually end your run, choose recovery or control before chasing a larger damage number. If you survive comfortably but cannot clear a route, inspect the attack pattern and damage class of your kit. Those are different problems, and the same partner will not solve both equally well.',
        'This guide uses the reviewed v0.8.62 kits and our Classic opening comparison: comfort receives 50% of the weight, offensive potential 30% and utility 20%, without Lab, vitamins or items. These are editorial scores, not measured win rates, timed boss tests or an official ranking.'
      ], [1, 79, 35], ['Your goal', 'Our pick', 'What to watch'], [
        ['First partner', 'Bulbasaur', 'Grass-hit healing needs attacks to connect.'],
        ['Forgiving unlocked Classic opening', 'Slowpoke', 'Slower movement makes late turns dangerous.'],
        ['Healing through Ultimate use', 'Clefairy', 'The recovery cast needs a charge ready.'],
        ['Recovery and nearby control', 'Tangela', 'Vines only stop four nearby enemies.'],
        ['Protection while learning', 'Squirtle', 'Armor and shield do not provide healing.']
      ]),
    section('Best starter: begin with Bulbasaur for recovery',
      'Synthesis grants +1.5 regeneration and +25% healing. Grass attacks also heal 0.4% HP per hit, capped at five triggers per second. Keep attacking while moving around the crowd rather than standing inside it to force another healing trigger.', [
        'Vine Whip starts equipped. Razor Leaf becomes a kit offer from run level 2, Sleep Powder from level 4 and Solar Beam from level 7. Offers are not automatically learned attacks. Give the opening enough investment to reach the later choices safely instead of saving every decision for a move you do not have.',
        'Razor Leaf and Solar Beam form Flower Beam when both reach attack level 8 and you use Bill’s Machine. The signature uses special damage, so Calcium supports that route. Compare recovery or armor for the remaining vitamin slots when contact damage still gets through.',
        'Bulbasaur reaches Ivysaur at run level 24 and Venusaur at 41. Those are run levels, not attack levels. Reaching Venusaur does not finish a fusion, and finishing Flower Beam does not replace the experience needed for evolution.'
      ], [1, 2, 3]),
    section('When Squirtle or Charmander fits better',
      'Squirtle gives immediate protection through Torrent Shell: +15 armor and +20 shield, with +40% damage below 40% HP. That buffer helps while learning spacing. Our B-tier opening placement reflects what it lacks after the buffer is spent: built-in healing.', [
        'Water Gun starts the run. Bubble, Rapid Spin and Hydro Pump become later kit offers. Rapid Spin plus Hydro Pump forms the special-damage Hydro Spiral signature. Improve the attacks keeping your lane open now; do not leave the opening weak while waiting for Hydro Pump.',
        'Charmander supplies +10% Fire damage and +40% damage below 40% HP through Sea of Flames. Fire Spin plus Flamethrower forms Fiery Whirlwind. The Fire bonus supports its kit, but deliberately staying at low HP leaves very little room for the next mistake.',
        'Charmander’s C-tier position here describes opening comfort, not Charizard’s late-run damage ceiling. Squirtle reaches Wartortle at 24 and Blastoise at 44; Charmander reaches Charmeleon at 24 and Charizard at 44. Choose the starting kit that gets you there.'
      ], [7, 4], ['Starter', 'Useful advantage', 'Next priority'], [
        ['Bulbasaur', 'Recovery from Grass hits', 'Keep hit uptime while moving.'],
        ['Squirtle', 'Immediate protection', 'Add recovery or a reliable escape route.'],
        ['Charmander', 'Fire damage', 'Protect health rather than forcing the low-HP bonus.']
      ]),
    section('Best unlocked pick for a forgiving opening: Slowpoke',
      'Slowpoke leads our comparison because recovery, a larger health pool and recurring sleep all help you reach the upgrades that make a run work. Its passive adds +25% HP and +1.5 regeneration, with -10% speed. Every 6 seconds, its yawn can put enemies within 6 metres to sleep.', [
        'That does not mean a permanently stopped horde. Use an interruption to correct a route and collect experience through a lane your attacks already cleared. The speed penalty makes early, broad turns more important than last-second reversals.',
        'If you regularly wait until enemies close the gap before choosing a direction, Slowpoke can feel worse than a quicker partner below it in the list. Slowbro’s later armor bonus is also not protection you should count as already active in the opening.',
        'Its League challenge is to put 8,000 Pokémon to sleep. If Slowpoke is locked, keep using an available partner; this recommendation is not a prerequisite for a clear. Complete the normal League challenge and capture process before planning a run around it.'
      ], [79, 80]),
    section('Clefairy and Tangela offer different recovery plans',
      'Clefairy adds +20 luck and +1 regeneration, charges the Ultimate 30% faster and recovers 15% HP when you cast it. Spend that reset while its healing matters instead of holding every charge for an imagined perfect boss moment.', [
        'Luck does not guarantee the next upgrade. A recently spent Ultimate leaves a gap, so ordinary attack coverage still has to protect you between casts. Its League challenge is to cast 80 Ultimates, giving you an unlock target while playing partners you already own.',
        'Tangela adds +2 regeneration. Every 5 seconds, vines root and damage the four closest enemies within 7 metres. That helps against nearby pursuers, but four trapped enemies are not an entire stopped horde. Ranged threats outside that circle can still punish your route.',
        'Tangela requires 20 League members and reaching level 35 in a run. It is a useful later recovery option, while Bulbasaur remains the immediate recommendation for a fresh account. Pick based on the tools you can actually bring into the next attempt.'
      ], [35, 114]),
    section('Why another tier list may rank damage picks higher',
      'A list that values completed final-form damage can order partners differently from one that values the opening. Read the comparison goal before copying its highest row. A kit that demands careful positioning can still be a good damage choice.', [
        'Machop’s +25% physical damage gives a clear build direction when the attacks you keep use physical damage. It does not improve a special signature just because that signature belongs to the same run. Its unlock challenge is to defeat 20 Alpha Pokémon.',
        'Rhyhorn provides +15 armor and a charge after 1.5 seconds of uninterrupted running. It rewards broad movement rather than repeatedly stopping in a small pocket. Unlocking it requires 20 League members and smashing 100 rocks with Rock Smash.',
        'Keep the region and difficulty fixed when trying another partner. Note whether you lost to chip damage, a closed lane or insufficient clearing. Changing the partner, Lab and route together makes it hard to tell which change helped.'
      ], [66, 111]),
    section('Choosing for Survival and co-op',
      'The Classic opening order is a shortlist for Survival, not a prediction of the strongest completed long-run build. Ask whether the kit can keep clearing, recover between difficult stretches and escape when enemies stop dying quickly.', [
        'Bulbasaur gives a concrete Survival direction through its Grass signature and hit-based recovery. It still needs usable ingredients before fusion. Slowpoke offers a recovery-oriented opening, but its movement penalty remains a positioning commitment even when its opening rank is high.',
        'For co-op, choose with the room. Another damage pick may add little if the group already clears well but keeps losing players to poor routes. Stacking recovery-oriented kits also does not automatically supply missing attack reach or coverage.',
        'Check the room’s unlocked map, difficulty and access before planning. Do not assume a passive describing your own healing also heals teammates. A useful team choice starts with understanding what the kit actually does, not assigning an unsupported healer or tank label.'
      ]),
    section('Choose your next partner in five decisions',
      'Use the partner you can select today, then make one attempt answer one question. Fixing a repeatable problem is more useful than changing characters whenever you find a different ranking.', [], [], [], [], [
        'On the first-partner screen, try Bulbasaur for Grass-hit recovery or Squirtle for immediate protection.',
        'If Slowpoke is unlocked and chip damage ends your runs, try its recovery while planning turns earlier.',
        'When using Clefairy, cast the Ultimate while the healing matters rather than judging the kit without using it.',
        'Choose a fusion whose ingredients work before they combine. Both need attack level 8 at Bill’s Machine.',
        'After the run, identify the failure. Change partners if another kit addresses it; otherwise adjust movement or upgrades first.'
      ]),
    section('Questions before you choose',
      'What is the best Pokémon in PokeBonk overall? Slowpoke is our first unlocked pick for solo Classic opening comfort. For a fresh account choosing between the three starters, we recommend Bulbasaur. Neither answer promises the highest completed-build damage.', [
        'Is Charizard better than Venusaur? Compare Charmander’s Fire damage route with Bulbasaur’s Grass-hit recovery and decide which addresses your problem. They are later forms of different starting kits; species stat totals alone do not establish a universal winner.',
        'Do you need a legendary Pokémon to clear? This recommendation does not require one. Get useful attacks working with an available partner and learn a repeatable route. A difficult unlock is not evidence that it will fix an early positioning mistake.',
        'Are evolved forms separate starting partners? Not in these starter families. Choose Bulbasaur, Charmander or Squirtle and evolve during the run. The 151 Pokédex species and 79 League starting kits describe different things.',
        'Is this an official ranking? No. It is our editorial comparison under the opening conditions stated above. No measured win rate, universal consensus or invented testing history is claimed.'
      ])
  ],
  related: ['beginners-guide', 'endless-mode-guide', 'coop-mode-guide'],
  gameVersion: '0.8.62', lastVerified: '2026-10-28', source: 'https://pokebonk.com/',
  seo: {
    title: 'Best Pokemon in PokeBonk - Starters & Strong Picks',
    description: 'Find the best Pokemon in PokeBonk for your next run. Compare starters, recovery picks and build tradeoffs for Classic, Survival and co-op before choosing.',
    keywords: ['best pokemon in pokebonk', 'PokeBonk best starter', 'PokeBonk strongest Pokemon']
  }
};
const index = guides.findIndex(g => g.slug === guide.slug);
if (index === -1) guides.push(guide); else guides[index] = guide;
fs.writeFileSync(file, JSON.stringify(guides, null, 2) + '\n');
const artFile = 'src/data/media/guide-visuals.json';
const art = JSON.parse(fs.readFileSync(artFile, 'utf8'));
art[guide.slug] = {kind: 'screenshot', src: '/images/home/game/league.webp', alt: 'Original PokeBonk League menu for comparing playable partners'};
fs.writeFileSync(artFile, JSON.stringify(art, null, 2) + '\n');
