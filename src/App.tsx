import { useEffect, useMemo, useRef, useState } from "react";
import { DIMENSIONS, affirmations, companions, destinations, lore, type Destination, type Dimension, type DestinationType } from "./data";

type Companion = (typeof companions)[number];
type Postcard = { id: string; destinationId: string; returnedAt: number };
type Journal = { id: string; destinationId: string; returnedAt: number; note: string; companion?: Companion };
type Trip = { destinationId: string; startTime: number; duration: number; dimension: Dimension };
type State = { points: number; pureEnergy: number; lastEnergyAt: number; postcards: Postcard[]; journal: Journal[]; trip: Trip | null; walls: Record<Exclude<Dimension, "normal">, boolean>; totalTrips: number; affirmation: string; lore: string; companion: Companion | null };

const KEY = "quantum-bunny-pwa-state-v1";
const ENERGY_RATE = 0.05;
const initial = (): State => ({ points: 0, pureEnergy: 0, lastEnergyAt: Date.now(), postcards: [], journal: [], trip: null, walls: { cthulhu: false, scp: false, tiny: false }, totalTrips: 0, affirmation: affirmations[0], lore: "兔兔把善意收進星系圍巾，準備出發。", companion: null });
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const realPure = (state: State, now = Date.now()) => state.pureEnergy + Math.floor(Math.max(0, now - state.lastEnergyAt) / 1000 * ENERGY_RATE);
const timeText = (secs: number) => secs >= 60 ? `${Math.ceil(secs / 60)} 分鐘` : `${Math.max(1, Math.ceil(secs))} 秒`;
const weather = () => { const hour = new Date().getHours(); return hour < 6 ? ["月色晴朗", "☾", "夜裡的星塵讓兔兔耳朵發亮。"] : hour < 11 ? ["晨光微風", "☀", "適合把一句鼓勵話交給宇宙。"] : hour < 17 ? ["雲朵晴天", "⛅", "今天的雲正好能承接慢慢走的心情。"] : hour < 20 ? ["金色傍晚", "◒", "把一天的溫柔收進口袋。"] : ["星河夜晚", "✦", "遠方的星星正替兔兔照亮回家路。"] };

