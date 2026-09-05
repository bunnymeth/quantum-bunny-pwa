import { useCallback, useEffect, useRef, useState } from "react";

import {
  destinations,
  DIMENSION_THRESHOLDS,
  getLeapCost,
  getRandomAffirmation,
  getRandomLore,
  PURE_ENERGY_RATE,
  type Destination,
  type Dimension,
} from "./gameData";

export type TravelCompanion = {
  name: string;
  emoji: string;
  greeting: string;
};

export type TravelJournalEntry = {
  id: string;
  destinationId: string;
  destinationName: string;
  dimension: Dimension;
  note: string;
  returnedAt: number;
  companion?: TravelCompanion;
};

export interface GameState {
  points: number;
  totalPoints: number;
  pureEnergy: number;
  lastEnergyAt: number;
  collectedPostcards: string[];
  currentTrip: { destinationId: string; startTime: number; duration: number; dimension: Dimension } | null;
  lastAffirmation: string;
  lastLore: string;
  bunnyState: "home" | "traveling" | "leaving" | "returning";
  currentDimension: Dimension;
  dimensionBroken: { cthulhu: boolean; scp: boolean; chiikawa: boolean };
  totalTrips: number;
  travelJournal: TravelJournalEntry[];
  currentCompanion: TravelCompanion | null;
}

const STORAGE_KEY = "quantum_bunny_game_state_web";
const LEGACY_LAST_SAVE_KEY = "quantum_bunny_last_save_web";
const MAX_JOURNAL_ENTRIES = 30;
const companions: TravelCompanion[] = [
  { name: "星塵鼯鼠", emoji: "🐿️", greeting: "我把一小袋星塵借給你，迷路時就撒一點吧！" },
  { name: "泡泡水獺", emoji: "🦦", greeting: "旅行要記得浮在水面上休息一下喔。" },
  { name: "彗尾小鳥", emoji: "🐦", greeting: "我知道一條風很溫柔的捷徑，一起走嗎？" },
  { name: "雲朵刺蝟", emoji: "🦔", greeting: "我的刺今天收起來了，現在可以放心抱抱。" },
];

const defaultState: GameState = {
  points: 0,
  totalPoints: 0,
  pureEnergy: 0,
  lastEnergyAt: Date.now(),
  collectedPostcards: [],
  currentTrip: null,
  lastAffirmation: getRandomAffirmation(),
  lastLore: "",
  bunnyState: "home",
  currentDimension: "normal",
  dimensionBroken: { cthulhu: false, scp: false, chiikawa: false },
  totalTrips: 0,
  travelJournal: [],
  currentCompanion: null,
};

function normalizeState(candidate: Partial<GameState>): GameState {
  const now = Date.now();
  const legacyTimestamp = Number(localStorage.getItem(LEGACY_LAST_SAVE_KEY) ?? now);
  const lastEnergyAt = Number.isFinite(candidate.lastEnergyAt) ? candidate.lastEnergyAt! : legacyTimestamp;
  const offlinePureEnergy = Math.max(0, Math.floor(((now - lastEnergyAt) / 1000) * PURE_ENERGY_RATE));
  return {
    ...defaultState,
    ...candidate,
    pureEnergy: Math.max(0, candidate.pureEnergy ?? 0) + offlinePureEnergy,
    lastEnergyAt: now,
    collectedPostcards: Array.isArray(candidate.collectedPostcards) ? candidate.collectedPostcards : [],
    dimensionBroken: { ...defaultState.dimensionBroken, ...candidate.dimensionBroken },
    travelJournal: Array.isArray(candidate.travelJournal) ? candidate.travelJournal : [],
    currentCompanion: candidate.currentCompanion ?? null,
  };
}

function calculatePureEnergy(state: GameState, now: number): number {
  const seconds = Math.max(0, (now - state.lastEnergyAt) / 1000);
  return state.pureEnergy + Math.floor(seconds * PURE_ENERGY_RATE);
}

