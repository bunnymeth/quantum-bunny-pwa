export type DestinationType = "earth" | "space" | "cthulhu" | "scp" | "chiikawa";
export type Dimension = "normal" | "cthulhu" | "scp" | "chiikawa";

export interface Destination {
  id: string;
  name: string;
  nameEn: string;
  type: DestinationType;
  dimension: Dimension;
  image: string;
  message: string;
  travelTime: number;
  rarity: number;
}

export const DIMENSION_THRESHOLDS = { earthToSpace: 0, spaceToCthulhu: 50, cthulhuToSCP: 100, scpToChiikawa: 100 } as const;
export const PURE_ENERGY_RATE = 0.05;
const CDN = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663474220152";
const appBase = typeof document === "undefined" ? "/" : new URL("./", document.baseURI).pathname;
const local = (file: string) => `${appBase}postcards/${file}.png`;

export function getLeapCost(dimension: Dimension): number {
  return dimension === "normal" ? 10 : dimension === "cthulhu" ? 25 : dimension === "scp" ? 50 : 30;
}

export const destinations: Destination[] = [
  { id: "fuji", name: "富士山", nameEn: "Mount Fuji", type: "earth", dimension: "normal", image: `${CDN}/wVFAHLZMQscajxYJ.png`, message: "每一座山都是心的高度，你今天也很棒！", travelTime: 15, rarity: 1 },
  { id: "paris", name: "巴黎鐵塔", nameEn: "Paris, France", type: "earth", dimension: "normal", image: `${CDN}/tErGwHGpIDayYJEw.png`, message: "浪漫在心中，不只在巴黎。你值得所有美好。", travelTime: 20, rarity: 1 },
  { id: "aurora", name: "冰島北極光", nameEn: "Iceland Aurora", type: "earth", dimension: "normal", image: `${CDN}/GScODPCwgWwpEwYV.png`, message: "最美的光，來自你的內心。繼續閃耀吧！", travelTime: 25, rarity: 2 },
  { id: "reef", name: "大堡礁", nameEn: "Great Barrier Reef", type: "earth", dimension: "normal", image: `${CDN}/zVIOkQKMvktCupYH.png`, message: "海洋的溫柔，就像你的善良一樣。", travelTime: 20, rarity: 1 },
  { id: "pyramid", name: "埃及金字塔", nameEn: "Egypt Pyramids", type: "earth", dimension: "normal", image: `${CDN}/LfmctzwSlOHNlIhj.png`, message: "千年智慧，你今天也很棒！", travelTime: 25, rarity: 2 },
  { id: "greatwall", name: "長城", nameEn: "The Great Wall of China", type: "earth", dimension: "normal", image: `${CDN}/uuHOdbnfLOkXmoWH.png`, message: "一步一腳印，你已經走了很遠。", travelTime: 25, rarity: 2 },
  { id: "kyoto", name: "京都朱紅鳥居", nameEn: "Kyoto, Japan", type: "earth", dimension: "normal", image: local("earth_kyoto"), message: "花瓣落下的速度剛好，慢慢走也會抵達想去的地方。", travelTime: 24, rarity: 1 },
  { id: "venice", name: "威尼斯水巷", nameEn: "Venice, Italy", type: "earth", dimension: "normal", image: local("earth_venice"), message: "溫柔的水路提醒兔兔：繞一點路，也可能遇見美景。", travelTime: 28, rarity: 2 },
  { id: "petra", name: "佩特拉玫瑰城", nameEn: "Petra, Jordan", type: "earth", dimension: "normal", image: local("earth_petra"), message: "藏在岩石裡的光，也會等到被看見的一天。", travelTime: 30, rarity: 2 },
  { id: "maldives", name: "馬爾地夫潟湖", nameEn: "Maldives Lagoon", type: "earth", dimension: "normal", image: local("earth_maldives"), message: "把煩惱放進清澈的海水裡，它們會變得很小很小。", travelTime: 26, rarity: 1 },
  { id: "santorini-sunset", name: "聖托里尼日落", nameEn: "Santorini, Greece", type: "earth", dimension: "normal", image: local("santorini"), message: "藍與白之間，兔兔想起：休息也是前進的一部分。", travelTime: 27, rarity: 2 },
  { id: "iceland-beach", name: "冰島黑沙灘", nameEn: "Iceland Black Sand Beach", type: "earth", dimension: "normal", image: local("earth_iceland"), message: "極光不急著出現，勇氣也可以慢慢長大。", travelTime: 32, rarity: 3 },
  { id: "mars", name: "火星", nameEn: "Mars", type: "space", dimension: "normal", image: `${CDN}/NXsAIdRYmSiXgUtB.png`, message: "即使遙遠，夢想依然閃亮。你是最勇敢的兔兔！", travelTime: 30, rarity: 2 },
  { id: "saturn", name: "土星環", nameEn: "Saturn", type: "space", dimension: "normal", image: `${CDN}/teqOGNHgtLzTzjkT.png`, message: "你的光環，比土星更美。宇宙都在為你加油！", travelTime: 35, rarity: 3 },
  { id: "nebula", name: "獵戶座星雲", nameEn: "Orion Nebula", type: "space", dimension: "normal", image: `${CDN}/VFVTSmisxMWojWxA.png`, message: "在浩瀚宇宙中，你是獨一無二的存在。", travelTime: 40, rarity: 3 },
  { id: "moon", name: "月球", nameEn: "The Moon", type: "space", dimension: "normal", image: `${CDN}/bxYKvSPKQYRzOOoX.png`, message: "距離再遠，心與心相連。我一直都在你身邊。", travelTime: 30, rarity: 2 },
  { id: "galaxy", name: "銀河中心", nameEn: "Milky Way Center", type: "space", dimension: "normal", image: `${CDN}/WNdhjlMtDbCSawMn.png`, message: "你本身就是宇宙的一部分，充滿無限可能。", travelTime: 45, rarity: 3 },
  { id: "jupiter", name: "木星大紅斑", nameEn: "Jupiter", type: "space", dimension: "normal", image: `${CDN}/pmKHFFPRsdNrYGmL.png`, message: "風暴過後，彩虹更美。堅持就是力量！", travelTime: 40, rarity: 3 },
  { id: "neptune", name: "海王星雲海", nameEn: "Neptune", type: "space", dimension: "normal", image: local("space_neptune"), message: "兔兔漂進藍色風暴，才發現安靜也能很有力量。", travelTime: 42, rarity: 2 },
  { id: "comet", name: "彗星尾巴", nameEn: "Comet Trail", type: "space", dimension: "normal", image: local("space_comet"), message: "短暫劃過天空的光，也足以替願望指引方向。", travelTime: 38, rarity: 2 },
  { id: "black-hole", name: "溫柔黑洞觀測站", nameEn: "Gentle Black Hole Observatory", type: "space", dimension: "normal", image: local("space_blackhole"), message: "看似未知的地方，也能用好奇心慢慢靠近。", travelTime: 50, rarity: 3 },
  { id: "rlyeh", name: "拉萊耶沉沒之城", nameEn: "R'lyeh", type: "cthulhu", dimension: "cthulhu", image: `${CDN}/juWLCeZMVLQwgFAp.png`, message: "古老的低語也無法蓋過兔兔心裡溫柔的聲音。", travelTime: 50, rarity: 3 },
  { id: "void", name: "虛空深淵", nameEn: "The Void Between Dimensions", type: "cthulhu", dimension: "cthulhu", image: `${CDN}/FoHtNyiDYIyLWYzk.png`, message: "在虛空中漂浮，兔兔依然保持微笑。純淨之心，是照亮黑暗的光。", travelTime: 55, rarity: 3 },
  { id: "azathoth", name: "星眠宮殿", nameEn: "Court of Sleeping Stars", type: "cthulhu", dimension: "cthulhu", image: `${CDN}/HPzJYZdiMlCFPSuJ.png`, message: "宇宙很大，兔兔的善意也能抵達每一個角落。", travelTime: 60, rarity: 3 },
  { id: "innsmouth", name: "霧港小鎮", nameEn: "Misty Harbour", type: "cthulhu", dimension: "cthulhu", image: local("innsmouth"), message: "海霧散開後，兔兔看見一盞為自己亮著的小燈。", travelTime: 48, rarity: 2 },
  { id: "dream-city", name: "夢境階梯城", nameEn: "Dream Stairway City", type: "cthulhu", dimension: "cthulhu", image: local("dream_city"), message: "每一層雲梯都通往新的可能，兔兔一步步向上走。", travelTime: 55, rarity: 2 },
  { id: "yellow-tower", name: "金鐘花園", nameEn: "Golden Clocktower Garden", type: "cthulhu", dimension: "cthulhu", image: local("yellow_king"), message: "兔兔在神祕花園喝到一杯安定心情的星光茶。", travelTime: 58, rarity: 3 },
  { id: "glow-garden", name: "微光果凍花園", nameEn: "Glow Pudding Garden", type: "cthulhu", dimension: "cthulhu", image: local("cthulhu_shoggoth"), message: "就算在最奇妙的地方，善意也能交到新朋友。", travelTime: 52, rarity: 1 },
  { id: "site19", name: "Site-19 收容設施", nameEn: "Secure Facility Site-19", type: "scp", dimension: "scp", image: `${CDN}/BzZIRsppaqqcjjaS.png`, message: "兔兔被分類為：安全。理由：太可愛了，無法被收容。", travelTime: 50, rarity: 3 },
  { id: "scp173", name: "靜態觀測室", nameEn: "Still Observation Room", type: "scp", dimension: "scp", image: `${CDN}/dKXJxgurUWxIONYN.png`, message: "兔兔眨了眨眼，然後把緊張的空氣變成了一顆星星。", travelTime: 55, rarity: 3 },
  { id: "gentle-room", name: "害羞觀測室", nameEn: "Shy Observation Room", type: "scp", dimension: "scp", image: local("scp096"), message: "兔兔在玻璃窗前放下一顆愛心，走廊也變得不那麼孤單。", travelTime: 48, rarity: 2 },
  { id: "curious-workshop", name: "好奇升級工坊", nameEn: "Curiosity Workshop", type: "scp", dimension: "scp", image: local("scp914"), message: "一顆普通石頭變成星星，提醒兔兔：你也一直在變好。", travelTime: 54, rarity: 2 },
  { id: "site-lounge", name: "Site-19 茶點休息室", nameEn: "Site-19 Tea Lounge", type: "scp", dimension: "scp", image: local("scp_site19_lounge"), message: "在忙碌的設施裡，兔兔提醒大家先喝一口熱茶。", travelTime: 44, rarity: 1 },
  { id: "endless-hall", name: "無盡書庫長廊", nameEn: "Endless Archive Hall", type: "scp", dimension: "scp", image: local("scp_forest"), message: "跟著發亮的小腳印走，兔兔找到一個通往午後的出口。", travelTime: 57, rarity: 3 },
  { id: "tiny-friends-home", name: "小小鼠的苔蘚屋", nameEn: "Mossy Cottage", type: "chiikawa", dimension: "chiikawa", image: local("chiikawa_home"), message: "小小鼠把剛烤好的星形餅乾分給兔兔，今天的勇氣甜甜的。", travelTime: 40, rarity: 2 },
  { id: "tiny-friends-song", name: "藍耳貓的水晶洞", nameEn: "Crystal Cave Song", type: "chiikawa", dimension: "chiikawa", image: local("hachiware_cave"), message: "藍耳貓教兔兔唱一段旋律，連水晶也跟著輕輕發亮。", travelTime: 45, rarity: 2 },
  { id: "tiny-friends-meadow", name: "黃耳旅者的風箏草原", nameEn: "Kite Meadow", type: "chiikawa", dimension: "chiikawa", image: local("usagi_meadow"), message: "黃耳旅者拉著兔兔一起跳，快樂飛得比風箏還高。", travelTime: 35, rarity: 1 },
];

