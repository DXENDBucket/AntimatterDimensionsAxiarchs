import { Autobuyer } from "../autobuyers/autobuyers";
import { Currency } from "../currency";
import { EternityChallenges } from "../eternity-challenge";
import { GameDatabase } from "../secret-formula/game-database";
import { InfinityChallenges } from "../infinity-challenges";
import { NormalChallenges } from "../normal-challenges";

function decimal(value) {
  return new Decimal(value);
}

function fillArray(target, value) {
  for (let i = 0; i < target.length; i++) target[i] = value;
}

function bitMaskFromEntries(entries) {
  let bits = 0;
  for (const entry of entries) {
    if (typeof entry?.id !== "number") continue;
    bits |= (1 << entry.id);
  }
  return bits;
}

function setRunUnlocks(unlocks, value) {
  for (let i = 0; i < unlocks.length; i++) unlocks[i] = value;
}

function resetTabVisibility() {
  player.options.hiddenTabBits = 0;
  player.options.hiddenSubtabBits = player.options.hiddenSubtabBits.map(() => 0);
  player.options.lastOpenTab = 0;
  player.options.lastOpenSubtab = player.options.lastOpenSubtab.map(() => 0);
}

function finalizeProgress() {
  resetTabVisibility();
  if (typeof Lazy !== "undefined" && typeof Lazy.invalidateAll === "function") {
    Lazy.invalidateAll();
  }
  if (typeof GameUI !== "undefined" && typeof GameUI.update === "function") {
    GameUI.update();
  }
}

function ensureChallengeCompletions() {
  NormalChallenges.completeAll();
  InfinityChallenges.completeAll();
  player.challenge.normal.current = 0;
  player.challenge.infinity.current = 0;
  fillArray(player.challenge.normal.bestTimes, 1000);
  fillArray(player.challenge.infinity.bestTimes, 1000);
}

function ensureInfinityUpgrades() {
  const normal = Object.values(GameDatabase.infinity.upgrades).map(upg => upg.id);
  const breakUpgrades = Object.values(GameDatabase.infinity.breakUpgrades).map(upg => upg.id);
  player.infinityUpgrades = new Set([...normal, ...breakUpgrades]);
  player.infinityRebuyables = [8, 7, 10];
  player.IPMultPurchases = Math.max(player.IPMultPurchases, 1000);
}

function ensureEternityUpgrades() {
  const ids = Object.values(GameDatabase.eternity.upgrades).map(upg => upg.id);
  player.eternityUpgrades = new Set(ids);
  player.epmultUpgrades = Math.max(player.epmultUpgrades, 60);
}