function App() {
  const [state, setState] = useState<State>(() => {
    try { const raw = localStorage.getItem(KEY); if (!raw) return initial(); const saved = JSON.parse(raw) as Partial<State>; const base = { ...initial(), ...saved, walls: { ...initial().walls, ...saved.walls }, postcards: saved.postcards ?? [], journal: saved.journal ?? [] }; return { ...base, pureEnergy: Math.max(0, (base.pureEnergy ?? 0) + Math.floor((Date.now() - (base.lastEnergyAt ?? Date.now())) / 1000 * ENERGY_RATE)), lastEnergyAt: Date.now() }; } catch { return initial(); }
  });
  const [now, setNow] = useState(Date.now());
  const [page, setPage] = useState<"home" | "explore" | "album" | "journal">("home");
  const [dimension, setDimension] = useState<Dimension>("normal");
  const [filter, setFilter] = useState<DestinationType | "all">("all");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const settledTripStarts = useRef(new Set<number>());
  const pure = realPure(state, now);
  const activeTrip = state.trip ? destinations.find((x) => x.id === state.trip?.destinationId) : null;
  const tripProgress = state.trip ? Math.min(1, (now - state.trip.startTime) / (state.trip.duration * 1000)) : 0;
  const tripRemaining = state.trip ? Math.max(0, state.trip.duration - (now - state.trip.startTime) / 1000) : 0;
  const weatherNow = weather();
  const album = useMemo(() => [...state.postcards].reverse().map((card) => ({ card, destination: destinations.find((x) => x.id === card.destinationId)! })).filter((item) => item.destination && (filter === "all" || item.destination.type === filter)), [state.postcards, filter]);

  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* local saving may be disabled */ } }, [state]);
  useEffect(() => { const handler = (event: Event) => { event.preventDefault(); setDeferredPrompt(event as BeforeInstallPromptEvent); }; window.addEventListener("beforeinstallprompt", handler); return () => window.removeEventListener("beforeinstallprompt", handler); }, []);
  useEffect(() => {
    if (!state.trip || now - state.trip.startTime < state.trip.duration * 1000) return;
    const completedTrip = state.trip;
    if (settledTripStarts.current.has(completedTrip.startTime)) return;
    settledTripStarts.current.add(completedTrip.startTime);
    const destination = destinations.find((x) => x.id === completedTrip.destinationId); if (!destination) return;
    const companion = Math.random() < .35 ? pick(companions) : undefined;
    setState((s) => {
      if (!s.trip || s.trip.startTime !== completedTrip.startTime) return s;
      return { ...s, trip: null, totalTrips: s.totalTrips + 1, postcards: [...s.postcards, { id: `${Date.now()}-${Math.random()}`, destinationId: destination.id, returnedAt: Date.now() }], journal: [{ id: `${Date.now()}-${Math.random()}`, destinationId: destination.id, returnedAt: Date.now(), note: `${destination.name} 的風景像一封慢慢展開的信。兔兔把「${destination.message}」小心寫在日誌裡。`, ...(companion ? { companion } : {}) }, ...s.journal].slice(0, 30), companion: companion ?? null, lore: pick(lore) };
    });
    setToast(`兔兔從 ${destination.name} 帶回一張新明信片！`);
  }, [now, state.trip]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3200); return () => window.clearTimeout(timer); }, [toast]);

  const addEnergy = () => setState((s) => ({ ...s, points: s.points + 1, affirmation: pick(affirmations) }));
  const startTrip = (target: Dimension) => {
    if (state.trip) return setToast("兔兔已經在旅行中，等它寄回明信片吧。 ");
    if (target !== "normal" && !state.walls[target]) return setToast("這個次元還隔著一面需要突破的牆。 ");
    const cost = DIMENSIONS[target].cost;
    const actualPure = realPure(state);
    if (state.points < cost || actualPure < cost) return setToast(`需要 ${cost} 正能量與 ${cost} 純淨脫質。`);
    const options = destinations.filter((x) => x.dimension === target); const weighted = options.flatMap((x) => Array(x.rarity === 1 ? 5 : x.rarity === 2 ? 3 : 1).fill(x)); const destination = pick(weighted);
    const at = Date.now(); setState((s) => ({ ...s, points: s.points - cost, pureEnergy: Math.max(0, realPure(s, at) - cost), lastEnergyAt: at, trip: { destinationId: destination.id, startTime: at, duration: destination.travelTime, dimension: target } })); setPage("home"); setToast(`量子跳躍成功，兔兔朝 ${destination.name} 前進。`);
  };
  const unlock = (target: Exclude<Dimension, "normal">) => {
    const requirement = DIMENSIONS[target].unlock; const prerequisite = target === "cthulhu" || (target === "scp" ? state.walls.cthulhu : state.walls.scp);
    if (!prerequisite) return setToast("請先突破前一個次元壁。 ");
    if (realPure(state) < requirement) return setToast(`還需要 ${requirement} 純淨脫質才能突破。`);
    const at = Date.now(); setState((s) => ({ ...s, pureEnergy: Math.max(0, realPure(s, at) - requirement), lastEnergyAt: at, walls: { ...s.walls, [target]: true }, lore: `次元壁安靜地打開了。${target === "tiny" ? "新的小夥伴正在遠方揮手。" : "兔兔的善意又抵達了一個新世界。"}` })); setDimension(target); setToast(`${DIMENSIONS[target].label} 已解鎖！`);
  };
  const requestInstall = async () => { if (!deferredPrompt) return setToast("請點 Chrome 右上角 ⋮，選「加到主畫面」或「安裝應用程式」。"); await deferredPrompt.prompt(); await deferredPrompt.userChoice; setDeferredPrompt(null); };
  const reset = () => { if (window.confirm("要清除這台手機上的旅行進度嗎？此動作無法復原。")) { localStorage.removeItem(KEY); setState(initial()); setToast("旅行手帳已重新開始。 "); } };

  return <main className="app-shell">
    <header className="topbar"><div><p className="eyebrow">QUANTUM BUNNY FIELD NOTES</p><h1>量子兔兔旅行記</h1></div><button className="install-button" onClick={requestInstall}>⇩ 安裝到手機</button></header>
    <section className="stat-strip" aria-label="旅行資源"><div><span>正能量</span><strong>{state.points}</strong></div><div><span>純淨脫質</span><strong>{pure}</strong><small>每 20 秒 +1</small></div><div><span>旅行</span><strong>{state.totalTrips}</strong><small>無限收集</small></div></section>
    {page === "home" && <section className="page home-page">
      <article className="hero-card"><div className="stars">✦　·　✧　·　✦</div><div className="bunny" aria-hidden="true"><span className="ear ear-left"></span><span className="ear ear-right"></span><span className="face">✦‿✦</span><span className="scarf"></span></div><div className="hero-copy"><p>今日的量子軌跡</p><h2>{state.trip ? "兔兔正在穿越星海" : "兔兔在行李箱旁等待"}</h2><span>{state.trip ? `目的地：${activeTrip?.name ?? "未知星域"}` : state.lore}</span></div></article>
      {state.trip && <article className="trip-card"><div className="trip-head"><span>量子跳躍進行中</span><b>{timeText(tripRemaining)}</b></div><div className="progress"><i style={{ width: `${tripProgress * 100}%` }} /></div><p>兔兔正前往 <b>{activeTrip?.name}</b>，抵達後會帶回明信片和旅行日誌。</p></article>}
      <article className="weather-card"><span className="weather-icon">{weatherNow[1]}</span><div><p>{weatherNow[0]}</p><strong>{weatherNow[2]}</strong></div></article>
      <button className="affirmation-button" onClick={addEnergy}><span>說一句正向的話</span><b>「{state.affirmation}」</b><em>輕按收集 +1 正能量</em></button>
      <section className="section-heading"><div><p>旅行控制台</p><h2>選擇下一次跳躍</h2></div><span>{DIMENSIONS[dimension].icon} {DIMENSIONS[dimension].label}</span></section>
      <div className="dimension-chips">{(Object.keys(DIMENSIONS) as Dimension[]).map((item) => <button key={item} className={dimension === item ? `active ${DIMENSIONS[item].tone}` : ""} onClick={() => setDimension(item)} disabled={item !== "normal" && !state.walls[item]}>{DIMENSIONS[item].icon} {DIMENSIONS[item].label}</button>)}</div>
      <button className="leap-button" disabled={!!state.trip} onClick={() => startTrip(dimension)}><span>✦</span><div><b>量子跳躍</b><small>消耗 {DIMENSIONS[dimension].cost} 正能量＋脫質</small></div><i>›</i></button>
      {state.companion && <article className="companion-card"><span>{state.companion.emoji}</span><div><p>旅行夥伴・{state.companion.name}</p><b>{state.companion.greeting}</b></div><button onClick={() => setState((s) => ({ ...s, companion: null }))}>知道了</button></article>}
      <article className="install-card"><div><p>想像一般 App 一樣開啟？</p><b>從 Chrome 加到主畫面，旅行資料仍保存在這台手機。</b></div><button onClick={requestInstall}>{deferredPrompt ? "立即安裝" : "查看方法"}</button></article>
    </section>}
    {page === "explore" && <section className="page"><section className="section-heading"><div><p>DIMENSION ATLAS</p><h2>探索次元地圖</h2></div></section><p className="lead">每一個目的地都可重複前往；每次回來都會多一張屬於那次旅程的明信片。</p>
      {(Object.keys(DIMENSIONS) as Dimension[]).map((item) => { const locked = item !== "normal" && !state.walls[item]; const list = destinations.filter((x) => x.dimension === item); return <article className={`dimension-panel ${locked ? "locked" : ""}`} key={item}><div className="dimension-header"><div><span>{DIMENSIONS[item].icon}</span><div><p>{locked ? "尚未偵測到穩定入口" : "座標已穩定"}</p><h3>{DIMENSIONS[item].label}</h3></div></div>{locked ? <button onClick={() => unlock(item)}>{DIMENSIONS[item].unlock} 脫質突破</button> : <button onClick={() => { setDimension(item); startTrip(item); }}>前往跳躍</button>}</div><div className="destination-row">{list.map((place) => <button className="destination-mini" key={place.id} onClick={() => setSelected(place)}><img src={place.image} alt="" /><span>{place.name}</span></button>)}</div></article>; })}
    </section>}
    {page === "album" && <section className="page"><section className="section-heading"><div><p>POSTCARD ARCHIVE</p><h2>明信片相簿</h2></div><span>{state.postcards.length} 張</span></section><div className="filter-row">{(["all", "earth", "space", "cthulhu", "scp", "tiny"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "全部" : item === "earth" ? "地球" : item === "space" ? "宇宙" : item === "cthulhu" ? "微光深海" : item === "scp" ? "觀測" : "小小朋友"}</button>)}</div>{album.length ? <div className="postcard-grid">{album.map(({ card, destination }) => <button className="postcard" key={card.id} onClick={() => setSelected(destination)}><img src={destination.image} alt="" /><div><span>{destination.name}</span><small>{new Date(card.returnedAt).toLocaleDateString("zh-TW")}</small></div></button>)}</div> : <article className="empty"><span>✉</span><h3>相簿正在等第一張明信片</h3><p>完成一次量子跳躍後，兔兔會把風景寄回這裡。</p><button onClick={() => setPage("home")}>去準備旅行</button></article>}</section>}
    {page === "journal" && <section className="page"><section className="section-heading"><div><p>TRAVEL JOURNAL</p><h2>兔兔旅行日誌</h2></div></section>{state.journal.length ? <div className="journal-list">{state.journal.map((entry) => { const place = destinations.find((x) => x.id === entry.destinationId); return <article key={entry.id} className="journal-entry"><img src={place?.image} alt="" /><div><p>{new Date(entry.returnedAt).toLocaleString("zh-TW", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}　·　{place?.name}</p><h3>{entry.note}</h3>{entry.companion && <b>{entry.companion.emoji} 遇見 {entry.companion.name}</b>}</div></article>; })}</div> : <article className="empty"><span>⌁</span><h3>兔兔還沒寫下第一篇日誌</h3><p>旅行完成時，日誌會自動記錄那天的風景與心情。</p></article>}<button className="reset-link" onClick={reset}>重設本機旅行進度</button></section>}
    <nav className="bottom-nav" aria-label="主要導覽">{[["home", "⌂", "旅程"], ["explore", "⌁", "探索"], ["album", "▧", "相簿"], ["journal", "✎", "日誌"]].map(([id, icon, label]) => <button key={id} onClick={() => setPage(id as typeof page)} className={page === id ? "active" : ""}><span>{icon}</span>{label}</button>)}</nav>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><article className="postcard-modal" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><img src={selected.image} alt={selected.name} /><div><p>{DIMENSIONS[selected.dimension].label}・{selected.nameEn}</p><h2>{selected.name}</h2><blockquote>{selected.message}</blockquote><button className="modal-leap" onClick={() => { setSelected(null); setDimension(selected.dimension); startTrip(selected.dimension); }}>讓兔兔再次前往</button></div></article></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>;
}

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>; }
export default App;