function createJournalEntry(destination: Destination, companion: TravelCompanion | null): TravelJournalEntry {
  const note = `${destination.name} 的風景像一封慢慢展開的信。兔兔把「${destination.message}」小心寫在日誌裡。`;
  return {
    id: `${destination.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    destinationId: destination.id,
    destinationName: destination.name,
    dimension: destination.dimension,
    note,
    returnedAt: Date.now(),
    ...(companion ? { companion } : {}),
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setState(saved ? normalizeState(JSON.parse(saved) as Partial<GameState>) : defaultState);
    } catch {
      setState(defaultState);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage can be unavailable in private browsing */ }
  }, [isLoaded, state]);

  const completeTripIfNeeded = useCallback(() => {
    const current = stateRef.current;
    const trip = current.currentTrip;
    if (!trip || Date.now() - trip.startTime < trip.duration * 1000) return;
    const destination = destinations.find((item) => item.id === trip.destinationId);
    if (!destination) return;
    const companion = Math.random() < 0.35 ? companions[Math.floor(Math.random() * companions.length)] : null;
    setState((previous) => {
      if (!previous.currentTrip || previous.currentTrip.startTime !== trip.startTime) return previous;
      const entry = createJournalEntry(destination, companion);
      return {
        ...previous,
        currentTrip: null,
        bunnyState: "home",
        totalTrips: previous.totalTrips + 1,
        // A postcard is a tangible return from every trip, including repeat visits.
        collectedPostcards: [...previous.collectedPostcards, destination.id],
        travelJournal: [entry, ...previous.travelJournal].slice(0, MAX_JOURNAL_ENTRIES),
        currentCompanion: companion,
        lastLore: getRandomLore(),
      };
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    completeTripIfNeeded();
  }, [clock, isLoaded, completeTripIfNeeded]);

  const getTruePureEnergy = useCallback(() => calculatePureEnergy(stateRef.current, Date.now()), []);

  const addPoints = useCallback((amount = 1) => {
    setState((previous) => ({
      ...previous,
      points: previous.points + amount,
      totalPoints: previous.totalPoints + amount,
      lastAffirmation: getRandomAffirmation(),
    }));
  }, []);

  const startQuantumLeap = useCallback((dimension: Dimension): Destination | null => {
    const current = stateRef.current;
    if (current.currentTrip || (dimension !== "normal" && !current.dimensionBroken[dimension])) return null;
    const cost = getLeapCost(dimension);
    const pureEnergy = calculatePureEnergy(current, Date.now());
    if (current.points < cost || pureEnergy < cost) return null;
    const candidates = destinations.filter((destination) => destination.dimension === dimension);
    const weighted = candidates.flatMap((destination) => Array.from({ length: destination.rarity === 1 ? 5 : destination.rarity === 2 ? 3 : 1 }, () => destination));
    const destination = weighted[Math.floor(Math.random() * weighted.length)];
    if (!destination) return null;
    const now = Date.now();
    setState((previous) => ({
      ...previous,
      points: previous.points - cost,
      pureEnergy: Math.max(0, calculatePureEnergy(previous, now) - cost),
      lastEnergyAt: now,
      currentTrip: { destinationId: destination.id, startTime: now, duration: destination.travelTime, dimension },
      bunnyState: "traveling",
      currentDimension: dimension,
    }));
    return destination;
  }, []);

  const breakDimensionWall = useCallback((dimension: Dimension): boolean => {
    const current = stateRef.current;
    if (dimension === "normal" || current.dimensionBroken[dimension]) return false;
    const required = dimension === "cthulhu" ? DIMENSION_THRESHOLDS.spaceToCthulhu : dimension === "scp" ? DIMENSION_THRESHOLDS.cthulhuToSCP : DIMENSION_THRESHOLDS.scpToChiikawa;
    const prerequisiteMet = dimension === "cthulhu" || (dimension === "scp" ? current.dimensionBroken.cthulhu : current.dimensionBroken.scp);
    const pureEnergy = calculatePureEnergy(current, Date.now());
    if (!prerequisiteMet || pureEnergy < required) return false;
    const now = Date.now();
    setState((previous) => ({
      ...previous,
      pureEnergy: Math.max(0, calculatePureEnergy(previous, now) - required),
      lastEnergyAt: now,
      dimensionBroken: { ...previous.dimensionBroken, [dimension]: true },
      lastLore: `次元壁安靜地打開了。${dimension === "chiikawa" ? "新的小夥伴正在遠方揮手。" : "兔兔的善意又抵達了一個新世界。"}`,
    }));
    return true;
  }, []);

  const dismissCompanion = useCallback(() => setState((previous) => ({ ...previous, currentCompanion: null })), []);
  const getTravelProgress = useCallback(() => {
    const trip = stateRef.current.currentTrip;
    return trip ? Math.min(1, (Date.now() - trip.startTime) / (trip.duration * 1000)) : 0;
  }, []);
  const getTravelRemaining = useCallback(() => {
    const trip = stateRef.current.currentTrip;
    return trip ? Math.max(0, trip.duration - (Date.now() - trip.startTime) / 1000) : 0;
  }, []);

  return {
    state,
    isLoaded,
    pureEnergyDisplay: calculatePureEnergy(state, clock),
    getTruePureEnergy,
    addPoints,
    startQuantumLeap,
    breakDimensionWall,
    dismissCompanion,
    getTravelProgress,
    getTravelRemaining,
  };
}
