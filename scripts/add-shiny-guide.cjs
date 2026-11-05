const fs = require('node:fs');
const file = 'src/data/guides/guides.json';
const guides = JSON.parse(fs.readFileSync(file, 'utf8'));
const section = (title, text, paragraphs = [], extra = {}) => ({ title, text, paragraphs, steps: [], image: '', caption: '', portraits: [], columns: [], rows: [], callout: '', ...extra });
const guide = {
  slug: 'pokebonk-shiny-guide',
  title: 'PokeBonk Shiny Guide: Catching, Charm & Classic Looks',
  category: 'Collection guide',
  summary: 'Learn how to catch a shiny, unlock its family look and work toward Shiny Charm. Understand what stays saved and why a shiny catch may not unlock a partner.',
  icon: 'star', minutes: 8, isDetails: true,
  gameVersion: '0.8.62', lastVerified: '2026-10-28', source: 'https://pokebonk.com/',
  related: ['beginners-guide', 'best-pokemon-in-pokebonk', 'coop-mode-guide'],
  seo: {
    title: 'PokeBonk Shiny Guide - Catching, Charm & Unlocks',
    description: 'Use this PokeBonk shiny guide to catch encounters, unlock family looks and earn Shiny Charm. Learn Classic Shiny differences and why a partner stays locked.',
    keywords: ['pokebonk shiny', 'pokebonk shiny charm', 'pokebonk classic shiny', 'how to get shiny pokemon in pokebonk']
  },
  sections: [
    section('PokeBonk shiny: what you actually unlock',
      'A shiny catch can unlock a look for its evolution family, add to your collection and give you a companion during the run. It does not automatically recruit the normal starting partner into your League. That distinction explains the common situation where a shiny is recorded but the Pokémon is still locked.', [
        'Treat the encounter, the saved look and the selectable partner as three separate things. If you want to play the species from the start of a later run, complete its League challenge and capture the normal partner as well. If you only want to wear the shiny look, first check that the family has joined your League.',
        'The numerical perks below use the reviewed v0.8.62 client records, checked October 28, 2026. Later patches can change encounter behavior. This guide does not turn an older number into a claim about the live version or promise a shiny after a fixed number of runs.'
      ]),
    section('Shiny, Classic Shiny and other Looks are different',
      'Read the encounter or wardrobe label rather than identifying every unusual colour as the same unlock. Classic Shiny is described by the game as the original shiny colours with classic sprites, appearing very rarely with a golden glow.', [
        'The ordinary Shiny label and Classic Shiny label are separate collection and appearance states. Catching a Classic Shiny unlocks the classic look for the evolution line once that partner is in your League. Do not assume an ordinary shiny automatically grants every appearance in the wardrobe.',
        'Mastery Looks come from their stated challenges. Spectral and other appearances can share the same wardrobe with shiny options without sharing their unlock conditions. An unusual costume on a League card is not evidence that a wild shiny was captured.'
      ], { columns: ['What you see', 'What it means', 'What to check'], rows: [
        ['Shiny encounter', 'A shiny capture and family-look opportunity', 'Complete the catch; a sighting is not enough.'],
        ['Classic Shiny', 'Classic colours and sprites with a separate look unlock', 'Watch the encounter label and golden glow.'],
        ['Mastery Look', 'A challenge-based appearance', 'Read the exact Looks achievement.'],
        ['Locked League partner with a shiny look', 'The appearance and normal recruitment are separate', 'Finish the normal challenge and capture.']
      ] }),
    section('How to catch a shiny when one appears',
      'Make the encounter the priority as soon as you notice it, but reach it through an open lane. A rare target is not worth losing the run while running directly through a pack. The game has explicit messages for a shiny vanishing, so avoid spending its whole appearance window elsewhere.', [
        'Use the capture input displayed for your current controls. On keyboard, follow the game’s nearby capture prompt; on touch or controller, use the on-screen action instead of assuming a keyboard shortcut applies. Wait for the catch result before treating the shiny as secured.',
        'The useful confirmation is a captured or look-unlocked message and the collection entry afterward. Simply defeating a target, spotting it in the Pokédex or being near a teammate’s catch is not a substitute for completing your own required interaction.'
      ], { steps: [
        'Identify whether the prompt says Shiny or Classic Shiny so you know which collection state you are trying to unlock.',
        'Clear a safe route to it and weaken the encounter until the game presents its capture state.',
        'Move close and use the displayed capture action to throw your Poké Ball.',
        'Wait for the game’s catch confirmation. Do not leave a target that is still waiting for a throw.',
        'Afterward, check the League look or collection entry, and check normal recruitment separately.'
      ] }),
    section('How to unlock Shiny Charm',
      'In the reviewed client, Shiny Charm is the six-shiny collection perk. Its description says shinies appear 50% more often and take 150 seconds to flee instead of 120. It is a collection milestone, not a Lab purchase named Research.', [
        'A 50% increase is relative to the underlying appearance rate. It does not mean half of all encounters are shiny, and the longer escape window does not guarantee a successful catch. Check the collection milestone shown in your current game before planning around the perk.',
        'Use the collection’s own progress counter when checking whether you have reached the milestone. Do not assume every repeated catch, every alternate Look or every achievement increments the same counter. The rewards table is not an invitation to substitute achievement catch totals for collection progress.'
      ]),
    section('Shiny collection rewards worth working toward',
      'The collection gives more than a different colour. The reviewed client lists the following permanent milestones. Check the threshold inside the collection, then decide whether another capture is the goal for this attempt rather than changing every part of your build at once.', [], {
        columns: ['Collection milestone', 'Perk', 'Recorded effect'],
        rows: JSON.parse(fs.readFileSync('docs/research/official-config.json', 'utf8')).er.map(p => [String(p.n), p.name, p.desc])
      }),
    section('Can you improve your shiny chances?',
      'Shiny Charm is a confirmed appearance-frequency perk in the reviewed data. The Bag also has a consumable named Dawn Stone whose description guarantees a shiny appearance in zone 1. An appearance guarantee is not a catch guarantee, and it does not say you can choose the species or force a Classic Shiny.', [
        'Check the exact item description before spending Stardust. The reviewed Bag record calls its icon shiny-stone, while the separate in-run Dawn Stone catalogue item describes damage and attack-speed bonuses. Similar names and shared artwork do not mean those items perform the same job.',
        'The Master Ball found as an in-run item says it guarantees capture in Wild Encounters. That is a different job from causing an encounter to appear. Do not combine the Bag Master Ball’s separately worded first-capture effect with the item’s effect and assume every future throw is guaranteed.',
        'Base shiny odds are not quoted here because they need a current, mode-specific check of the encounter logic. In particular, a chance rolled once per zone is not a chance on every enemy defeated. Avoid converting a percentage from another game or a different patch into an expected number of kills.'
      ]),
    section('After the catch: equip the look and manage your companion',
      'Return to the League or its Looks selection and inspect the family you caught. If the normal partner is already recruited, choose the unlocked shiny appearance there. If it is still locked, complete its normal challenge and capture first; the shiny look can wait for that recruitment.', [
        'The recorded replacement prompt allows one shiny companion at a time. When another shiny is caught, read which Pokémon the interface is asking you to release. The game’s message says you keep the Pokédex entry and the stated Stardust either way, so releasing the companion is not the same as deleting the collection entry.',
        'A companion leaving the current run and a saved family look are different states. Before reporting a lost shiny, check the correct Shiny or Classic Shiny view and the family’s normal League status. Also keep using the same account or saved session; this fan site cannot read or restore the game’s save.'
      ]),
    section('Why your shiny Pokémon is still locked',
      'The game explicitly separates a shiny catch from a normal League capture. If you caught a shiny Bulbasaur after choosing Charmander, for example, you have not necessarily completed Bulbasaur’s normal recruitment. Check its challenge, complete it and catch the normal partner when it appears.', [
        'The same distinction applies to evolved forms. A shiny Charizard appearance belongs to the evolution family; it does not make Charizard a separate level-1 starting partner. Start with the recruited Charmander and follow the run’s evolution path to use its later forms.',
        'Do not erase your save just because a wardrobe option and a locked League card appear together. Read the locked card’s requirement and confirm whether you have a normal catch, a shiny look, or an Alpha companion that only fought alongside you in one run.'
      ]),
    section('Co-op catches and shiny legendaries',
      'Co-op capture instructions tell each player to throw their own Poké Ball after the team weakens an eligible encounter. Follow your own prompt instead of assuming another player’s interaction completed yours.', [
        'The reviewed update text says a legendary’s shiny roll is shared by the team. That describes the shared roll, not an instruction to skip the encounter or the required capture interaction. It also does not establish that all ordinary shiny encounters have the same shared-roll rule.',
        'If a selected mode says captures are disabled, use a mode that permits them for your collection goal. A reliable hunting attempt starts by checking that the run can actually award the thing you are seeking.'
      ]),
    section('PokeBonk shiny FAQ',
      'Does a shiny make the Pokémon stronger? Equipping a shiny look is described as cosmetic. Collection perks and the shiny companion’s Bond reward are separate benefits; a different colour alone is not an extra damage stat.', [
        'Can a shiny run away? Yes. The game has vanished messages for both Shiny and Classic Shiny, and the reviewed Charm description extends the escape time. Get to the encounter promptly and finish the capture rather than relying on the extra time.',
        'Does Shiny Charm guarantee Classic Shiny? No guarantee of a Classic Shiny is stated in the reviewed perk description. Do not interpret more frequent shinies as a promise about a particular variant or species.',
        'Does replacing my shiny companion remove the look? The replacement prompt says you retain the Pokédex entry and stated Stardust. Check your saved collection and wardrobe separately from the current companion slot.',
        'Is there a guaranteed shiny farming route? The reviewed Bag Dawn Stone describes a guaranteed appearance in zone 1. That does not establish a repeatable route for a chosen species, a guaranteed capture or an unlimited free farming method.'
      ])
  ]
};
const i = guides.findIndex(g => g.slug === guide.slug);
if (i < 0) guides.push(guide); else guides[i] = guide;
fs.writeFileSync(file, JSON.stringify(guides, null, 2) + '\n');
const artFile = 'src/data/media/guide-visuals.json';
const art = JSON.parse(fs.readFileSync(artFile, 'utf8'));
art[guide.slug] = {kind: 'screenshot', src: '/images/home/game/league.webp', alt: 'Original PokeBonk League interface; check shiny looks after recruiting the normal partner'};
fs.writeFileSync(artFile, JSON.stringify(art, null, 2) + '\n');