export const affirmations = [
  "你已經做得很好了", "今天也是美好的一天", "你的存在本身就是奇蹟", "每一步都是成長", "你值得被愛", "相信自己的直覺", "宇宙站在你這邊", "你的夢想值得被追求", "感謝今天的自己", "你有改變世界的力量", "你的笑容能照亮整個房間", "慢慢來，你正在正確的道路上", "今天的你比昨天更勇敢", "你是獨一無二的存在", "深呼吸，一切都會好起來", "你的善良讓世界更美好", "相信自己，你可以的", "每一顆星星都在為你閃耀", "你是自己的英雄", "量子跳躍的奇蹟，從一個正面念頭開始。",
];

export const bunnyLore = [
  "量子兔兔，誕生於一次正向意念的共振。", "兔兔沒有實體，因此不受任何傷害。它是純粹的善意化身。", "傳說中，兔兔的每一次微笑，都能讓一個平行宇宙綻放花朵。", "兔兔的耳朵能接收所有頻率的正能量，並將其轉化為旅行燃料。", "即使面對未知，兔兔也會說：「先深呼吸，然後一起看看。」", "兔兔的旅行不是為了逃避，而是為了把愛帶到每個角落。", "當兔兔閉上眼睛，整個宇宙都會安靜下來聽它的心跳。",
];

