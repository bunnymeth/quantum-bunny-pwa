import {
  affirmations,
  bunnyLore,
  destinations as sourceDestinations,
  type Destination as SourceDestination,
} from "./gameData";

export type Dimension = "normal" | "cthulhu" | "scp" | "tiny";
export type DestinationType = "earth" | "space" | "cthulhu" | "scp" | "tiny";

export type Destination = Omit<SourceDestination, "dimension" | "type"> & {
  dimension: Dimension;
  type: DestinationType;
  rarity: 1 | 2 | 3;
};

export const DIMENSIONS: Record<Dimension, { label: string; icon: string; cost: number; unlock: number; tone: string }> = {
  normal: { label: "地球與宇宙", icon: "✦", cost: 10, unlock: 0, tone: "lavender" },
  cthulhu: { label: "微光深海次元", icon: "◌", cost: 25, unlock: 50, tone: "moss" },
  scp: { label: "收容觀測次元", icon: "⌁", cost: 50, unlock: 100, tone: "slate" },
  tiny: { label: "小小朋友次元", icon: "❀", cost: 30, unlock: 100, tone: "peach" },
};

export const destinations: Destination[] = sourceDestinations.map((destination) => ({
  ...destination,
  type: destination.type === "chiikawa" ? "tiny" : destination.type,
  dimension: destination.dimension === "chiikawa" ? "tiny" : destination.dimension,
  rarity: Math.min(3, Math.max(1, destination.rarity)) as 1 | 2 | 3,
}));

export { affirmations };
export const lore = bunnyLore;

export const companions = [
  { name: "星塵鼯鼠", emoji: "🐿️", greeting: "我把一小袋星塵借給你，迷路時就撒一點吧！" },
  { name: "泡泡水獺", emoji: "🦦", greeting: "旅行要記得浮在水面上休息一下喔。" },
  { name: "彗尾小鳥", emoji: "🐦", greeting: "我知道一條風很溫柔的捷徑，一起走嗎？" },
  { name: "雲朵刺蝟", emoji: "🦔", greeting: "我的刺今天收起來了，現在可以放心抱抱。" },
];
