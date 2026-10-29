module.exports = [
['Choose a build for damage, recovery or protection',
'A useful PokeBonk build has an opening attack that can keep you alive, enough damage to stop enemies piling up, and a way to recover from mistakes. Those jobs do not have to occupy three different slots, but you should be able to explain which part of your kit does each one.',
'A finished build screenshot hides the hard part: the order in which its pieces arrived. Before copying one, ask whether it works with your current Lab slots, whether the partner is unlocked, and which two ingredients must become level 8 for the intended fusion. If the plan only starts working after several lucky offers, give yourself a fallback.',
'Each plan starts with a passive and a job for the opening attack. Keep that job in mind when a different offer appears. A useful fallback lets you carry on when the next ingredient does not turn up, instead of waiting for one exact shopping list.'
],
['Match stat bonuses to your moves’ damage class',
'The physical and special multipliers in the Pokédex are unmodified run baselines. Effective damage also depends on the attack, its level and geometry, the partner passive, items, target defenses and other modifiers. Adding damage divided by cooldown across unrelated shapes does not produce a trustworthy in-game DPS comparison.',
'A barrage may miss or distribute projectiles. A strike may hit several enemies, while a beam has its own targeting and hit behavior. An area attack can be valuable because it keeps a route clear even when another attack has a larger single-target number. Pick the attack you can connect consistently, then support its damage class.',
'Protein is a physical-damage vitamin; Calcium supports special damage. If your useful attacks are split between classes, compare the offered improvement with a broader damage option instead of assuming one class bonus helps the whole kit. The Items list contains this game’s effects and maximums.'
],
['Bulbasaur: Grass attacks and healing',
'Synthesis adds +1.5 regen and +25% healing. Grass attacks heal 0.4% of HP per hit, capped at five healing triggers per second. The practical advantage is repeatable recovery while you are already attacking, rather than waiting for a rescue pickup.',
'Vine Whip is a physical strike; Razor Leaf is a physical barrage. Sleep Powder and Solar Beam give the kit different jobs later. If you support the early physical attacks, do not assume the same class investment automatically maximizes every later choice. Keep checking what is actually dealing useful damage.',
'The mistake to avoid is taking recovery as permission to trade contact hits. A healing trigger has a limit; several enemies can still hit you at once. Keep Grass attacks active, maintain a route out, and use recovery to repair occasional mistakes. If enemies survive too long, improve the damage that creates space before adding still more healing.'
],
['Squirtle: armor, shield and Water moves',
'Torrent Shell adds +15 armor and +20 shield, plus +40% damage below 40% HP. The unmodified baseline is 108 HP and 11.12 armor; that is not the final starting armor after the passive is applied.',
'Water Gun and Bubble establish the ranged side of the kit, while Rapid Spin changes coverage near you. Hydro Pump is a later option. Look for the pattern your encounters need rather than upgrading all four names equally. You can use the defensive start to spend more offers on damage, but only while protection is keeping pace.',
'Do not deliberately trigger the low-health bonus before an unfamiliar boss. If you keep surviving the opening and fail because the boss stays alive too long, inspect the damage report. Focus upgrades on attacks that connect with that boss instead of repeatedly buying another defensive layer.'
],
['Machop: physical damage and move choices',
'Guts gives +25% physical damage. The kit contains Karate Chop, Low Kick, Cross Chop and Dynamic Punch. That is a clearer reason to prefer physical support than simply saying a Pokémon has a high Attack stat in another game.',
'A close-range physical plan still needs an exit. Before choosing another damage bonus, look at whether you can keep attacks landing without taking repeated contact hits. If you cannot, control or protection may increase real damage uptime more than another percentage on a move you are too busy escaping to use well.',
'This contrasts with Bulbasaur: the passive helps offense directly but does not provide the same recovery loop. Your run needs an answer to lost health. Check items and available upgrades against that need, and avoid spending every slot on attacks merely because they share the physical label.'
],
['Choose a fusion and upgrade its ingredients',
'A signature recipe needs the correct pair, not just two attacks of the same element. Both must reach level 8. Check the partner’s signature, then look at what each ingredient contributes while you are leveling it. The investment can be expensive if one ingredient does little for your current route.',
'Before using Bill’s Machine, ask three questions. Will the result keep the coverage I rely on? Does freeing a slot give me an immediate useful option? Can I survive the next stretch after changing the kit? A named result is not automatically an upgrade for every encounter.',
'If you cannot complete the pair, keep improving the attack carrying the run. A stable unfinished build is better for learning than restarting until perfect offers appear. Afterward, note which ingredient mattered, then decide whether a slot or offer-control Lab purchase would improve consistency.',
'A fusion normally stops at ★5. TM Case makes ★6 available and raises the cap on ordinary moves to level 10. If the fusion is already doing the work, another useful star can be a better direction than filling its freed slot with an attack you cannot support. The item changes your growth ceiling, not the level-8 requirement for the ingredient pair. Keep a build that works without it; its Legendary rarity makes it a poor foundation for an opening plan.',
'Check the patch when copying an older fusion build. Version 0.8.17 fixed fusions ignoring extra projectiles, so an older damage report is a poor baseline for deciding whether that bonus helps now. The pause menu shows damage over the last 15 seconds as well as the total: use the recent window to see what is carrying the current encounter. Different fusion patterns still use projectiles differently, so do not turn one successful example into a rule for every recipe.'
],
['Adjust builds for Classic, Survival and Time attack',
'For a new Classic clear, a forgiving opening and a way to finish bosses are useful priorities. In Survival, pressure continues much longer; a comfortable opening does not prove a build scales indefinitely. Long-run rules changed in published updates, so compare patch versions before trusting an older video.',
'For Global KOs, choose the region still offering the biggest improvement to the sum of your best records. For Time attack, get regional completions before obsessing over one quick clear. The leaderboard page shows the official rules and dated top-100 standings for all three modes.',
'Treat our tier model as a shortlist, then use the run itself to answer the remaining questions. It compares all 79 starting kits with an explicit bias toward opening comfort. It cannot know your Lab levels, the offers you receive or which attack pattern you use best.'
],
['Use Build Plan and check each upgrade offer',
'The in-game Build Plan lets you mark attacks, vitamins, fusions and items for each partner. Planned choices are marked during the run; item markers also appear in Poké Balls and Meowth’s shop. They are reminders, not a promise that an item will appear. Unlocking and Archive settings still decide whether an item is eligible.',
'The six-item planning limit from v0.8.44 was removed in v0.8.45. Do not confuse the planner’s summary with your actual in-run slots: marking a fourth attack does not buy the Lab upgrade. Keep one workable core and a fallback instead of marking everything and losing the signal the plan is meant to give you.',
'Since v0.8.47, each fusion explains its component patterns and what Area, Duration and Projectiles change. Read those parts before taking a scaling offer: increasing a zone and adding projectiles to a barrage are different benefits. Since v0.8.55, the pause panel also adds up level-up modifiers for each move. Use that panel alongside recent damage to compare the build you actually assembled, rather than the level-one values alone.',
'Our finder now also covers the 18 same-type outcomes, eight reactions and MissingNo. A signature pair wins first, then a reaction, then the same-type result; different types with no earlier match produce MissingNo. Weather, buff and existing fusion patterns are not eligible ingredients.'
],
['How co-op changes build decisions',
'Co-op changed quickly after v0.8.25. The seal barriers, Wrath, shifting weaknesses and linked elite pairs introduced in v0.8.45 were removed in v0.8.46. Do not plan around those old mechanics just because a video still shows them. Guardians threaten the whole team, and selecting an upgrade protects the choosing player while stopping that player’s damage.',
'Go beside a downed teammate and hold E to revive. Choose a map and difficulty the whole room has unlocked, and resolve version warnings before starting. Shared map discoveries and per-player damage views can help divide attention, but this solo opening-comfort tier model does not score team compositions or network conditions.',
'Mastery Looks challenges count in solo play. Favorites change your selection shortcuts, not your damage. For a cosmetic target, read its exact condition and use a solo attempt; for a team clear, judge the build by what helps that group survive the current encounter.'
]
];