function ensureTimeStudies() {
  const normal = GameDatabase.eternity.timeStudies.normal.map(study => study.id);
  const ec = GameDatabase.eternity.timeStudies.ec.map(study => study.id);
  const dilation = GameDatabase.eternity.timeStudies.dilation.map(study => study.id);
  player.timestudy.studies = Array.from(new Set([...normal, ...ec, ...dilation]));
  player.timestudy.theorem = decimal("1e7");
  player.timestudy.maxTheorem = decimal("1e7");
  player.timestudy.amBought = Math.max(player.timestudy.amBought, 1e6);
  player.timestudy.ipBought = Math.max(player.timestudy.ipBought, 1e6);
  player.timestudy.epBought = Math.max(player.timestudy.epBought, 1e6);
  player.dilation.studies = [...dilation];
  player.dilation.upgrades = new Set([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  player.dilation.rebuyables = { 1: 50, 2: 38, 3: 50, 11: 20, 12: 15, 13: 10 };
}

function ensureEternityChallenges() {
  const completions = {};
  for (const ec of EternityChallenges.all) {
    ec.hasUnlocked = true;
    ec.completions = ec.maxCompletions;
    completions[ec.fullId] = ec.maxCompletions;
  }
  player.eternityChalls = completions;
  player.challenge.eternity.current = 0;
  player.challenge.eternity.unlocked = 0;
  player.challenge.eternity.requirementBits = EternityChallenges.all.reduce((bits, ec) => bits | (1 << ec.id), 0);
  player.reality.unlockedEC = EternityChallenges.all.reduce((bits, ec) => bits | (1 << ec.id), 0);
  player.reality.autoEC = true;
}

function ensureRealityUpgrades() {
  const singlePurchaseReality = GameDatabase.reality.upgrades.filter(upg => upg.id > 5);
  player.reality.upgradeBits = bitMaskFromEntries(singlePurchaseReality);
  for (const key of Object.keys(player.reality.rebuyables)) {
    player.reality.rebuyables[key] = Math.max(player.reality.rebuyables[key], 50);
  }
  const singlePurchaseImaginary = GameDatabase.reality.imaginaryUpgrades.filter(upg => upg.id > 10);
  player.reality.imaginaryUpgradeBits = bitMaskFromEntries(singlePurchaseImaginary);
  player.reality.imaginaryUpgReqs = player.reality.imaginaryUpgradeBits;
  for (const key of Object.keys(player.reality.imaginaryRebuyables)) {
    player.reality.imaginaryRebuyables[key] = Math.max(player.reality.imaginaryRebuyables[key], 25);
  }
  const perks = Object.values(GameDatabase.reality.perks).map(perk => perk.id);
  player.reality.perks = new Set(perks);
  player.reality.perkPoints = Math.max(player.reality.perkPoints, 100);
  player.reality.reqLock.reality = 0;
  player.reality.reqLock.imaginary = 0;
  player.reality.glyphs.protectedRows = Math.max(player.reality.glyphs.protectedRows, 6);
  Object.keys(player.reality.glyphs.sac).forEach(key => {
    player.reality.glyphs.sac[key] = Math.max(player.reality.glyphs.sac[key], 1e12);
  });
}

function ensureCelestialBits() {
  player.celestials.teresa.pouredAmount = Math.max(player.celestials.teresa.pouredAmount, 1e24);
  player.celestials.teresa.bestRunAM = Decimal.max(player.celestials.teresa.bestRunAM, decimal("1e15000"));
  player.celestials.teresa.unlockBits = bitMaskFromEntries(Object.values(GameDatabase.celestials.teresa.unlocks));
  player.celestials.teresa.perkShop = player.celestials.teresa.perkShop.map(() => 25);
  player.celestials.teresa.lastRepeatedMachines = Decimal.max(
    player.celestials.teresa.lastRepeatedMachines,
    decimal("1e12")
  );

  player.celestials.effarig.unlockBits = bitMaskFromEntries(Object.values(GameDatabase.celestials.effarig.unlocks));
  player.celestials.effarig.relicShards = Math.max(player.celestials.effarig.relicShards, 1e120);
  player.celestials.effarig.autoAdjustGlyphWeights = true;
  player.celestials.effarig.glyphWeights = { ep: 25, repl: 25, dt: 25, eternities: 25 };

  const enslavedProgress = Object.values(GameDatabase.celestials.enslaved.progress);
  player.celestials.enslaved.unlocks = enslavedProgress.map(entry => entry.id);
  player.celestials.enslaved.progressBits = bitMaskFromEntries(enslavedProgress);
  player.celestials.enslaved.hintBits = bitMaskFromEntries(enslavedProgress);
  player.celestials.enslaved.hintUnlockProgress = 1;
  player.celestials.enslaved.glyphHintsGiven = GameDatabase.celestials.enslaved.glyphHints.length;
  player.celestials.enslaved.completed = true;
  player.celestials.enslaved.hasSecretStudy = true;
  player.celestials.enslaved.tesseracts = Math.max(player.celestials.enslaved.tesseracts, 1e6);
  player.celestials.enslaved.feltEternity = true;

  player.celestials.v.unlockBits = bitMaskFromEntries(Object.values(GameDatabase.celestials.v.unlocks));
  setRunUnlocks(player.celestials.v.runUnlocks, 6);
  setRunUnlocks(player.celestials.v.goalReductionSteps, 10);
  player.celestials.v.runRecords = [-10, 60, 60, 60, 60, 60, 60, 60, 60];
  player.celestials.v.STSpent = 0;

  player.celestials.ra.unlockBits = bitMaskFromEntries(Object.values(GameDatabase.celestials.ra.unlocks));
  for (const pet of Object.values(player.celestials.ra.pets)) {
    pet.level = Math.max(pet.level, 25);
    pet.memories = Math.max(pet.memories, 1e7);
    pet.memoryChunks = Math.max(pet.memoryChunks, 1e8);
    pet.memoryUpgrades = Math.max(pet.memoryUpgrades, 10);
    pet.chunkUpgrades = Math.max(pet.chunkUpgrades, 10);
  }
  player.celestials.ra.highestRefinementValue = {
    power: 1e6,
    infinity: 1e6,
    time: 1e6,
    replication: 1e6,
    dilation: 1e6,
    effarig: 1e6,
  };
  player.celestials.ra.alchemy = player.celestials.ra.alchemy.map(resource => ({
    amount: Math.max(resource.amount, 1e6),
    reaction: true,
  }));
  player.celestials.ra.momentumTime = Math.max(player.celestials.ra.momentumTime, 3600);
  player.celestials.ra.charged = new Set(Object.values(GameDatabase.infinity.upgrades).map(upg => upg.id));
  player.celestials.ra.petWithRemembrance = "teresa";

  Currency.darkMatter.bumpTo(decimal("1e1200"));
  player.celestials.laitela.maxDarkMatter = Decimal.max(player.celestials.laitela.maxDarkMatter, decimal("1e1200"));
  player.celestials.laitela.darkMatterMult = Math.max(player.celestials.laitela.darkMatterMult, 1e4);
  player.celestials.laitela.darkEnergy = Math.max(player.celestials.laitela.darkEnergy, 1e9);
  player.celestials.laitela.singularities = Math.max(player.celestials.laitela.singularities, 50);
  player.celestials.laitela.singularityCapIncreases = Math.max(player.celestials.laitela.singularityCapIncreases, 10);
  player.celestials.laitela.fastestCompletion = Math.min(player.celestials.laitela.fastestCompletion, 60);
  player.celestials.laitela.difficultyTier = Math.max(player.celestials.laitela.difficultyTier, 8);
  player.celestials.laitela.entropy = Math.max(player.celestials.laitela.entropy, 1);
  player.celestials.laitela.dimensions = player.celestials.laitela.dimensions.map(dimension => ({
    amount: Decimal.max(dimension.amount, decimal("1e60")),
    intervalUpgrades: Math.max(dimension.intervalUpgrades, 50),
    powerDMUpgrades: Math.max(dimension.powerDMUpgrades, 50),
    powerDEUpgrades: Math.max(dimension.powerDEUpgrades, 50),
    timeSinceLastUpdate: 0,
    ascensionCount: Math.max(dimension.ascensionCount, 10),
  }));

  player.celestials.pelle.realityShards = Decimal.max(player.celestials.pelle.realityShards, decimal("1e90"));
  player.celestials.pelle.remnants = Math.max(player.celestials.pelle.remnants, 1e9);
  player.celestials.pelle.progressBits = bitMaskFromEntries(Object.values(GameDatabase.celestials.pelle.strikes));
  player.celestials.pelle.galaxyGenerator.unlocked = true;
  player.celestials.pelle.galaxyGenerator.generatedGalaxies = Math.max(
    player.celestials.pelle.galaxyGenerator.generatedGalaxies,
    200
  );
  for (const key of Object.keys(player.celestials.pelle.rebuyables)) {
    player.celestials.pelle.rebuyables[key] = Math.max(player.celestials.pelle.rebuyables[key], 25);
  }
  Object.values(player.celestials.pelle.rifts).forEach(rift => {
    rift.fill = rift.fill instanceof Decimal ? decimal(1) : 1;
    rift.active = true;
    if ("percentageSpent" in rift) rift.percentageSpent = 1;
    if (typeof rift.reducedTo === "number") rift.reducedTo = 0;
  });
}

function ensureRecords() {
  player.records.totalAntimatter = Decimal.max(player.records.totalAntimatter, decimal("1e3000000"));
  player.records.totalTimePlayed = Math.max(player.records.totalTimePlayed, 1e6);
  player.records.realTimePlayed = Math.max(player.records.realTimePlayed, 1e6);
  player.records.thisInfinity.maxAM = Decimal.max(player.records.thisInfinity.maxAM, decimal("1e15000"));
  player.records.thisInfinity.time = Math.max(player.records.thisInfinity.time, 1000);
  player.records.thisInfinity.realTime = Math.max(player.records.thisInfinity.realTime, 1000);
  player.records.thisEternity.maxIP = Decimal.max(player.records.thisEternity.maxIP, decimal("1e15000"));
  player.records.thisEternity.time = Math.max(player.records.thisEternity.time, 1000);
  player.records.thisEternity.realTime = Math.max(player.records.thisEternity.realTime, 1000);
  player.records.thisReality.maxAM = Decimal.max(player.records.thisReality.maxAM, decimal("1e18000"));
  player.records.thisReality.maxIP = Decimal.max(player.records.thisReality.maxIP, decimal("1e15000"));
  player.records.thisReality.maxEP = Decimal.max(player.records.thisReality.maxEP, decimal("1e15000"));
  player.records.thisReality.maxReplicanti = Decimal.max(player.records.thisReality.maxReplicanti, decimal("1e320000"));
  player.records.thisReality.maxDT = Decimal.max(player.records.thisReality.maxDT, decimal("1e15000"));
  player.records.thisReality.time = Math.max(player.records.thisReality.time, 1000);
  player.records.thisReality.realTime = Math.max(player.records.thisReality.realTime, 1000);
  player.records.bestInfinity.time = Math.min(player.records.bestInfinity.time, 1000);
  player.records.bestInfinity.realTime = Math.min(player.records.bestInfinity.realTime, 1000);
  player.records.bestEternity.time = Math.min(player.records.bestEternity.time, 1000);
  player.records.bestEternity.realTime = Math.min(player.records.bestEternity.realTime, 1000);
  player.records.bestReality.time = Math.min(player.records.bestReality.time, 1000);
  player.records.bestReality.realTime = Math.min(player.records.bestReality.realTime, 1000);
  player.records.bestReality.RM = Decimal.max(player.records.bestReality.RM, decimal("1e40"));
  player.records.bestReality.RMmin = Decimal.max(player.records.bestReality.RMmin, decimal("1e20"));
  player.records.bestReality.glyphLevel = Math.max(player.records.bestReality.glyphLevel, 10000);
  player.records.bestReality.glyphStrength = Math.max(player.records.bestReality.glyphStrength, 10000);
  player.records.bestReality.speedSet = ["Instant"];
  player.records.bestReality.laitelaSet = ["Complete"];
  player.records.bestReality.iMCapSet = ["Max"];
  player.records.fullGameCompletions = Math.max(player.records.fullGameCompletions, 1);
  player.records.totalities = Math.max(player.records.totalities, player.totality.count);
}

export function applyInfinityPreset({ skipFinalize = false } = {}) {
  Currency.antimatter.bumpTo(decimal("1e6000"));
  player.records.totalAntimatter = Decimal.max(player.records.totalAntimatter, decimal("1e6000"));
  player.dimensionBoosts = Math.max(player.dimensionBoosts, 50);
  player.galaxies = Math.max(player.galaxies, 100);
  ensureChallengeCompletions();
  ensureInfinityUpgrades();
  Currency.infinityPoints.bumpTo(decimal("1e7000"));
  Currency.infinities.bumpTo(decimal("1e12"));
  Currency.infinitiesBanked.bumpTo(decimal("1e12"));
  player.break = true;
  Autobuyer.bigCrunch.maxIntervalForFree();
  player.auto.bigCrunch.isActive = true;
  player.auto.bigCrunch.mode = AUTO_CRUNCH_MODE.TIME;
  player.auto.bigCrunch.time = 0.1;
  player.auto.bigCrunch.amount = decimal("1e50");
  player.auto.bigCrunch.xHighest = decimal("1e6");
  player.auto.dimBoost.isActive = true;
  player.auto.galaxy.isActive = true;
  player.auto.autobuyersOn = true;
  player.options.retryChallenge = true;
  if (!skipFinalize) finalizeProgress();
}

export function applyEternityPreset({ skipFinalize = false } = {}) {
  applyInfinityPreset({ skipFinalize: true });
  ensureEternityUpgrades();
  ensureTimeStudies();
  ensureEternityChallenges();
  Currency.eternityPoints.bumpTo(decimal("1e9000"));
  Currency.eternities.bumpTo(decimal("1e9"));
  player.timeShards = decimal("1e6000");
  player.totalTickGained = Math.max(player.totalTickGained, 5e5);
  player.totalTickBought = Math.max(player.totalTickBought, 5e5);
  player.replicanti.unl = true;
  Currency.replicanti.bumpTo(decimal("1e250000"));
  player.replicanti.chance = 1;
  player.replicanti.interval = 1;
  player.replicanti.galaxies = Math.max(player.replicanti.galaxies, 500);
  player.replicanti.boughtGalaxyCap = Math.max(player.replicanti.boughtGalaxyCap, 500);
  Currency.tachyonParticles.bumpTo(decimal("1e12000"));
  Currency.dilatedTime.bumpTo(decimal("1e13000"));
  player.dilation.baseTachyonGalaxies = Math.max(player.dilation.baseTachyonGalaxies, 100);
  player.dilation.totalTachyonGalaxies = Math.max(player.dilation.totalTachyonGalaxies, 200);
  player.dilation.lastEP = decimal("1e1000");
  player.options.retryCelestial = true;
  if (!skipFinalize) finalizeProgress();
}

export function applyRealityPreset({ skipFinalize = false } = {}) {
  applyEternityPreset({ skipFinalize: true });
  ensureRealityUpgrades();
  Currency.realityMachines.bumpTo(decimal("1e60"));
  player.reality.maxRM = Decimal.max(player.reality.maxRM, decimal("1e60"));
  player.reality.realityMachines = Decimal.max(player.reality.realityMachines, decimal("1e60"));
  player.realities = Math.max(player.realities, 25);
  player.reality.partSimulatedReality = Math.max(player.reality.partSimulatedReality, 1);
  player.reality.perkPoints = Math.max(player.reality.perkPoints, 100);
  player.reality.iMCap = Math.max(player.reality.iMCap, 1e40);
  Currency.imaginaryMachines.bumpTo(1e30);
  player.reality.imaginaryMachines = Math.max(player.reality.imaginaryMachines, 1e30);
  player.blackHole.forEach(hole => {
    hole.unlocked = true;
    hole.intervalUpgrades = Math.max(hole.intervalUpgrades, 25);
    hole.powerUpgrades = Math.max(hole.powerUpgrades, 25);
    hole.durationUpgrades = Math.max(hole.durationUpgrades, 25);
    hole.phase = Math.max(hole.phase, 1);
    hole.activations = Math.max(hole.activations, 5);
  });
  ensureRecords();
  if (!skipFinalize) finalizeProgress();
}

export function applyCelestialPreset({ skipFinalize = false } = {}) {
  applyRealityPreset({ skipFinalize: true });
  ensureCelestialBits();
  if (!skipFinalize) finalizeProgress();
}

export function applyTotalityPreset({ skipFinalize = false } = {}) {
  applyCelestialPreset({ skipFinalize: true });
  player.totality.unlocked = true;
  player.totality.count = Math.max(player.totality.count, 3);
  Currency.totalityMachines.bumpTo(decimal(10));
  player.totality.machines = Decimal.max(player.totality.machines, decimal(10));
  player.records.totalities = Math.max(player.records.totalities, player.totality.count);
  if (!skipFinalize) finalizeProgress();
}

export { resetTabVisibility };