export const getRandomAffirmation = () => affirmations[Math.floor(Math.random() * affirmations.length)];
export const getRandomLore = () => bunnyLore[Math.floor(Math.random() * bunnyLore.length)];
export const getDestinationsByDimension = (dimension: Dimension) => destinations.filter((destination) => destination.dimension === dimension);
export function getRandomDestination(_collectedIds: string[], dimension: Dimension = "normal"): Destination | null {
  const available = getDestinationsByDimension(dimension);
  const weighted = available.flatMap((destination) => Array.from({ length: destination.rarity === 1 ? 5 : destination.rarity === 2 ? 3 : 1 }, () => destination));
  return weighted[Math.floor(Math.random() * weighted.length)] ?? null;
}
export function getDimensionName(dimension: Dimension) { return dimension === "normal" ? "地球與宇宙" : dimension === "cthulhu" ? "克蘇魯次元" : dimension === "scp" ? "SCP 次元" : "小小朋友次元"; }
export function getDimensionIcon(dimension: Dimension) { return dimension === "normal" ? "🌍" : dimension === "cthulhu" ? "🐙" : dimension === "scp" ? "🔒" : "🌼"; }
export function getDimensionColor(dimension: Dimension) { return dimension === "normal" ? "#7C65B1" : dimension === "cthulhu" ? "#2D5A27" : dimension === "scp" ? "#4A5568" : "#D977A6"; }
export const getPointsPerAffirmation = () => 1;
